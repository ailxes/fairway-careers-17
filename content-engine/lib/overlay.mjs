// HyperFrames overlay composition emitter (1080x1920 vertical).
// Nate architecture: the recorded talking spine is the base layer (video+audio,
// framework-owned playback); mograph beats render over it in the locked house
// style (video-templates/system/mograph-language.md, template 10).
//
// Safe zones (video-edit-feedback-rules): job cards live in the TOP band
// (y 120-640) so nothing ever covers the mouth (~y1400). The end card is the
// only full-screen beat.
//
// Beat data-start values are generation-time defaults from script.mjs
// BEAT_TIMING. After recording, re-time them to the real audio (assemble step).
import { TOKENS, CTA_DOMAIN } from "../config.mjs";
import { beatStarts, BEAT_TIMING, totalDuration } from "./script.mjs";

const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function compChip(job) {
  if (typeof job.comp_min === "number") {
    const k = (n) => `$${Math.round(n / 1000)}k`;
    return job.comp_max && job.comp_max !== job.comp_min ? `${k(job.comp_min)}-${k(job.comp_max)}` : `${k(job.comp_min)}+`;
  }
  return job.comp_notes ?? null;
}

export function buildOverlayHtml({ topic, jobs, date }) {
  const n = jobs.length;
  const starts = beatStarts(n);
  const duration = totalDuration(n);
  const nextDay = date.getDay() === 1 ? "FRIDAY" : "MONDAY";

  const jobClips = jobs
    .map((job, i) => {
      const isWinner = i === n - 1;
      const start = starts.jobs[i];
      const dur = isWinner ? BEAT_TIMING.winner : BEAT_TIMING.job;
      const chips = [job.location, compChip(job), job.role_category].filter(Boolean);
      return `
    <section id="job-${i + 1}" class="clip job-card" data-start="${start}" data-duration="${dur}" data-track-index="1">
      ${isWinner ? `<div id="crown-${i + 1}" class="crown">COOLEST JOB THIS WEEK</div>` : ""}
      <div id="badge-${i + 1}" class="badge${isWinner ? " badge-gold" : ""}">${i + 1}</div>
      <div id="emp-${i + 1}" class="employer">${esc(job.employer)}</div>
      <div id="body-${i + 1}" class="card-body">
        <div id="title-${i + 1}" class="job-title">${esc(job.title)}</div>
        <div id="chips-${i + 1}" class="chips">${chips.map((c, ci) => `<span class="chip" id="chip-${i + 1}-${ci}">${esc(c)}</span>`).join("")}</div>
      </div>
    </section>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<title>${esc(topic.title)} — ${date.toISOString().slice(0, 10)}</title>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Montserrat:wght@700;900&display=swap');
  body { margin: 0; background: ${TOKENS.bg}; font-family: ${TOKENS.captionFont}; }
  #root { position: relative; width: 1080px; height: 1920px; overflow: hidden; background: ${TOKENS.bg}; }
  #spine { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
           filter: contrast(1.08) saturate(1.08) brightness(0.97); }
  #vignette { position: absolute; inset: 0; pointer-events: none;
              background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.42) 100%); }
  .clip { position: absolute; inset: 0; }

  /* Top-band card stack — never near the mouth zone */
  .job-card { padding: 120px 56px 0; }
  .badge { position: absolute; top: 120px; left: 56px; width: 128px; height: 128px; border-radius: 28px;
           background: ${TOKENS.accent}; color: ${TOKENS.ink}; font-family: ${TOKENS.displayFont};
           font-size: 84px; display: grid; place-items: center;
           box-shadow: 0 8px 40px rgba(0,0,0,.35); }
  .badge-gold { background: ${TOKENS.gold}; }
  .crown { position: absolute; top: 64px; left: 210px; background: ${TOKENS.gold}; color: ${TOKENS.ink};
           font-family: ${TOKENS.captionFont}; font-weight: 900; font-size: 34px; letter-spacing: 1px;
           padding: 12px 24px; border-radius: 12px; transform: rotate(-3deg);
           box-shadow: 0 8px 40px rgba(0,0,0,.35); }
  .employer { position: absolute; top: 142px; left: 210px; right: 56px; color: #fff;
              font-weight: 900; font-size: 52px; line-height: 1.05; text-transform: uppercase;
              text-shadow: 0 2px 8px rgba(0,0,0,.45); }
  .card-body { position: absolute; top: 288px; left: 56px; right: 56px; }
  .job-title { background: ${TOKENS.panel};
               color: ${TOKENS.ink}; border-radius: 24px; padding: 28px 32px; font-weight: 900;
               font-size: 46px; line-height: 1.12; box-shadow: 0 8px 40px rgba(0,0,0,.35); }
  .chips { margin-top: 20px; display: flex; gap: 14px; flex-wrap: wrap; }
  .chip { background: rgba(0,0,0,.75); color: #fff; font-weight: 700; font-size: 30px;
          padding: 12px 22px; border-radius: 14px; }
  .chip:first-child { background: ${TOKENS.accent}; color: ${TOKENS.ink}; }

  /* Intro headline — sound-off insurance */
  #intro-card { top: 120px; left: 56px; right: 56px; bottom: auto; height: auto; position: absolute; }
  #intro-headline { background: ${TOKENS.panel}; color: ${TOKENS.ink}; border-radius: 24px;
                    padding: 36px 40px; font-family: ${TOKENS.displayFont}; font-size: 64px;
                    line-height: 1.06; box-shadow: 0 8px 40px rgba(0,0,0,.35); }
  #intro-week { display: inline-block; margin-top: 18px; background: ${TOKENS.accent}; color: ${TOKENS.ink};
                font-weight: 900; font-size: 34px; padding: 10px 22px; border-radius: 12px; }

  /* End card — the only full-screen beat */
  #cta-bg { position: absolute; inset: 0; background: ${TOKENS.bg}; }
  #cta-domain { position: absolute; top: 820px; left: 56px; right: 56px; text-align: center;
                color: ${TOKENS.accent}; font-family: ${TOKENS.displayFont}; font-size: 92px; }
  #cta-line { position: absolute; top: 980px; left: 56px; right: 56px; text-align: center;
              color: #fff; font-weight: 700; font-size: 40px; }
  #cta-next { position: absolute; top: 1070px; left: 56px; right: 56px; text-align: center;
              color: rgba(255,255,255,.65); font-weight: 700; font-size: 34px; }
</style>
</head>
<body>
  <div id="root" data-composition-id="main" data-start="0" data-width="1080" data-height="1920" data-duration="${duration}">
    <video id="spine" src="assets/spine.mp4" data-start="0" data-duration="${duration}" data-track-index="0" muted playsinline></video>
    <audio id="spine-audio" src="assets/spine.mp4" data-start="0" data-duration="${duration}" data-track-index="10" data-volume="1"></audio>

    <section id="intro" class="clip" data-start="0" data-duration="${BEAT_TIMING.intro}" data-track-index="1">
      <div id="intro-card">
        <div id="intro-headline">${esc(topic.headline)}</div>
        <div id="intro-week">${date.toISOString().slice(0, 10)}</div>
      </div>
    </section>
${jobClips}
    <section id="cta" class="clip" data-start="${starts.cta}" data-duration="${BEAT_TIMING.cta}" data-track-index="1">
      <div id="cta-bg"></div>
      <div id="cta-domain">${CTA_DOMAIN.toUpperCase()}</div>
      <div id="cta-line">Every listing. Direct apply links. Free.</div>
      <div id="cta-next">NEW FIVE ON ${nextDay}</div>
    </section>

    <div id="vignette"></div>
  </div>

  <script>
    window.__timelines = window.__timelines || {};
    const tl = gsap.timeline({ paused: true });
    const POP = { scale: 0, opacity: 0, duration: 0.35, ease: "back.out(1.8)" };

    // Intro: headline spring, week pill follows.
    tl.from("#intro-headline", { ...POP, y: 40 }, 0.15);
    tl.from("#intro-week", { ...POP }, 0.45);

    const jobStarts = ${JSON.stringify(starts.jobs)};
    const N = ${n};
    jobStarts.forEach((t, i) => {
      const k = i + 1;
      tl.from("#badge-" + k, { scale: 0, opacity: 0, rotation: -8, duration: 0.35, ease: "back.out(2.2)" }, t + 0.1);
      tl.from("#emp-" + k, { x: -60, opacity: 0, duration: 0.3, ease: "power3.out" }, t + 0.25);
      tl.from("#title-" + k, { ...POP, y: 30 }, t + 0.4);
      tl.from("#chips-" + k + " .chip", { ...POP, stagger: 0.07 }, t + 0.6);
      // Idle drift on the title panel across the beat (finite, ease none).
      tl.to("#title-" + k, { scale: 1.02, duration: ${BEAT_TIMING.job} - 1, ease: "none" }, t + 0.8);
      if (k === N) {
        // Winner: rubber-stamp the crown, then a 3-frame shake.
        tl.from("#crown-" + k, { scale: 1.6, opacity: 0, rotation: -8, duration: 0.28, ease: "power4.in" }, t + 0.05);
        tl.to("#crown-" + k, { x: 6, duration: 0.05, repeat: 3, yoyo: true, ease: "none" }, t + 0.33);
      }
    });

    // End card.
    tl.from("#cta-domain", { ...POP, y: 30 }, ${starts.cta} + 0.15);
    tl.from("#cta-line", { opacity: 0, y: 20, duration: 0.3, ease: "power3.out" }, ${starts.cta} + 0.5);
    tl.from("#cta-next", { opacity: 0, duration: 0.3, ease: "power3.out" }, ${starts.cta} + 0.8);

    window.__timelines["main"] = tl;
  </script>
</body>
</html>`;
}
