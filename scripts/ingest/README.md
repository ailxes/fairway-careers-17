# Job Ingestion — automated + manual

Tee Up Jobs fills its board from Google's public job index (which already
aggregates golfjobs.com, the PGA's Make Golf Your Career board, GCSAA,
TeamWork Online, and every employer ATS). We normalize into our own taxonomy,
quality-gate, and either auto-publish or stage for review. We do **not** mirror
any competitor board (that would be duplicate content + kill our SEO).

## The automated pipeline (set-and-forget, MWF)

`.github/workflows/ingest.yml` runs `harvest.mjs` **Mon/Wed/Fri at 13:00 UTC**
in GitHub's cloud — no server, no laptop needed. Each run:

1. Scrapes the demand-weighted category queries (brand marketing, merchandising,
   engineering, content, superintendent, pro, internships) + a rotating geo
   slice (so the whole country gets covered across the week).
2. Normalizes + quality-gates (shared `lib.mjs`).
3. Dedupes against everything already in the DB.
4. **Publishes:** employer-ATS / golf-board sources go **live** automatically;
   big-general-board-only jobs are staged **pending** for optional review.
5. **Expires** auto-ingested jobs older than 45 days so the board stays fresh.

### One-time setup (required for the automation to run)

Add three repository secrets in GitHub → **Settings → Secrets and variables →
Actions → New repository secret**:

| Secret | Where to get it |
|---|---|
| `APIFY_TOKEN` | apify.com → Settings → API tokens |
| `SUPABASE_URL` | your `VITE_SUPABASE_URL` value |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role` key |

> The service-role key bypasses row security so the job can publish. It lives
> only in GitHub's encrypted secrets — never commit it. Rotate anytime in Supabase.

Then: Actions tab → "Harvest golf jobs (MWF)" → **Run workflow** to test it now.
After that it fires automatically MWF.

**Cost:** ~$0.014/job scraped via Apify; a MWF run is ~$1–2, ~$15–25/month.

### Tuning
- `AUTOPUBLISH_AGGREGATORS: "true"` in the workflow → publish big-board jobs live too (default quarantines them as pending).
- Edit `EVERGREEN_QUERIES` / `GEO_SLICES` in `harvest.mjs` to change coverage.
- `EXPIRE_AFTER_DAYS` env → freshness window (default 45).

## Manual backfill (stage for review)

`insert-pending.mjs` stages jobs as **pending** (safe, uses the anon key):

```bash
node scripts/ingest/insert-pending.mjs some-jobs.json          # from a file
node scripts/ingest/insert-pending.mjs --dataset <apifyId>...  # from Apify (needs APIFY_TOKEN in .env.local)
```

Review + approve in `/admin`.

## Local run of the full harvester

To run the automated harvester by hand (e.g. a big backfill), put the three
secrets in `.env.local` (gitignored) and:

```bash
node scripts/ingest/harvest.mjs
```

## Quality gates (lib.mjs)
- **Board-as-employer dropped** (GolfJobs.com, Upwork, aggregators listed as the employer).
- **No trusted apply link → dropped** (spam mirror domains never make it in).
- **Source confidence:** employer ATS / golf boards = `high` (auto-publish); big general boards = `aggregator` (quarantine).
- **Salary hygiene** (hourly never rendered as annual), **dedupe**, **auto-tagging** (internships/no-experience).
