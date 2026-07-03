# Job Ingestion Pipeline

How Tee Up Jobs gets inventory at scale without scraping competitor boards:
Google's job index already aggregates golfjobs.com, Make Golf Your Career
(PGA), GCSAA, Workday/ATS postings, and every major board. We pull from that
public index, normalize into our taxonomy, quality-gate, and human-review.

## The two-step run

**1. Discover** — run the Apify actor `johnvc/google-jobs-scraper---pay-per-result`
($0.014/job — the cheap $0.003 actor returns empty apply links, don't use it).
Input per run:

```json
{ "query": "golf course superintendent", "location": "Arizona", "country": "us", "num_results": 40, "max_pagination": 4 }
```

Query menu for coverage (rotate; add a location to get city/state data —
nationwide runs often return location: "United States" which can't feed the
state hub pages):
golf course superintendent · golf professional · golf sales representative ·
golf marketing · golf caddie · golf instructor · golf internship ·
golf media content · golf engineer

**2. Insert** — save the dataset items to a JSON file, then:

```bash
node scripts/ingest/insert-pending.mjs scripts/ingest/data/<file>.json
```

Everything lands as `status='pending'` → review in `/admin` (bulk "Approve
all" exists, but skim titles first — the gates are good, not perfect).

## Quality gates (in insert-pending.mjs)

- **Board-as-employer dropped**: rows whose "employer" is GolfJobs.com/GCSAA/
  Indeed etc. are bad data + free competitor advertising.
- **No trusted apply link → dropped**: Google results include spam mirror
  domains; we accept direct-apply, employer ATS (Workday/Greenhouse/Lever/
  Taleo/JazzHR/GovernmentJobs...), then major boards (Indeed/ZipRecruiter/
  LinkedIn/Glassdoor/Monster). A job nobody can apply to is not inventory.
- **Dedupe** vs live board (title+employer, source_url) and within batch.
- **Salary hygiene**: hourly wages go to comp_notes, never rendered as annual.
- **Empty descriptions** get a minimal template so pages/JSON-LD aren't blank —
  enrich the keepers in admin.

## Costs (observed)

- ~$0.014/job discovered; ~60–80% survive the gates.
- 200-job weekly refresh ≈ $3. The 42-job researched seed cost ~20 min of
  agent time; this does 10x the volume for pocket change.

## Upgrade path (not built yet)

Add `APIFY_TOKEN` to `.env` (apify.com → Settings → API tokens) and this can
become one command (actor call + dataset fetch + insert) on a weekly cron.
Until then, runs go through Claude via the Apify MCP.
