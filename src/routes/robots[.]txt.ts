import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/seo";

// Served dynamically so the sitemap URL is absolute (required by the spec)
// and follows SITE_URL/VITE_SITE_URL when the production domain changes.
export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () =>
        new Response(`User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`, {
          headers: { "content-type": "text/plain; charset=utf-8" },
        }),
    },
  },
});
