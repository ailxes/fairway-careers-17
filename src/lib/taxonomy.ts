import type { Job } from "@/lib/jobs";

/**
 * Canonical taxonomy for the whole site.
 *
 * Why this exists: the SEO landing pages, the jobs filters, the admin editor,
 * and the seed/ingestion pipeline all need to agree on the same category and
 * collection vocabulary. Every list below was derived from real demand — 204
 * scraped comments on the niche's biggest account, where people repeatedly
 * asked for roles (engineering, course architecture, merchandising…),
 * locations, remote work, internships, and "careers for women" style pages
 * that no competitor can serve from an unstructured list.
 */

// role_category values. `name` is the exact DB value (existing data uses
// capitalized single words like "Professional", "Media" — don't break them).
export const CATEGORIES: { slug: string; name: string; blurb: string }[] = [
  { slug: "professional", name: "Professional", blurb: "Head pro, assistant pro, and director-of-golf roles. Run the shop, play the course, everyone knows your name." },
  { slug: "operations", name: "Operations", blurb: "Course ops, outside services, and the crews that make golf happen before sunrise." },
  { slug: "caddie", name: "Caddie", blurb: "Loop the best courses in America. Get paid in cash, stories, and free golf." },
  { slug: "media", name: "Media", blurb: "Tour content, golf journalism, photo/video, and social roles. Travel the world, never miss a Sunday charge." },
  { slug: "sales", name: "Sales", blurb: "Rep a brand, own a territory, fit real players. The proven on-ramp to the golf industry — in all 50 states, not just the golf hubs." },
  { slug: "marketing", name: "Marketing", blurb: "Brand, digital, and social marketing jobs at companies that live and breathe golf." },
  { slug: "merchandising", name: "Merchandising", blurb: "Golf shop buying, retail, and merchandising roles — the taste-makers of the pro shop." },
  { slug: "agronomy", name: "Agronomy", blurb: "Turf science, superintendent, and grounds roles. The most underrated career in golf." },
  { slug: "engineering", name: "Engineering", blurb: "Design clubs, balls, launch monitors, and sim tech. Mechanical and design engineers wanted — yes, really." },
  { slug: "architecture", name: "Architecture", blurb: "Course design and architecture roles. Rare, coveted, and usually filled by word of mouth — we surface them." },
  { slug: "instruction", name: "Instruction", blurb: "Teaching pros, academies, and coaching roles. Get paid to make people better at golf." },
  { slug: "fitness", name: "Fitness", blurb: "Golf fitness, athletic training, and performance roles at clubs and academies." },
  { slug: "hospitality", name: "Hospitality", blurb: "Resorts, clubhouses, F&B, and guest experience at the world's best golf destinations." },
];

export function categoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug.toLowerCase());
}
export function categoryByName(name: string | null) {
  if (!name) return undefined;
  return CATEGORIES.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

// Curated collections — matched via jobs.tags (curated in admin), with
// sensible fallbacks so pages aren't empty before tagging catches up.
export type Collection = {
  slug: string;
  title: string;
  blurb: string;
  tag: string;
  fallback?: (j: Job) => boolean;
};

export const COLLECTIONS: Collection[] = [
  {
    slug: "women-in-golf",
    title: "Women in Golf",
    blurb: "Careers at clubs, brands, and media companies actively hiring women in golf — marketing, instruction, operations, and beyond. Golf careers aren't just for the dudes.",
    tag: "women-in-golf",
  },
  {
    slug: "internships",
    title: "Golf Internships",
    blurb: "Internships and entry programs at courses, brands, and tours — including the famous ones. The foot in the door everyone asks about.",
    tag: "internships",
    fallback: (j) => (j.job_type ?? "").toLowerCase().includes("intern") || j.title.toLowerCase().includes("intern"),
  },
  {
    slug: "career-changers",
    title: "Career Changers",
    blurb: "Engineers, marketers, and operators who want in. Roles where your outside-golf experience is the qualification — the industry needs your day job.",
    tag: "career-changers",
  },
  {
    slug: "no-experience",
    title: "No Experience Needed",
    blurb: "Start here. Caddie programs, outside services, retail, and entry roles that pay you to be around the game while you learn it.",
    tag: "no-experience",
    fallback: (j) => (j.experience_level ?? "").toLowerCase() === "entry",
  },
  {
    slug: "augusta-adjacent",
    title: "Augusta & Major Venues",
    blurb: "Jobs at and around the game's cathedral venues — the roles people don't believe exist until they see the posting.",
    tag: "augusta-adjacent",
  },
];

export function collectionBySlug(slug: string) {
  return COLLECTIONS.find((c) => c.slug === slug.toLowerCase());
}

export function jobsInCollection(jobs: Job[], c: Collection): Job[] {
  const tagged = jobs.filter((j) => (j.tags ?? []).includes(c.tag));
  if (tagged.length > 0) return tagged;
  return c.fallback ? jobs.filter(c.fallback) : [];
}

// State hub helpers: /golf-jobs-in-florida ↔ state value "Florida"
export function stateToSlug(state: string) {
  return state.toLowerCase().replace(/\s+/g, "-");
}
export function slugToState(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
