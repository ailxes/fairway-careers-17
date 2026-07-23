// Job selection for a content slot: score-ranked, freshness-weighted,
// employer/category-capped, no-repeat via the featured ledger.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { RULES } from "../config.mjs";

export function loadLedger(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return { featured: [] }; // [{ jobId, slug, date }]
  }
}

export function saveLedger(path, ledger) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(ledger, null, 2));
}

export function recentlyFeaturedIds(ledger, now = new Date()) {
  const cutoff = now.getTime() - RULES.noRepeatDays * 86400000;
  return new Set(ledger.featured.filter((f) => new Date(f.date).getTime() > cutoff).map((f) => f.jobId));
}

function adjustedScore(job, now = new Date()) {
  let s = job.cool_score ?? 0;
  const posted = new Date(job.posted_at).getTime();
  const ageDays = (now.getTime() - posted) / 86400000;
  if (ageDays <= 10) s += RULES.freshBoost10d;
  else if (ageDays <= 21) s += RULES.freshBoost21d;
  return s;
}

/**
 * Pick `count` jobs for a topic. Returns them in PRESENTATION order:
 * slot 1 opens strong (2nd-best), slots 2-4 descend, the best job is slot 5 —
 * the "coolest job this week" is always revealed last (teardown: withheld winner).
 */
export function selectJobs(jobs, topic, ledger, { count = 5, now = new Date() } = {}) {
  const used = recentlyFeaturedIds(ledger, now);
  const pool = jobs
    .filter((j) => j.status === "live" && !used.has(j.id) && topic.filter(j))
    .map((j) => ({ ...j, _adj: adjustedScore(j, now) }))
    .filter((j) => j._adj >= RULES.minScore)
    .sort((a, b) => b._adj - a._adj);

  const picked = [];
  const byEmployer = {};
  const byCategory = {};
  for (const j of pool) {
    if (picked.length >= count) break;
    const emp = (j.employer ?? "").toLowerCase().trim();
    const cat = j.role_category ?? "?";
    if ((byEmployer[emp] ?? 0) >= RULES.perEmployerCap) continue;
    if ((byCategory[cat] ?? 0) >= RULES.perCategoryCap) continue;
    byEmployer[emp] = (byEmployer[emp] ?? 0) + 1;
    byCategory[cat] = (byCategory[cat] ?? 0) + 1;
    picked.push(j);
  }
  if (picked.length < count) return { jobs: picked, short: true };

  // picked is descending by score: [best, 2nd, 3rd, 4th, 5th].
  // Presentation: [2nd, 3rd, 4th, 5th, best].
  const [best, ...rest] = picked;
  return { jobs: [...rest, best], short: false };
}

/** For employer-spotlight: brand-name employer with the most fresh live roles. */
export function pickSpotlightEmployer(jobs, ledger, now = new Date()) {
  const used = recentlyFeaturedIds(ledger, now);
  const counts = {};
  for (const j of jobs) {
    if (j.status !== "live" || used.has(j.id)) continue;
    if ((j.cool_score ?? 0) < 80) continue; // brand-name band only
    const k = j.employer;
    counts[k] = (counts[k] ?? 0) + 1;
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return top ? top[0] : null;
}
