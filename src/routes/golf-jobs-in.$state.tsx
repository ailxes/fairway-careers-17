import { createFileRoute, Link } from "@tanstack/react-router";
import { fetchLiveJobs, type Job } from "@/lib/jobs";
import { slugToState } from "@/lib/taxonomy";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { LandingLinks } from "@/components/LandingLinks";
import { buildMeta, SITE_NAME } from "@/lib/seo";

// State hubs: /golf-jobs-in/georgia, /golf-jobs-in/arizona ...
// People asked for these by name ("Any jobs in GA?", "Hiiii any AZ based jobs??").
// Empty states still render (with capture) — they fill as ingestion grows.
export const Route = createFileRoute("/golf-jobs-in/$state")({
  loader: async ({ params }) => {
    const state = slugToState(params.state);
    const jobs = await fetchLiveJobs();
    return {
      state,
      matches: jobs.filter((j) => (j.state ?? "").toLowerCase() === state.toLowerCase()),
      states: Array.from(new Set(jobs.map((j) => j.state).filter(Boolean))) as string[],
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: `Golf Jobs — ${SITE_NAME}` }] };
    const { state, matches } = loaderData;
    return {
      meta: buildMeta({
        title: `Golf Jobs in ${state} — ${matches.length} live | ${SITE_NAME}`,
        description: `${matches.length} live golf jobs in ${state}: club roles, brand jobs, caddie programs, and more. Real comp shown, updated weekly.`,
        path: `/golf-jobs-in/${loaderData ? state.toLowerCase().replace(/\s+/g, "-") : ""}`,
      }),
    };
  },
  component: StatePage,
});

function StatePage() {
  const { state, matches, states } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-canvas text-fairway">
      <Header />
      <section className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-sm font-medium text-muted-foreground mb-3">
          <Link to="/jobs" className="hover:text-accent">All jobs</Link> · {state}
        </p>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
          Golf Jobs in <span className="font-serif font-normal">{state}</span>
        </h1>
        <p className="text-muted-foreground text-lg mb-10 max-w-[65ch]">
          Every live golf job we track in {state} — clubs, brands, courses, and the roles nobody posts
          on LinkedIn. {matches.length} live right now.
        </p>

        {matches.length > 0 ? (
          <div className="space-y-4 mb-12">
            {matches.map((j: Job) => (
              <JobCard job={j} key={j.id} />
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-2xl p-12 text-center mb-12">
            <p className="text-xl font-semibold mb-2">Nothing live in {state} at this second.</p>
            <p className="text-muted-foreground">Get the first one the Friday it drops:</p>
          </div>
        )}

        <NewsletterSignup
          sourcePage={`state-${state.toLowerCase().replace(/\s+/g, "-")}`}
          variant="inline"
          heading={`${state} golf jobs, every Friday`}
          subtext="One email a week. Real comp always shown."
        />

        <LandingLinks states={states} current={`state-${state.toLowerCase().replace(/\s+/g, "-")}`} />
      </section>
      <Footer />
    </div>
  );
}
