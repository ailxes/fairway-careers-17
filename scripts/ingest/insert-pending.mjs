#!/usr/bin/env node
/**
 * Manual inserter — stages jobs as PENDING for human review in /admin.
 * Use for one-off backfills from a JSON file or an Apify dataset id.
 * (The automated MWF pipeline is harvest.mjs, which publishes directly.)
 *
 * Modes:
 *   node insert-pending.mjs items.json                   (local file)
 *   node insert-pending.mjs --dataset <id> [<id> ...]    (fetch from Apify; needs APIFY_TOKEN)
 *
 * Uses the public/anon key (VITE_SUPABASE_PUBLISHABLE_KEY) which can only
 * insert pending rows — safe. Publishing to live happens in /admin.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv, normalize, dedupeKey } from "./lib.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const env = loadEnv(root);
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!SUPABASE_URL || !KEY) throw new Error("Missing Supabase env in .env");

// ---- input ----
let items = [];
if (process.argv[2] === "--dataset") {
  const token = env.APIFY_TOKEN;
  if (!token) throw new Error("APIFY_TOKEN not found (put it in .env.local).");
  const ids = process.argv.slice(3);
  if (!ids.length) throw new Error("Usage: node insert-pending.mjs --dataset <id> [<id> ...]");
  for (const id of ids) {
    const res = await fetch(`https://api.apify.com/v2/datasets/${id}/items?clean=true&token=${token}`);
    if (!res.ok) throw new Error(`Dataset ${id} fetch failed: ${res.status}`);
    const batch = await res.json();
    console.log(`Dataset ${id}: ${batch.length} items`);
    items.push(...batch);
  }
} else {
  const file = process.argv[2];
  if (!file) throw new Error("Usage: node insert-pending.mjs <items.json | --dataset id...>");
  items = JSON.parse(readFileSync(resolve(file), "utf8"));
}

const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

// Dedupe against the live board (anon can only read live) + within batch.
const live = await (await fetch(`${SUPABASE_URL}/rest/v1/jobs?status=eq.live&select=title,employer,source_url`, { headers })).json();
const seen = new Set(live.map((j) => `${j.title}::${j.employer}`.toLowerCase()));
const seenUrls = new Set(live.map((j) => j.source_url).filter(Boolean));

const rows = [];
for (const item of items) {
  const norm = normalize(item);
  if (!norm) continue;
  const { _confidence, ...row } = norm;
  const k = dedupeKey(row);
  if (seen.has(k) || (row.source_url && seenUrls.has(row.source_url))) continue;
  seen.add(k);
  if (row.source_url) seenUrls.add(row.source_url);
  rows.push({ ...row, status: "pending" });
}

console.log(`Parsed ${items.length} scraped items → ${rows.length} new pending rows.`);
if (!rows.length) process.exit(0);

async function insert(payload) {
  return fetch(`${SUPABASE_URL}/rest/v1/jobs`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify(payload),
  });
}

let res = await insert(rows);
if (!res.ok) {
  const errText = await res.text();
  if (errText.includes("PGRST204")) {
    // Pre-migration DB: taxonomy columns don't exist yet.
    console.warn("Taxonomy columns missing (migration not run) — inserting without is_remote/tags/experience_level.");
    res = await insert(rows.map(({ is_remote, tags, experience_level, ...rest }) => rest));
  }
  if (!res.ok) {
    console.error("Insert failed:", res.status, await res.text().catch(() => errText));
    process.exit(1);
  }
}
console.log(`Inserted ${rows.length} pending jobs. Review + approve in /admin.`);
