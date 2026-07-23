#!/usr/bin/env node
/**
 * One-off backfill: recompute cool_score for every job with the editorial
 * scorer in cool-score.mjs. Does NOT touch employer/employer_slug on existing
 * rows (slug stability > name hygiene; cleanup applies to future ingests).
 *
 *   node scripts/ingest/rescore.mjs           # dry run — prints distribution
 *   node scripts/ingest/rescore.mjs --write   # apply updates
 */
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "./lib.mjs";
import { coolScore } from "./cool-score.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const env = loadEnv(root);
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) throw new Error("Missing VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
const WRITE = process.argv.includes("--write");

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

const jobs = await (await sb("jobs?select=id,title,employer,role_category,comp_min,cool_score&limit=5000")).json();
if (!Array.isArray(jobs)) throw new Error(`fetch failed: ${JSON.stringify(jobs).slice(0, 300)}`);

const changes = [];
const hist = {};
for (const j of jobs) {
  const next = coolScore({ title: j.title, employer: j.employer, category: j.role_category, comp_min: j.comp_min });
  hist[Math.floor(next / 10) * 10] = (hist[Math.floor(next / 10) * 10] ?? 0) + 1;
  if (next !== j.cool_score) changes.push({ id: j.id, cool_score: next });
}

console.log(`${jobs.length} jobs, ${changes.length} score changes.`);
console.log("New distribution:", Object.entries(hist).sort((a, b) => a[0] - b[0]).map(([b, n]) => `${b}s:${n}`).join("  "));

if (!WRITE) {
  console.log("Dry run — pass --write to apply.");
  process.exit(0);
}

let done = 0;
for (const c of changes) {
  const res = await sb(`jobs?id=eq.${c.id}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ cool_score: c.cool_score }),
  });
  if (!res.ok) console.error(`  patch ${c.id} failed: ${res.status}`);
  else done++;
}
console.log(`Updated ${done}/${changes.length}.`);
