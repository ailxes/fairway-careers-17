// Script builder — turns selected jobs into a recordable talking-spine script
// following the teardown formula (countdown, withheld winner, one flavor device
// per job, verbatim mantra, light CTA) and the master framework specs
// (hook withholds, ~3.5 wps, on-screen line readable <3s).
import { MANTRAS, CTA_DOMAIN } from "../config.mjs";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Beat timing defaults (seconds) — the overlay uses these until the recorded
// spine is synced (assemble step re-times data-start values to real audio).
export const BEAT_TIMING = { intro: 4, job: 15, winner: 18, cta: 5 };

export function totalDuration(jobCount) {
  return BEAT_TIMING.intro + BEAT_TIMING.job * Math.max(0, jobCount - 1) + BEAT_TIMING.winner + BEAT_TIMING.cta;
}

export function beatStarts(jobCount) {
  const starts = { intro: 0, jobs: [], cta: 0 };
  let t = BEAT_TIMING.intro;
  for (let i = 0; i < jobCount; i++) {
    starts.jobs.push(t);
    t += i === jobCount - 1 ? BEAT_TIMING.winner : BEAT_TIMING.job;
  }
  starts.cta = t;
  return starts;
}

function compLine(job) {
  if (typeof job.comp_min === "number") {
    const k = (n) => `$${Math.round(n / 1000)}k`;
    return job.comp_max && job.comp_max !== job.comp_min ? `${k(job.comp_min)}-${k(job.comp_max)}` : `${k(job.comp_min)}+`;
  }
  return job.comp_notes ?? null;
}

// One flavor device per job, chosen from its attributes (teardown §formula.3).
// Devices carry a small pool of draft lines so nothing repeats verbatim, and a
// per-video usage cap (2) forces variety across the five beats.
const TRANSFER = /accountant|accounting|analyst|engineer|software|developer|\bhr\b|human resources|\bit\b|help ?desk|finance|financial|data|scientist|project manager|supply chain|quality/i;
const PRESTIGE = /augusta|pebble|pinehurst|bandon|\btpc\b|whistling straits|kiawah|sawgrass|st\.? andrews|disney|pga tour(?! superstore)/i;
const RETAILISH = /superstore|galaxy|store|shop\b/i;

const DEVICE_LINES = {
  attainability: [
    `No golf resume required. This is the door. Walk through it.`,
    `You need zero experience for this one. That is the whole point.`,
  ],
  transfer: [
    `You already do this job somewhere boring. Do it where the product is golf.`,
    `Take the skills you have and change the scenery to a golf course.`,
  ],
  aspiration: [
    `Read the address again. People plan entire trips to where you would WORK.`,
    `Your commute would be a place most golfers never even get to visit.`,
  ],
  "quirky-title": [
    `Say the title out loud. That is a real business card someone gets to hand out.`,
    `That title alone wins every "what do you do" conversation at a wedding.`,
  ],
  money: [], // draft built inline with the comp figure
  relatable: [`[PUNCH UP: one relatable joke or insider fact about this role]`],
};

export function flavorDevice(job, used = {}) {
  const t = job.title ?? "";
  const te = `${t} ${job.employer ?? ""}`;
  const comp = compLine(job);

  // Candidate devices in priority order for THIS job.
  const candidates = [];
  if (PRESTIGE.test(te) && !RETAILISH.test(job.employer ?? "")) candidates.push("aspiration");
  if ((job.tags ?? []).includes("internships") || (job.tags ?? []).includes("no-experience")) candidates.push("attainability");
  if (TRANSFER.test(t)) candidates.push("transfer");
  if (comp) candidates.push("money");
  if (t.split(/\s+/).length >= 6) candidates.push("quirky-title");
  candidates.push("relatable");

  const device = candidates.find((d) => (used[d] ?? 0) < 2) ?? "relatable";
  const nth = used[device] ?? 0;
  used[device] = nth + 1;

  const draft =
    device === "money"
      ? nth === 0
        ? `It pays ${comp}. To be around golf all day.`
        : `${comp}. In golf. Read that again.`
      : DEVICE_LINES[device][Math.min(nth, DEVICE_LINES[device].length - 1)];
  return { device, draft };
}

export function buildScript({ topic, jobs, date, mantraIndex = 0 }) {
  const day = DAY_NAMES[date.getDay()];
  const nextDay = date.getDay() === 1 ? "Friday" : "Monday";
  const mantra = MANTRAS[mantraIndex % MANTRAS.length];
  const starts = beatStarts(jobs.length);
  const dur = totalDuration(jobs.length);

  const lines = [];
  lines.push(`# ${topic.title} — ${date.toISOString().slice(0, 10)}`);
  lines.push("");
  lines.push(`**Target:** ~${dur}s total. Pace ~3.5 words/sec. Each job beat is a complete, sendable unit.`);
  lines.push(`**Mantra this video (say verbatim):** "${mantra}"`);
  lines.push(`**Headline card (on screen 0-2s):** ${topic.headline}`);
  lines.push("");
  lines.push(`## Opener (0:00 - 0:0${BEAT_TIMING.intro}) — max 20 words`);
  lines.push("");
  lines.push(`> It's ${day}. I found the five coolest jobs in golf this week, and number five is ridiculous.`);
  lines.push("");
  lines.push(`*Delivery: straight to camera, no warm-up, no intro of yourself. The countdown IS the hook.*`);
  lines.push("");

  const usedDevices = {};
  jobs.forEach((job, i) => {
    const n = i + 1;
    const isWinner = n === jobs.length;
    const { device, draft } = flavorDevice(job, usedDevices);
    const comp = compLine(job);
    const meta = [job.location, comp, job.job_type].filter(Boolean).join(" · ");
    const mm = Math.floor(starts.jobs[i] / 60), ss = String(Math.round(starts.jobs[i] % 60)).padStart(2, "0");
    lines.push(`## ${isWinner ? `Job ${n} - THE COOLEST JOB THIS WEEK` : `Job ${n}`} (${mm}:${ss}) — 25-35 words`);
    lines.push("");
    lines.push(`**${job.employer}** is hiring: **${job.title}**${meta ? ` (${meta})` : ""}`);
    lines.push("");
    if (isWinner) lines.push(`> Number five. The coolest job in golf this week. ${job.employer}. ${job.title}.`);
    else lines.push(`> ${n === 1 ? "First up" : `Number ${n}`}: ${job.employer} is hiring: ${job.title}.`);
    lines.push(`> ${draft}`);
    lines.push("");
    lines.push(`*Flavor device: ${device}. ${draft.includes("[PUNCH UP") ? "NEEDS PUNCH-UP before recording." : "Punch up if you have something better — one device only, keep it under 15 words."}*`);
    lines.push(`*Apply link: ${job.apply_url ?? job.source_url ?? "(on the board)"}*`);
    lines.push("");
  });

  const cm = Math.floor(starts.cta / 60), cs = String(Math.round(starts.cta % 60)).padStart(2, "0");
  lines.push(`## Mantra + CTA (${cm}:${cs}) — max 15 words`);
  lines.push("");
  lines.push(`> ${mantra} Every listing is live at ${CTA_DOMAIN}. New five on ${nextDay}.`);
  lines.push("");
  lines.push(`*Delivery: slow down slightly. The last line closes the loop opened in the first line.*`);
  lines.push("");
  lines.push(`---`);
  lines.push(`## Pre-record checklist`);
  lines.push(`- [ ] Every [PUNCH UP] resolved`);
  lines.push(`- [ ] One device per job, none repeated more than twice`);
  lines.push(`- [ ] Mantra said verbatim`);
  lines.push(`- [ ] No em dashes anywhere in caption, no promised outcomes or timeframes`);
  lines.push(`- [ ] Record VERTICAL (portrait), eye level, face in the lower two-thirds (top third belongs to the job cards)`);
  lines.push(`- [ ] Say the beat markers exactly as written ("First up", "Number two"...) so the assembler can sync overlays`);

  return lines.join("\n");
}
