import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { fetchLiveJobs, type Job } from "@/lib/jobs";
import { collectionBySlug, jobsInCollection } from "@/lib/taxonomy";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { LandingLinks } from "@/components/LandingLinks";
import { buildMeta, SITE_NAME } from "@/lib/seo";

// Curated collections the audience literally asked for in public comments:
// women-in-golf, internships, career-changers, no-experience, augusta-adjacent.
export const Route = createFileRoute("/collections/$slug")({
  loader: async ({ params }) => {
    const col = collectionBySlug(params.slug);
    if (!col) throw notFound();
    const jobs = await fetchLiveJobs();
    return {
      col,
      matches: jobsInCollection(jobs, col),
      states: Array.from(new Set(jobs.map((j) => j.state).filter(Boolean))) as string[],
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: `Collections — ${SITE_NAME}` }] };
    const { col, matches } = loaderData;
    return {
      meta: buildMeta({
        title: `${col.title} — ${matches.length} live golf jobs | ${SITE_NAME}`,
        description: `${col.blurb} ${matches.length} live roles, hand-curated.`,
        path: `/collections/${col.slug}`,
      }),
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-canvas">
      <Header />
      <div className="p-12 text-center">
        <h1 className="text-2xl font-semibold">That collection doesn't exist. Yet.</h1>
        <Link to="/jobs" className="mt-4 inline-block text-accent">Browse all jobs →</Link>
      </div>
    </div>
  ),
  component: CollectionPage,
});

function CollectionPage() {
  const { col, matches, states } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-canvas text-fairway">
      <Header />
      <section className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-sm font-medium text-muted-foreground mb-3">
          <Link to="/jobs" className="hover:text-accent">All jobs</Link> · Collection
        </p>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">{col.title}</h1>
        <p className="text-muted-foreground text-lg mb-10 max-w-[65ch]">
          {col.blurb} {matches.length} live role{matches.length === 1 ? "" : "s"} right now.
        </p>

        {matches.length > 0 ? (
          <div className="space-y-4 mb-12">
            {matches.map((j: Job) => (
              <JobCard job={j} key={j.id} />
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-2xl p-12 text-center mb-12">
            <p className="text-xl font-semibold mb-2">This collection is between drops.</p>
            <p className="text-muted-foreground">Subscribe and we'll send the next one the Friday it lands:</p>
          </div>
        )}

        <NewsletterSignup
          sourcePage={`collection-${col.slug}`}
          variant="inline"
          heading={`${col.title} roles, every Friday`}
          subtext="One email a week. Real comp always shown."
        />

        <LandingLinks states={states} current={`col-${col.slug}`} />
      </section>
      <Footer />
    </div>
  );
}
