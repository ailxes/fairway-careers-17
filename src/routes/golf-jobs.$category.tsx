import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { fetchLiveJobs, type Job } from "@/lib/jobs";
import { categoryBySlug } from "@/lib/taxonomy";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { LandingLinks } from "@/components/LandingLinks";
import { buildMeta, SITE_NAME } from "@/lib/seo";

// Programmatic SEO: /golf-jobs/engineering, /golf-jobs/caddie, ...
export const Route = createFileRoute("/golf-jobs/$category")({
  loader: async ({ params }) => {
    const cat = categoryBySlug(params.category);
    if (!cat) throw notFound();
    const jobs = await fetchLiveJobs();
    return {
      cat,
      matches: jobs.filter((j) => (j.role_category ?? "").toLowerCase() === cat.name.toLowerCase()),
      states: Array.from(new Set(jobs.map((j) => j.state).filter(Boolean))) as string[],
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: `Golf Jobs — ${SITE_NAME}` }] };
    const { cat, matches } = loaderData;
    return {
      meta: buildMeta({
        title: `${cat.name} Golf Jobs — ${matches.length} live | ${SITE_NAME}`,
        description: `${cat.blurb} ${matches.length} live ${cat.name.toLowerCase()} jobs with real comp shown.`,
        path: `/golf-jobs/${cat.slug}`,
      }),
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-canvas">
      <Header />
      <div className="p-12 text-center">
        <h1 className="text-2xl font-semibold">That category doesn't exist. Yet.</h1>
        <Link to="/jobs" className="mt-4 inline-block text-accent">Browse all jobs →</Link>
      </div>
    </div>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { cat, matches, states } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-canvas text-fairway">
      <Header />
      <section className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-sm font-medium text-muted-foreground mb-3">
          <Link to="/jobs" className="hover:text-accent">All jobs</Link> · {cat.name}
        </p>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
          {cat.name} <span className="font-serif font-normal">Golf</span> Jobs
        </h1>
        <p className="text-muted-foreground text-lg mb-10 max-w-[65ch]">
          {cat.blurb} {matches.length} live role{matches.length === 1 ? "" : "s"} right now.
        </p>

        {matches.length > 0 ? (
          <div className="space-y-4 mb-12">
            {matches.map((j: Job) => (
              <JobCard job={j} key={j.id} />
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-2xl p-12 text-center mb-12">
            <p className="text-xl font-semibold mb-2">Nothing live in {cat.name} at this second.</p>
            <p className="text-muted-foreground">These get snapped up — be first next time:</p>
          </div>
        )}

        <NewsletterSignup
          sourcePage={`category-${cat.slug}`}
          variant="inline"
          heading={`New ${cat.name.toLowerCase()} jobs, every Friday`}
          subtext="One email a week. Real comp always shown."
        />

        <LandingLinks states={states} current={`cat-${cat.slug}`} />
      </section>
      <Footer />
    </div>
  );
}
