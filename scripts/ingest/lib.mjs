// Shared ingestion logic used by both the manual inserter (insert-pending.mjs)
// and the automated harvester (harvest.mjs). One source of truth for how a
// scraped Google-Jobs item becomes a Tee Up Jobs row, and which sources we
// trust enough to auto-publish.
import { readFileSync } from "node:fs";

// ---- env ----
// Reads .env.local first (gitignored — secrets like APIFY_TOKEN and the
// service-role key), then .env, then process.env. Values may be quoted.
export function loadEnv(root) {
  const env = {};
  for (const file of [".env", ".env.local"]) {
    try {
      for (const line of readFileSync(`${root}/${file}`, "utf8").split("\n")) {
        if (!line.includes("=") || line.trim().startsWith("#")) continue;
        const k = line.slice(0, line.indexOf("=")).trim();
        const v = line.slice(line.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "");
        env[k] = v;
      }
    } catch {
      /* file may not exist */
    }
  }
  return { ...env, ...process.env };
}

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

const CATEGORY_RULES = [
  [/superintendent|turf|agronom|grounds|greenkeep/i, "Agronomy"],
  [/caddie|caddy|looper/i, "Caddie"],
  [/architect|course design/i, "Architecture"],
  [/engineer|developer|software|hardware|firmware|r&d/i, "Engineering"],
  [/photograph|video|content|social media|editor|\bmedia\b|writer|journalis|producer|graphic design/i, "Media"],
  [/merchandis|buyer|retail|shop attendant|specialist|teammate/i, "Merchandising"],
  [/marketing|brand manager|growth|seo|crm/i, "Marketing"],
  [/sales|account exec|territory|business development|\brep\b/i, "Sales"],
  [/instructor|teaching|coach|academy|golftec/i, "Instruction"],
  [/fitness|trainer|performance|physio|fitter/i, "Fitness"],
  [/server|bartend|food|beverage|hospitality|concierge|guest|event|billing/i, "Hospitality"],
  [/head (golf )?professional|golf professional|assistant (golf )?professional|director of golf|\bpga\b|golf pro\b/i, "Professional"],
  [/operations|outside service|cart|starter|ranger|bag room|attendant|player service/i, "Operations"],
];

export function categorize(title, description = "") {
  for (const [re, cat] of CATEGORY_RULES) if (re.test(title)) return cat;
  for (const [re, cat] of CATEGORY_RULES) if (re.test(description)) return cat;
  return "Operations";
}

export function parseLocation(loc) {
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
  const t = `${title} ${jobType ?? ""}`.toLowerCase();
  const tags = [];
  if (/intern/.test(t)) tags.push("internships");
  if (/no experience|entry level|entry-level|trainee/.test(t)) tags.push("no-experience");
  return tags;
}

function coolScore(cat, title) {
  let s = 74;
  if (/augusta|pebble|pinehurst|bandon|\btpc\b|pga tour|desert mountain|whistling straits|kiawah/i.test(title)) s += 14;
  if (["Media", "Caddie", "Architecture"].includes(cat)) s += 8;
  if (["Engineering", "Instruction"].includes(cat)) s += 5;
  return Math.min(s, 96);
}

// Employer field is actually a job board / marketplace → bad data + free ads
// for a competitor. Drop.
const BOARD_EMPLOYERS = /golfjobs\.com|^golfjobs$|gcsaa|superintendents association|indeed|ziprecruiter|bebee|jobleads|^linkedin$|^monster$|upwork|agmgolf|boardroom magazine|teachme\.to/i;

// Employer-owned ATS / official careers → strongest primary source.
const EMPLOYER_ATS = /myworkdayjobs|workday|greenhouse\.io|lever\.co|applytojob\.com|jazzhr|paylocity|paycom|taleo\.net|oraclecloud\.com|icims\.com|smartrecruiters|hirebridge|workable\.com|dickssportinggoods\.jobs|aramarkcareers\.com|marcandrosehospitality\.com/i;
// Reputable golf-specific boards → also high confidence.
const GOLF_BOARDS = /makegolfyourcareer\.org|careers\.gcsaa\.org|gcsaa\.org|teamworkonline\.com|golf-jobs\.com/i;
// Big general boards → acceptable, but lower confidence (quarantine on auto-run).
const AGGREGATORS = /indeed\.com|monster\.com|linkedin\.com|glassdoor\.com|ziprecruiter\.com|careerbuilder\.com|mediabistro\.com|governmentjobs\.com|usajobs\.gov/i;

export function pickApplyLink(item) {
  const raw = item.applyOptions ?? item.apply_options ?? [];
  const opts = (Array.isArray(raw) ? raw : [])
    .map((a) => ({ url: a?.url ?? a?.link, direct: !!a?.directApply }))
    .filter((a) => a.url);
  return (
    opts.find((a) => a.direct)?.url ??
    opts.find((a) => EMPLOYER_ATS.test(a.url))?.url ??
    opts.find((a) => GOLF_BOARDS.test(a.url))?.url ??
    opts.find((a) => AGGREGATORS.test(a.url))?.url ??
    null
  );
}

// "high" = employer ATS or golf-specific board (safe to auto-publish).
// "aggregator" = big general board only (quarantine as pending on auto-run).
export function sourceConfidence(url) {
  if (!url) return "none";
  if (EMPLOYER_ATS.test(url) || GOLF_BOARDS.test(url)) return "high";
  if (AGGREGATORS.test(url)) return "aggregator";
  return "none";
}

// Normalize one scraped item (handles both johnvc and gio21 actor shapes) into
// a jobs row, or return null to drop it. Adds `_confidence` for the caller.
export function normalize(item) {
  const title = item.title;
  const employer = item.companyName ?? item.company_name ?? item.employer;
  if (!title || !employer) return null;
  if (BOARD_EMPLOYERS.test(employer)) return null;

  const ext = item.detected_extensions ?? {};
  const { city, state, location } = parseLocation(item.location);
  const remote = Boolean(item.workFromHome ?? ext.work_from_home) || /anywhere|remote/i.test(item.location ?? "");
  const applyLink = pickApplyLink(item);
  if (!applyLink) return null; // a job nobody can apply to is not inventory

  const desc =
    (item.description ?? "").trim().slice(0, 1400) ||
    `${title} at ${employer}${location ? ` in ${location}` : ""}. Apply directly with the employer — full details at the application link.`;
  const cat = categorize(title, desc);

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
    comp_notes = ext.salary.slice(0, 120);
  }

  return {
    _confidence: sourceConfidence(applyLink),
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
    tags: autoTags(title, item.jobType ?? ext.schedule_type),
  };
}

export function dedupeKey(row) {
  return `${row.title}::${row.employer}`.toLowerCase();
}
