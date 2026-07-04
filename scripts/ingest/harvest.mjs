#!/usr/bin/env node
/**
 * Automated harvester — runs on a schedule (GitHub Actions, MWF) with no human
 * in the loop. Flow:
 *   1. Run the Apify Google-Jobs actor for a rotating set of golf queries.
 *   2. Normalize + quality-gate every result (shared lib.mjs).
 *   3. Dedupe against everything already in the DB.
 *   4. Publish: high-confidence sources (employer ATS / golf boards) go LIVE;
 *      big-aggregator-only jobs land as PENDING for optional review.
 *   5. Expire stale auto-ingested jobs so the board stays fresh.
 *
 * Requires (from env / GitHub secrets):
 *   APIFY_TOKEN                 — apify.com → Settings → API tokens
 *   VITE_SUPABASE_URL           — already in .env
 *   SUPABASE_SERVICE_ROLE_KEY   — Supabase → Settings → API (bypasses RLS to publish)
 * Optional:
 *   AUTOPUBLISH_AGGREGATORS=true — also publish big-board jobs live (default: quarantine)
 *   HARVEST_DAY_INDEX=0|1|2      — which geo slice to run (defaults to today's M/W/F slot)
 */
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv, normalize, dedupeKey } from "./lib.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const env = loadEnv(root);

const APIFY_TOKEN = env.APIFY_TOKEN;
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!APIFY_TOKEN) throw new Error("APIFY_TOKEN missing (apify.com → Settings → API tokens).");
if (!SUPABASE_URL) throw new Error("VITE_SUPABASE_URL missing.");
if (!SERVICE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing (Supabase → Settings → API).");

const ACTOR = "johnvc~google-jobs-scraper---pay-per-result";
const AUTOPUBLISH_AGGREGATORS = env.AUTOPUBLISH_AGGREGATORS === "true";
const EXPIRE_AFTER_DAYS = Number(env.EXPIRE_AFTER_DAYS ?? 45);

// Category queries run EVERY time — these are the demand-weighted searches
// derived from the @coolgolfjobs comment research (what people actually seek).
const EVERGREEN_QUERIES = [
  { query: "golf brand marketing jobs" },
  { query: "golf merchandiser pro shop buyer jobs" },
  { query: "golf equipment design engineer jobs" },
  { query: "golf content creator social media jobs" },
  { query: "golf course superintendent" },
  { query: "golf professional jobs" },
  { query: "golf internship" },
];

// Geo slices rotate across M/W/F so we cover the country over a week without
// re-scraping the same metros every run. Each run picks one slice.
const GEO_SLICES = [
  ["Scottsdale, Arizona", "Atlanta, Georgia", "Dallas, Texas", "Naples, Florida"],
  ["San Diego, California", "Charleston, South Carolina", "Denver, Colorado", "Chicago, Illinois"],
  ["Palm Springs, California", "Myrtle Beach, South Carolina", "Orlando, Florida", "Phoenix, Arizona"],
];

function todaySlice() {
  if (env.HARVEST_DAY_INDEX != null) return Number(env.HARVEST_DAY_INDEX) % GEO_SLICES.length;
  // Mon→0, Wed→1, Fri→2 (fallback: day-of-year modulo)
  const dow = new Date().getUTCDay();
  return { 1: 0, 3: 1, 5: 2 }[dow] ?? Math.floor(Date.now() / 86400000) % GEO_SLICES.length;
}

async function apifyRun(input) {
  const res = await fetch(
    `https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) },
  );
  if (!res.ok) {
    console.warn(`  ! Apify run failed (${res.status}) for "${input.query}" — skipping`);
    return [];
  }
  return res.json();
}

const sb = (path, opts = {}) =>
  fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...(opts.headers ?? {}),
    },
  });

async function main() {
  const slice = todaySlice();
  const geos = GEO_SLICES[slice];
  console.log(`Harvest slice ${slice}: ${geos.join(", ")}`);

  // 1. Scrape
  const raw = [];
  for (const q of EVERGREEN_QUERIES) {
    const items = await apifyRun({ query: q.query, location: "United States", country: "us", num_results: 20, max_pagination: 2 });
    console.log(`  ${q.query}: ${items.length}`);
    raw.push(...items);
  }
  for (const location of geos) {
    const items = await apifyRun({ query: "golf jobs", location, country: "us", num_results: 25, max_pagination: 3 });
    console.log(`  golf jobs @ ${location}: ${items.length}`);
    raw.push(...items);
  }

  // 2. Normalize + gate
  const normalized = raw.map(normalize).filter(Boolean);

  // 3. Dedupe against the whole DB (service role sees all statuses)
  const existing = await (await sb("jobs?select=title,employer,source_url")).json();
  const seenKeys = new Set(existing.map((j) => `${j.title}::${j.employer}`.toLowerCase()));
  const seenUrls = new Set(existing.map((j) => j.source_url).filter(Boolean));
  const fresh = [];
  for (const row of normalized) {
    const k = dedupeKey(row);
    if (seenKeys.has(k) || (row.source_url && seenUrls.has(row.source_url))) continue;
    seenKeys.add(k);
    if (row.source_url) seenUrls.add(row.source_url);
    fresh.push(row);
  }

  // 4. Publish. High-confidence → live; aggregator-only → pending (unless flag).
  const toRow = (r, status) => {
    const { _confidence, ...rest } = r;
    return { ...rest, status };
  };
  const live = fresh.filter((r) => r._confidence === "high" || AUTOPUBLISH_AGGREGATORS).map((r) => toRow(r, "live"));
  const pending = fresh.filter((r) => r._confidence === "aggregator" && !AUTOPUBLISH_AGGREGATORS).map((r) => toRow(r, "pending"));

  for (const [label, rows] of [["live", live], ["pending", pending]]) {
    if (rows.length === 0) continue;
    const res = await sb("jobs", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(rows) });
    if (!res.ok) console.error(`  insert ${label} failed: ${res.status} ${await res.text()}`);
    else console.log(`  inserted ${rows.length} ${label}`);
  }

  // 5. Freshness sweep: expire auto-ingested jobs older than the window.
  const cutoff = new Date(Date.now() - EXPIRE_AFTER_DAYS * 86400000).toISOString();
  const exp = await sb(
    `jobs?status=eq.live&source=like.google-jobs*&posted_at=lt.${cutoff}`,
    { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ status: "expired" }) },
  );
  console.log(exp.ok ? `  expired stale auto-jobs older than ${EXPIRE_AFTER_DAYS}d` : `  expiry sweep failed: ${exp.status}`);

  console.log(`Done. ${live.length} live, ${pending.length} pending from ${raw.length} scraped.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
