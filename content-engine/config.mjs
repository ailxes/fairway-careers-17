// TeeUpJobs content engine — brand + programming configuration.
// Derived from research/coolgolfjobs-teardown.md and the master script
// framework (instagram-content-research). Edit here, not in lib/.

// House visual tokens (video-templates/system/mograph-language.md, template 10).
export const TOKENS = {
  bg: "#0E0E0E",
  panel: "#FFFFFF",
  accent: "#3EE6A0", // mint
  gold: "#FBBC04",
  red: "#E8231A",
  ink: "#0E0E0E",
  captionFont: "'Montserrat', 'Inter', system-ui, sans-serif",
  displayFont: "'Archivo Black', system-ui, sans-serif",
};

// Recurring mantras — say ONE per video, verbatim, every time. These are ours
// (distinct from the competitor's). Rotate deliberately, never improvise new ones.
export const MANTRAS = [
  "Same skills. Better office.",
  "You don't need a tour card to work in golf.",
  "Every one of these is real and live right now.",
];

export const CTA_DOMAIN = "teeupjobs.com";

// Weekly programming (teardown: Mon/Fri flagship ritual + one rotating slot).
export const SCHEDULE = {
  1: "coolest-five", // Monday
  3: "rotation",     // Wednesday
  5: "coolest-five", // Friday
};

// Wednesday rotation, in order. career-story is generated as a research brief
// (needs a subject + fact-check pass), the others are fully automatic.
export const ROTATION = ["no-experience", "high-pay", "career-story", "employer-spotlight"];

export const TOPICS = {
  "coolest-five": {
    title: "The 5 Coolest Jobs in Golf This Week",
    slug: "coolest-five",
    count: 5,
    filter: () => true,
    headline: "THE 5 COOLEST JOBS IN GOLF THIS WEEK",
  },
  "no-experience": {
    title: "5 Golf Jobs You Can Get With No Experience",
    slug: "no-experience",
    count: 5,
    filter: (j) =>
      (j.tags ?? []).includes("no-experience") ||
      (j.tags ?? []).includes("internships") ||
      j.experience_level === "entry",
    headline: "GOLF JOBS. NO EXPERIENCE NEEDED.",
  },
  "high-pay": {
    title: "5 Golf Jobs Paying $80k or More",
    slug: "high-pay",
    count: 5,
    filter: (j) => typeof j.comp_min === "number" && j.comp_min >= 80000,
    headline: "GOLF JOBS THAT PAY $80K+",
  },
  "employer-spotlight": {
    title: "Employer Spotlight",
    slug: "employer-spotlight",
    count: 5,
    // Auto-picks the brand-name employer with the most fresh live roles.
    filter: () => true,
    headline: "{EMPLOYER} IS HIRING",
  },
  "career-story": {
    title: "Career Story",
    slug: "career-story",
    count: 0, // brief only — subject researched separately, fact-checked before scripting
    filter: () => true,
    headline: "HOW {NAME} GOT THE COOLEST JOB IN GOLF",
  },
};

// Selection rules.
export const RULES = {
  perEmployerCap: 1,       // max jobs per employer per video
  perCategoryCap: 2,       // max jobs per role_category per video
  noRepeatDays: 45,        // don't re-feature a job within this window
  freshBoost10d: 6,        // score boost for jobs posted in last 10 days
  freshBoost21d: 3,
  minScore: 68,            // floor for content (board inventory below this)
};
