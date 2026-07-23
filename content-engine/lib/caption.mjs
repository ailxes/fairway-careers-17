// Caption builder. Copy rules (non-negotiable): no em dashes, no promised
// outcomes or timeframes, employer tags invited, CTA to the site, always ship
// a caption. Em dashes are scrubbed defensively at the end.
import { CTA_DOMAIN } from "../config.mjs";

export function buildCaption({ topic, jobs, date }) {
  const nextDay = date.getDay() === 1 ? "Friday" : "Monday";
  const employers = [...new Set(jobs.map((j) => j.employer))];

  const parts = [];
  parts.push(`${topic.title}.`);
  parts.push("");
  jobs.forEach((j, i) => {
    const loc = j.location ? ` (${j.location})` : "";
    parts.push(`${i + 1}. ${j.employer}: ${j.title}${loc}`);
  });
  parts.push("");
  parts.push(`Every listing is live with a direct apply link at ${CTA_DOMAIN}. Search by state, category, and experience level.`);
  parts.push("");
  parts.push(`Employers: hiring for a golf role? Post it free at ${CTA_DOMAIN}.`);
  parts.push("");
  parts.push(`[TAG when handles known: ${employers.join(", ")}]`);
  parts.push("");
  parts.push(`New five on ${nextDay}.`);
  parts.push("");
  parts.push(`#golfjobs #golfindustry #golfcareers #workingolf #golf`);

  // Copy-rule scrub: no em dashes ever.
  return parts.join("\n").replaceAll("—", "-").replaceAll("--", "-");
}
