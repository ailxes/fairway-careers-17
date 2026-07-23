#!/usr/bin/env node
/**
 * Assemble step — sync the overlay to the recorded talking spine.
 *
 *   node content-engine/assemble.mjs <draft-slug>
 *
 * Requires overlay/assets/spine.mp4 in the draft. Flow:
 *   1. Extract audio (ffmpeg) and transcribe with whisper-cpp (word-level JSON).
 *   2. Find each beat's anchor phrase in the transcript ("first up",
 *      "number two", ... "number five", the CTA's "teeupjobs"/mantra).
 *   3. Rebuild overlay/index.html with real data-start values and the
 *      recording's true duration. Unfound anchors interpolate proportionally.
 *   4. meta.json → status "assembled" (+ beat table for the studio UI).
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { buildOverlayHtml } from "./lib/overlay.mjs";
import { forDisplay } from "./lib/display.mjs";
import { beatStarts } from "./lib/script.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const slug = process.argv[2];
if (!slug) throw new Error("Usage: node content-engine/assemble.mjs <draft-slug>");
const draft = resolve(here, "drafts", slug);
const spine = resolve(draft, "overlay/assets/spine.mp4");
if (!existsSync(spine)) throw new Error(`No recording at ${spine}`);

const WHISPER_MODEL = resolve(homedir(), ".cache/hyperframes/whisper/models/ggml-small.en.bin");
const meta = JSON.parse(readFileSync(resolve(draft, "meta.json"), "utf8"));
const jobs = JSON.parse(readFileSync(resolve(draft, "jobs.json"), "utf8")).map(forDisplay);
const n = jobs.length;

// 1. Transcribe.
const wav = resolve(draft, "overlay/assets/spine.wav");
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", spine, "-ar", "16000", "-ac", "1", wav]);
const durOut = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", spine]);
const duration = Math.round(parseFloat(String(durOut)) * 100) / 100;
execFileSync("whisper-cli", ["-m", WHISPER_MODEL, "-f", wav, "-oj", "-of", resolve(draft, "overlay/assets/spine"), "--no-prints"]);
const tx = JSON.parse(readFileSync(resolve(draft, "overlay/assets/spine.json"), "utf8"));

// Flatten to a word stream with start times (seconds).
const words = [];
for (const seg of tx.transcription ?? []) {
  const segWords = String(seg.text).trim().split(/\s+/).filter(Boolean);
  const from = seg.offsets.from / 1000, to = seg.offsets.to / 1000;
  const step = segWords.length ? (to - from) / segWords.length : 0;
  segWords.forEach((w, i) => words.push({ w: w.toLowerCase().replace(/[^a-z0-9$]/g, ""), t: from + i * step }));
}
const findPhrase = (phrases, fromT = 0) => {
  for (const phrase of phrases) {
    const parts = phrase.split(" ");
    for (let i = 0; i < words.length - parts.length + 1; i++) {
      if (words[i].t < fromT) continue;
      if (parts.every((p, k) => words[i + k].w === p)) return words[i].t;
    }
  }
  return null;
};

// 2. Anchor phrases per beat.
const NUM_WORDS = [null, null, "two", "three", "four", "five"];
const anchors = [];
for (let i = 1; i <= n; i++) {
  const prev = anchors.filter(Boolean).at(-1) ?? 0;
  anchors.push(
    i === 1
      ? findPhrase(["first up", "number one", "number 1"], 1)
      : findPhrase([`number ${NUM_WORDS[i]}`, `number ${i}`], prev + 2),
  );
}
const ctaAnchor = findPhrase(["teeupjobs", "tee up jobs", "every one of these is real", "every listing is live"], (anchors.filter(Boolean).at(-1) ?? 0) + 2);

// 3. Fill gaps proportionally against the default spacing.
const def = beatStarts(n);
const defaultTotal = def.cta + 5;
const scale = duration / defaultTotal;
const jobStarts = anchors.map((a, i) => (a != null ? Math.max(0.5, a - 0.4) : +(def.jobs[i] * scale).toFixed(2)));
const ctaStart = ctaAnchor != null ? Math.max(jobStarts[n - 1] + 2, ctaAnchor - 0.3) : +(def.cta * scale).toFixed(2);
const missing = anchors.map((a, i) => (a == null ? i + 1 : null)).filter(Boolean);

const starts = { intro: 0, jobs: jobStarts, cta: ctaStart };
const topicLike = { title: meta.title, headline: meta.headline };
writeFileSync(resolve(draft, "overlay/index.html"), buildOverlayHtml({ topic: topicLike, jobs, date: new Date(meta.date), starts, duration }));

// 4. Record in meta.
meta.status = "assembled";
meta.assembled = { duration, jobStarts, ctaStart, missingAnchors: missing, at: new Date().toISOString() };
writeFileSync(resolve(draft, "meta.json"), JSON.stringify(meta, null, 2));

console.log(`Assembled ${slug}: ${duration}s recording.`);
jobStarts.forEach((t, i) => console.log(`  job ${i + 1} @ ${t}s${missing.includes(i + 1) ? "  (interpolated — anchor not heard)" : ""}`));
console.log(`  CTA @ ${ctaStart}s`);
if (missing.length) console.log(`Check beats ${missing.join(", ")} by eye in the studio before rendering.`);
