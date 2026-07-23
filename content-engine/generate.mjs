#!/usr/bin/env node
/**
 * TeeUpJobs content generator — produces a complete draft package for one video.
 *
 *   node content-engine/generate.mjs                  # topic from today's schedule
 *   node content-engine/generate.mjs coolest-five     # explicit topic
 *   node content-engine/generate.mjs high-pay
 *   node content-engine/generate.mjs employer-spotlight
 *   node content-engine/generate.mjs --dry            # select + print, write nothing
 *
 * Output: content-engine/drafts/YYYY-MM-DD-<slug>/
 *   script.md         — the talking spine to record (punch up flavor lines first)
 *   caption.txt       — post caption (copy rules applied)
 *   jobs.json         — the selected jobs, presentation order
 *   overlay/index.html— HyperFrames composition (drop recording at overlay/assets/spine.mp4)
 *
 * The featured ledger (state/featured.json) records used jobs on real (non-dry)
 * runs so the same job is not re-featured within RULES.noRepeatDays.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "../scripts/ingest/lib.mjs";
import { SCHEDULE, ROTATION, TOPICS } from "./config.mjs";
import { selectJobs, pickSpotlightEmployer, loadLedger, saveLedger } from "./lib/select.mjs";
import { buildScript } from "./lib/script.mjs";
import { buildCaption } from "./lib/caption.mjs";
import { buildOverlayHtml } from "./lib/overlay.mjs";
import { forDisplay } from "./lib/display.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const env = loadEnv(root);
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY ?? env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!SUPABASE_URL || !KEY) throw new Error("Missing Supabase env (.env / .env.local)");

const args = process.argv.slice(2).filter((a) => a !== "--dry");
const DRY = process.argv.includes("--dry");
const now = new Date();

// Resolve topic: explicit arg > today's schedule > coolest-five.
let topicKey = args[0];
if (!topicKey) {
  const slot = SCHEDULE[now.getDay()];
  topicKey = slot === "rotation" ? ROTATION[Math.floor(now.getTime() / 604800000) % ROTATION.length] : (slot ?? "coolest-five");
}
if (topicKey === "career-story") {
  console.log("career-story generates a research brief, not an auto-draft. Pick a subject and script it manually (see README).");
  process.exit(0);
}
const topic = TOPICS[topicKey];
if (!topic) throw new Error(`Unknown topic "${topicKey}". Options: ${Object.keys(TOPICS).join(", ")}`);

// Fetch the live board.
const res = await fetch(
  `${SUPABASE_URL}/rest/v1/jobs?status=eq.live&select=id,title,employer,location,city,state,role_category,job_type,comp_min,comp_max,comp_notes,cool_score,tags,experience_level,is_remote,apply_url,source_url,posted_at,status&limit=2000`,
  { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } },
);
const jobs = await res.json();
if (!Array.isArray(jobs)) throw new Error(`jobs fetch failed: ${JSON.stringify(jobs).slice(0, 200)}`);

const ledgerPath = resolve(here, "state/featured.json");
const ledger = loadLedger(ledgerPath);

// Employer spotlight narrows the pool to one brand first.
let pool = jobs;
let effectiveTopic = { ...topic };
if (topicKey === "employer-spotlight") {
  const emp = pickSpotlightEmployer(jobs, ledger, now);
  if (!emp) throw new Error("No brand-name employer with enough fresh roles for a spotlight.");
  pool = jobs.filter((j) => j.employer === emp);
  effectiveTopic.title = `${emp} Is Hiring: 5 Open Roles`;
  effectiveTopic.headline = topic.headline.replace("{EMPLOYER}", emp.toUpperCase());
  effectiveTopic.filter = () => true;
}

const { jobs: picked, short } = selectJobs(pool, effectiveTopic, ledger, { count: topic.count, now });
if (short) {
  console.error(`Only ${picked.length}/${topic.count} qualifying jobs for "${topicKey}". Not enough for a video.`);
  picked.forEach((j) => console.error(`  ${j._adj} ${j.employer} — ${j.title}`));
  process.exit(1);
}

const display = picked.map(forDisplay);
console.log(`Topic: ${effectiveTopic.title}`);
display.forEach((j, i) => console.log(`  ${i + 1}. [${j._adj}] ${j.employer} — ${j.title}${i === picked.length - 1 ? "  ← WINNER" : ""}`));

if (DRY) process.exit(0);

// Write the draft package.
const slug = `${now.toISOString().slice(0, 10)}-${topic.slug}`;
const out = resolve(here, "drafts", slug);
mkdirSync(resolve(out, "overlay/assets"), { recursive: true });

const mantraIndex = Math.floor(now.getTime() / 604800000);
writeFileSync(
  resolve(out, "meta.json"),
  JSON.stringify(
    { slug, topic: topicKey, title: effectiveTopic.title, headline: effectiveTopic.headline, date: now.toISOString(), mantraIndex, status: "draft" },
    null,
    2,
  ),
);
writeFileSync(resolve(out, "script.md"), buildScript({ topic: effectiveTopic, jobs: display, date: now, mantraIndex }));
writeFileSync(resolve(out, "caption.txt"), buildCaption({ topic: effectiveTopic, jobs: display, date: now }));
writeFileSync(resolve(out, "jobs.json"), JSON.stringify(picked, null, 2));
writeFileSync(resolve(out, "overlay/index.html"), buildOverlayHtml({ topic: effectiveTopic, jobs: display, date: now }));
writeFileSync(
  resolve(out, "overlay/assets/README.md"),
  "Drop the recorded talking spine here as spine.mp4, then preview with:\n  npx hyperframes preview\nfrom the overlay/ directory. Re-time beat data-start values to the recording (or run the assemble step) before rendering.\n",
);

// Ledger: mark featured.
for (const j of picked) ledger.featured.push({ jobId: j.id, slug, date: now.toISOString() });
saveLedger(ledgerPath, ledger);

console.log(`\nDraft package: content-engine/drafts/${slug}/`);
console.log("Next: punch up script.md, record the spine, drop it at overlay/assets/spine.mp4.");
