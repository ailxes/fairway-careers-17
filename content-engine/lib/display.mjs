// Display hygiene for scraped names — spoken lines and on-screen cards need
// clean brand + role text. Conservative: only strips clearly-locational or
// branch suffixes; never rewrites the actual role or brand.

const CITY_ST = /\s*[-–|,]\s*[A-Z][A-Za-z .']+,\s*[A-Z]{2}\.?$/; // " - Northbrook, IL"
const BRANCH = /\s+-\s+[A-Z][A-Za-z .']{2,24}$/;                  // " - Vernon Hills"

export function displayTitle(title, location, employer) {
  let t = String(title ?? "").trim();
  t = t.replace(CITY_ST, "");
  // Strip a trailing " - X" when X repeats the location or the employer brand.
  const m = BRANCH.exec(t);
  if (m) {
    const suffix = m[0].replace(/^\s+-\s+/, "").toLowerCase();
    const locMatch = location && location.toLowerCase().includes(suffix);
    const empMatch =
      employer && (suffix.includes(employer.toLowerCase()) || employer.toLowerCase().includes(suffix));
    if (locMatch || empMatch) t = t.slice(0, m.index);
  }
  return t.trim();
}

export function displayEmployer(employer) {
  let e = String(employer ?? "").trim();
  const m = BRANCH.exec(e);
  if (m && e.slice(0, m.index).length >= 8) e = e.slice(0, m.index);
  return e.trim();
}

/** Apply display hygiene to a job for presentation (leaves DB fields intact). */
export function forDisplay(job) {
  const employer = displayEmployer(job.employer);
  return { ...job, employer, title: displayTitle(job.title, job.location, employer) };
}
