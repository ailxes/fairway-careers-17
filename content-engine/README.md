# TeeUpJobs Content Engine

Turns the live jobs board into 3x/week Instagram content using the format that
grew @coolgolfjobs 200 → 14.6k followers (see `research/coolgolfjobs-teardown.md`),
executed in the Template 10 face+mograph style (HyperFrames overlays on a
recorded talking spine).

## Weekly programming

| Day | Slot | Auto? |
|---|---|---|
| Monday | Coolest Five countdown | full auto-draft |
| Wednesday | Rotation: no-experience / $80k+ / career-story / employer spotlight | auto except career-story |
| Friday | Coolest Five countdown | full auto-draft |

## Generate a draft

```bash
node content-engine/generate.mjs                 # today's scheduled topic
node content-engine/generate.mjs coolest-five    # or explicit
node content-engine/generate.mjs high-pay --dry  # selection preview, no files
```

Each draft lands in `drafts/YYYY-MM-DD-<slug>/`:

- `script.md` — the talking spine. **Punch up the flavor lines before recording**
  (the generator drafts one device per job; anything marked [PUNCH UP] is required).
- `caption.txt` — post caption, copy rules pre-applied (no em dashes, no promises).
- `jobs.json` — the five selected jobs with apply links.
- `overlay/index.html` — HyperFrames composition (1080x1920). Record the spine,
  drop it at `overlay/assets/spine.mp4`, re-time beat `data-start`s to the real
  audio, then preview/render with the HyperFrames CLI.

## The rules the generator enforces

- Selection: `cool_score` + freshness boost, floor 68, max 1 job per employer,
  max 2 per category, nothing re-featured within 45 days (`state/featured.json`).
- Order: opens strong, **the best job is always revealed last** ("coolest job
  this week" — the withheld winner is the retention engine).
- One flavor device per job, no device more than twice per video, no draft line
  repeated verbatim.
- One recurring mantra per video, said verbatim (rotates weekly, `config.mjs`).
- CTA is always teeupjobs.com. Never a link dump, never a Google Doc.
- Overlay cards live in the top band; nothing covers the mouth zone (~y1400).

## Editing the system

- Brand tokens, mantras, schedule, topics, selection rules: `config.mjs`
- Selection logic: `lib/select.mjs` · Script formula: `lib/script.mjs`
- Caption: `lib/caption.mjs` · Overlay emitter: `lib/overlay.mjs`
- Cool-score brain (shared with ingestion): `../scripts/ingest/cool-score.mjs`

## Career-story slot

Not auto-drafted. Pick a subject (someone with a cool golf job — ideally
audience-suggested via DMs), verify the timeline facts, then script it with the
teardown's career-story structure: checkable milestones in chronological order,
third-party proof, "in 60 seconds" framing.
