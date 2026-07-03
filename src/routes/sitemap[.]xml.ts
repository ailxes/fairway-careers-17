import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, COLLECTIONS, stateToSlug } from "@/lib/taxonomy";
import { SITE_URL } from "@/lib/seo";

/**
 * Dynamic sitemap: every live job + every programmatic landing page.
 * This is how a zero-authority domain gets its long-tail pages discovered —
 * submit ${SITE_URL}/sitemap.xml in Google Search Console after deploy.
 */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { data } = await supabase
          .from("jobs")
          .select("id, posted_at, state")
          .eq("status", "live");
        const jobs = data ?? [];
        const today = new Date().toISOString().slice(0, 10);

        const urls: { loc: string; lastmod: string }[] = [
          { loc: "/", lastmod: today },
          { loc: "/jobs", lastmod: today },
          { loc: "/subscribe", lastmod: today },
          { loc: "/post", lastmod: today },
          { loc: "/remote-golf-jobs", lastmod: today },
          ...CATEGORIES.map((c) => ({ loc: `/golf-jobs/${c.slug}`, lastmod: today })),
          ...COLLECTIONS.map((c) => ({ loc: `/collections/${c.slug}`, lastmod: today })),
          ...Array.from(new Set(jobs.map((j) => j.state).filter(Boolean))).map((s) => ({
            loc: `/golf-jobs-in/${stateToSlug(s as string)}`,
            lastmod: today,
          })),
          ...jobs.map((j) => ({
            loc: `/jobs/${j.id}`,
            lastmod: (j.posted_at ?? today).slice(0, 10),
          })),
        ];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url><loc>${SITE_URL}${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`)
  .join("\n")}
</urlset>`;

        return new Response(xml, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
