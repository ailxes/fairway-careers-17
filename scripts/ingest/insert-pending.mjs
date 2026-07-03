#!/usr/bin/env node
/**
 * Ingest pipeline, step 2 of 2.
 *
 * Step 1 is running a job-discovery scraper (Apify Google Jobs actor) which
 * produces a JSON array of postings. This script normalizes those postings
 * into our jobs schema and inserts them as status='pending' via the public
 * anon key — RLS already allows anonymous pending inserts, and everything
 * goes through human review in /admin before it's live. No new secrets.
 *
 * Usage: node scripts/ingest/insert-pending.mjs path/to/items.json
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

// Minimal .env parser (no dotenv dependency)
const env = Object.fromEntries(
  readFileSync(resolve(root, ".env"), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => [
      l.slice(0, l.indexOf("=")).trim(),
      l.slice(l.indexOf("=") + 1).trim().replace(/^["']|["']$/g, ""),
    ]),
);
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!SUPABASE_URL || !KEY) throw new Error("Missing Supabase env in .env");

const STATE_MAP = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado",
  CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho",
  IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina",
  ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas",
  UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia",
  WI: "Wisconsin", WY: "Wyoming", DC: "District of Columbia",
};
const FULL_STATES = new Set(Object.values(STATE_MAP).map((s) => s.toLowerCase()));

// Keyword → canonical role_category (first match wins, order matters)
const CATEGORY_RULES = [
  [/superintendent|turf|agronom|grounds|greenkeep/i, "Agronomy"],
  [/caddie|caddy|looper/i, "Caddie"],
  [/architect|course design/i, "Architecture"],
  [/engineer|developer|software|hardware|firmware/i, "Engineering"],
  [/photograph|video|content|social media|editor|media|writer|journalis|producer/i, "Media"],
  [/merchandis|buyer|retail|shop attendant/i, "Merchandising"],
  [/marketing|brand manager|growth|seo/i, "Marketing"],
  [/sales|account exec|territory|business development|rep\b/i, "Sales"],
  [/instructor|teaching|coach|academy/i, "Instruction"],
  [/fitness|trainer|performance|physio/i, "Fitness"],
  [/server|bartend|food|beverage|hospitality|concierge|guest|event/i, "Hospitality"],
  [/head professional|golf professional|assistant professional|director of golf|pga/i, "Professional"],
  [/operations|outside service|cart|starter|ranger|bag room|attendant/i, "Operations"],
];

function categorize(title, description) {
  for (const [re, cat] of CATEGORY_RULES) if (re.test(title)) return cat;
  for (const [re, cat] of CATEGORY_RULES) if (re.test(description ?? "")) return cat;
  return "Operations";
}

function parseLocation(loc) {
  // "Scottsdale, AZ" | "Scottsdale, AZ, United States" | "Arizona" | "Anywhere"
  if (!loc) return { city: null, state: null, location: null };
  const parts = loc.split(",").map((p) => p.trim()).filter((p) => p && !/united states|usa/i.test(p));
  let city = null, state = null;
  for (const p of parts) {
    if (STATE_MAP[p.toUpperCase()]) state = STATE_MAP[p.toUpperCase()];
    else if (FULL_STATES.has(p.toLowerCase())) state = p.replace(/\b\w/g, (c) => c.toUpperCase());
    else if (!city) city = p;
  }
  return { city, state, location: parts.join(", ") || null };
}

function autoTags(title, jobType) {
  const tags = [];
  const t = `${title} ${jobType ?? ""}`.toLowerCase();
  if (/intern/.test(t)) tags.push("internships");
  if (/no experience|entry level|entry-level|trainee/.test(t)) tags.push("no-experience");
  return tags;
}

function coolScore(cat, title) {
  // Modest heuristic prior; the editor tunes it in admin.
  let s = 74;
  if (/augusta|pebble|pinehurst|bandon|tour|pga tour/i.test(title)) s += 14;
  if (["Media", "Caddie", "Architecture"].includes(cat)) s += 8;
  if (["Engineering", "Instruction"].includes(cat)) s += 5;
  return Math.min(s, 96);
}

// ---- normalize (field names per gio21/google-jobs-scraper output:
// title, companyName, location, description, jobType, workFromHome,
// salaryMin/salaryMax/salaryCurrency/salaryPeriod, applyOptions[{network,url,directApply}],
// postedVia, postedAtIso, jobId) ----
// Rows where the "employer" is actually a job board are dropped — listing
// "GolfJobs.com" as an employer on our board is wrong data AND free
// advertising for a competitor.
const BOARD_EMPLOYERS = /golfjobs\.com|gcsaa|superintendents association|indeed|ziprecruiter|bebee|jobleads|linkedin|monster|upwork|agmgolf/i;

// Apply links: Google Jobs results include spam mirrors ("apply on
// random-hotel-site.it"). Only accept direct-apply links or known networks;
// a job nobody can apply to is not inventory, so linkless rows are dropped.
const TRUSTED_APPLY = /indeed\.com|ziprecruiter\.com|linkedin\.com|glassdoor\.com|monster\.com|careerbuilder\.com|gcsaa\.org|agmgolf\.org|makegolfyourcareer\.org|teamworkonline\.com|governmentjobs\.com|usajobs\.gov|applytojob\.com|jazzhr|workday|greenhouse\.io|lever\.co|paylocity|paycom|adp\.com|dickssportinggoods\.jobs/i;

// Employer-owned ATS beats aggregator re-listings — applicants land on the
// company's real posting, and those links rot slowest.
const EMPLOYER_ATS = /myworkdayjobs|workday|greenhouse\.io|lever\.co|applytojob\.com|jazzhr|paylocity|paycom|teamworkonline|governmentjobs\.com|usajobs\.gov|taleo\.net|oraclecloud\.com|icims\.com|smartrecruiters/i;

function pickApplyLink(item) {
  // gio21 shape: applyOptions[{url, directApply}] · johnvc shape: apply_options[{title, link}]
  const raw = item.applyOptions ?? item.apply_options ?? [];
  const opts = (Array.isArray(raw) ? raw : []).map((a) => ({ url: a?.url ?? a?.link, direct: !!a?.directApply })).filter((a) => a.url);
  return (
    opts.find((a) => a.direct)?.url ??
    opts.find((a) => EMPLOYER_ATS.test(a.url))?.url ??
    opts.find((a) => TRUSTED_APPLY.test(a.url))?.url ??
    null
  );
}

function normalize(item) {
  const title = item.title;
  const employer = item.companyName ?? item.company_name ?? item.employer;
  if (!title || !employer) return null;
  if (BOARD_EMPLOYERS.test(employer)) return null;

  const ext = item.detected_extensions ?? {};
  const { city, state, location } = parseLocation(item.location);
  const remote =
    Boolean(item.workFromHome ?? ext.work_from_home) || /anywhere|remote/i.test(item.location ?? "");
  const applyLink = pickApplyLink(item);
  if (!applyLink) return null;

  // Some actors return empty descriptions — template a minimal one so job
  // pages and JSON-LD aren't blank. Editors enrich the keepers in admin.
  const desc =
    (item.description ?? "").trim().slice(0, 1400) ||
    `${title} at ${employer}${location ? ` in ${location}` : ""}. Apply directly with the employer — full details at the application link.`;
  const cat = categorize(title, desc);

  // Salary: only treat as annual comp when the period says so; hourly/other
  // goes to comp_notes so we never render "$25k – $35k" for an hourly wage.
  let comp_min = null, comp_max = null, comp_notes = null;
  const period = (item.salaryPeriod ?? "").toLowerCase();
  const usd = !item.salaryCurrency || item.salaryCurrency === "USD";
  if (usd && typeof item.salaryMin === "number") {
    if (period.startsWith("year")) {
      comp_min = Math.round(item.salaryMin);
      comp_max = typeof item.salaryMax === "number" ? Math.round(item.salaryMax) : null;
    } else if (period.startsWith("hour")) {
      const hi = typeof item.salaryMax === "number" ? `–${Math.round(item.salaryMax)}` : "";
      comp_notes = `$${Math.round(item.salaryMin)}${hi}/hr`;
    }
  } else if (typeof ext.salary === "string" && ext.salary) {
    // johnvc shape: salary arrives as display text ("60K–80K a year")
    comp_notes = ext.salary.slice(0, 120);
  }

  return {
    title: String(title).slice(0, 120),
    employer: String(employer).slice(0, 120),
    employer_slug: String(employer).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    location, city, state,
    role_category: cat,
    job_type: item.jobType ?? ext.schedule_type ?? null,
    is_remote: remote,
    comp_min, comp_max, comp_notes,
    perks: [],
    description: desc || null,
    apply_url: applyLink,
    source: `google-jobs${(item.postedVia ?? item.via) ? ` via ${item.postedVia ?? item.via}` : ""}`,
    source_url: item.share_link ?? applyLink,
    cool_score: coolScore(cat, title),
    tags: autoTags(title, item.jobType),
    status: "pending",
  };
}

// ---- main ----
// Two modes:
//   node insert-pending.mjs items.json                  (local file)
//   node insert-pending.mjs --dataset <id> [<id> ...]   (fetch straight from
//     Apify — requires APIFY_TOKEN in .env.local, .env, or the environment;
//     get one at apify.com → Settings → API tokens. Zero manual copying.)
let items = [];
if (process.argv[2] === "--dataset") {
  const token =
    process.env.APIFY_TOKEN ??
    (() => {
      try {
        const local = readFileSync(resolve(root, ".env.local"), "utf8");
        return local.match(/^APIFY_TOKEN=["']?([^"'\n]+)/m)?.[1];
      } catch {
        return env.APIFY_TOKEN;
      }
    })();
  if (!token) throw new Error("APIFY_TOKEN not found. Add it to .env.local (gitignored) — apify.com → Settings → API tokens.");
  const ids = process.argv.slice(3);
  if (ids.length === 0) throw new Error("Usage: node insert-pending.mjs --dataset <id> [<id> ...]");
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

// Dedupe against live board (public read) + within batch
const liveRes = await fetch(`${SUPABASE_URL}/rest/v1/jobs?status=eq.live&select=title,employer,source_url`, { headers });
const live = await liveRes.json();
const seen = new Set(live.map((j) => `${j.title}::${j.employer}`.toLowerCase()));
const seenUrls = new Set(live.map((j) => j.source_url).filter(Boolean));

const rows = [];
for (const item of items) {
  const row = normalize(item);
  if (!row) continue;
  const key = `${row.title}::${row.employer}`.toLowerCase();
  if (seen.has(key) || (row.source_url && seenUrls.has(row.source_url))) continue;
  seen.add(key);
  if (row.source_url) seenUrls.add(row.source_url);
  rows.push(row);
}

console.log(`Parsed ${items.length} scraped items → ${rows.length} new pending rows (deduped ${items.length - rows.length}).`);
if (rows.length === 0) process.exit(0);

async function insert(payload) {
  return fetch(`${SUPABASE_URL}/rest/v1/jobs`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify(payload),
  });
}

let ins = await insert(rows);
if (!ins.ok) {
  const errText = await ins.text();
  if (errText.includes("PGRST204")) {
    // Pre-migration DB: taxonomy columns don't exist yet. Insert without
    // them — remote/tags can be re-curated in admin after the migration runs.
    console.warn("Taxonomy columns missing (migration not run yet) — inserting without is_remote/tags/experience_level.");
    ins = await insert(rows.map(({ is_remote, tags, experience_level, ...rest }) => rest));
  }
  if (!ins.ok) {
    console.error("Insert failed:", ins.status, await ins.text().catch(() => errText));
    process.exit(1);
  }
}
console.log(`Inserted ${rows.length} pending jobs. Review + approve in /admin.`);
