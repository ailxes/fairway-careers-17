/**
 * Central SEO config. Every page's title/meta/OG goes through here so the
 * site name and canonical domain are single-line changes (branding is still
 * an open decision — see README note in repo root).
 */
export const SITE_NAME = "Tee Up Jobs";
export const SITE_TAGLINE = "Work where you'd rather be playing.";

// Canonical absolute origin for sitemap/OG URLs. Override in .env with
// VITE_SITE_URL once the production domain is decided.
export const SITE_URL = (import.meta.env?.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") ?? "https://fairway-careers-17.lovable.app";

type MetaInput = {
  title: string;
  description: string;
  image?: string | null;
  path?: string;
};

/** Build the TanStack Router `head.meta` array with OG/Twitter parity. */
export function buildMeta({ title, description, image, path }: MetaInput) {
  const meta: Record<string, string>[] = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
  ];
  if (image) meta.push({ property: "og:image", content: image });
  if (path) meta.push({ property: "og:url", content: `${SITE_URL}${path}` });
  return meta;
}
