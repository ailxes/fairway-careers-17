// Editorial "cool" scorer — the ranking brain behind the Coolest Five content
// engine and the board's cool_score sort. Derived from the @coolgolfjobs
// teardown (content-engine/research/coolgolfjobs-teardown.md): what makes a job
// "cool" is (1) a brand or venue people recognize, (2) a creative/insider role,
// (3) the "your boring job, but in golf" transfer at a name employer, (4) a
// title quirky enough to read aloud. Munis and generic clubs are inventory,
// not content.
//
// Bands (used by the content engine):
//   88+  flagship material — leads or closes a Coolest Five
//   78+  strong list filler
//   60s  board inventory, fine for search, not for reels
//   <55  never content

// S-tier: brands/orgs whose NAME alone carries a reel beat.
const S_TIER =
  /augusta national|pga tour|masters|titleist|acushnet|scotty cameron|footjoy|callaway|odyssey|taylormade|\bping\b|lpga|usga|\br&a\b|pebble beach|bandon dunes|pinehurst|whistling straits|kiawah|st\.? andrews|oakmont|winged foot|shinnecock|torrey pines|tpc sawgrass|golf channel|nbc sports|fried egg|no laying up|barstool|fore play|good good|tgl\b|tomorrow sports|liv golf|trackman|malbon|sunday red|bad birdie|g\/fore|travis ?mathew|holderness|devereux|lab golf|bridgestone golf|srixon|cleveland golf|cobra|puma golf|mizuno|pxg\b|arccos|foresight sports|full swing|skytrak|rapsodo|golfnow|topgolf|five iron|golftec|wilson golf|nike golf|adidas golf/i;

// A-tier: known operators, big resorts, governing bodies — solid but need a
// good role to carry a beat.
const A_TIER =
  /\btpc\b|\btroon\b|invited\b|clubcorp|landscapes golf|kemper sports|pga of america|first tee|sea island|streamsong|erin hills|sand valley|cabot\b|we-ko-pa|reynolds lake|kohler|destination kohler|american golf|golf galaxy|pga tour superstore|dick'?s sporting|8am golf|golf digest|golfweek|bushnell|shot scope|club champion|true spec|golf pride|superstroke|vessel\b|stitch golf|jones golf|sun day red/i;

// Venue prestige that shows up in TITLES ("Caddie - Pebble Beach Golf Links").
const PRESTIGE_VENUE =
  /augusta|pebble|pinehurst|bandon|\btpc\b|pga tour|desert mountain|whistling straits|kiawah|sawgrass|congressional|streamsong|sand valley|erin hills|sea island|st\.? andrews|oakmont|winged foot|shinnecock|torrey pines|disney/i;

// Roles the teardown flags as inherently content-worthy: creative, insider,
// innovation, community, player-facing tour work.
const FLAVOR_ROLE =
  /content|social|creative|video|photo|media|design|innovation|community|brand|player development|tour operations|tournament|experience|ambassador|podcast|writer|producer|marketing/i;

// "Your boring job, but in golf" — transferable professions that become cool at
// a name employer (the most-repeated mantra in the source account).
const TRANSFER_ROLE =
  /accountant|accounting|analyst|engineer|software|developer|\bhr\b|human resources|\bit\b|help ?desk|finance|financial|legal|counsel|data|scientist|project manager|supply chain|logistics|quality/i;

// Municipal / institutional employers — real jobs, never reel jobs.
const MUNI = /city of|county of|\bcounty\b|township|parks (and|&) rec|municipal|state of|\bnavsta\b|air force|army|department of/i;

// Employer-name hygiene: legal wrappers hide the brand ("Golf & Tennis Pro
// Shop, Inc. d/b/a PGA TOUR Superstore" → "PGA TOUR Superstore").
export function cleanEmployer(name) {
  if (!name) return name;
  let n = String(name);
  const dba = n.match(/d\/?b\/?a\.?\s+(.+)$/i);
  if (dba) n = dba[1];
  n = n.replace(/[,.]?\s*(inc|llc|l\.l\.c|ltd|co|corp|corporation|company)\.?$/i, "").trim();
  return n.replace(/\s{2,}/g, " ").slice(0, 120) || String(name).slice(0, 120);
}

export function coolScore({ title = "", employer = "", category = "", comp_min = null }) {
  const t = String(title);
  const e = cleanEmployer(employer);
  const te = `${t} ${e}`;
  let s = 60;

  // Brand recognition — the single biggest driver of shareable job content.
  if (S_TIER.test(e)) s += 18;
  else if (A_TIER.test(e)) s += 10;
  else if (S_TIER.test(t)) s += 12; // brand only visible in the title

  // Venue prestige (title often carries it even when employer is a staffing co).
  if (PRESTIGE_VENUE.test(te)) s += 8;

  // Role flavor.
  const brandName = S_TIER.test(e) || A_TIER.test(e);
  if (FLAVOR_ROLE.test(t)) s += 8;
  else if (TRANSFER_ROLE.test(t) && brandName) s += 7; // boring-job-but-in-golf
  if (/intern/i.test(t) && brandName) s += 4; // name-brand foot in the door

  // Quirky read-aloud titles ("Senior Global Putter Trend Forecast...").
  if (t.split(/\s+/).length >= 6 && /forecast|trend|czar|guru|chief|global|innovation|experience/i.test(t)) s += 4;

  // Real money is content ("$80k+ jobs in golf" slot).
  if (typeof comp_min === "number" && comp_min >= 80000) s += 4;

  // Anti-signals.
  if (MUNI.test(e)) s -= 12;
  if (["Agronomy", "Operations", "Hospitality"].includes(category) && !brandName && !PRESTIGE_VENUE.test(te)) s -= 6;

  return Math.max(40, Math.min(s, 98));
}
