import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { type Job, formatComp } from "@/lib/jobs";

// Programmatic SEO: /jobs/:state/:role e.g. /jobs/Florida/Professional
export const Route = createFileRoute("/jobs/$state/$role")({
  loader: async ({ params }) => {
    const state = decodeURIComponent(params.state);
    const role = decodeURIComponent(params.role);
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("status", "live")
      .eq("state", state)
      .eq("role_category", role);
    if (error) throw error;
    if (!data || data.length === 0) throw notFound();
    return { jobs: data as Job[], state, role };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Jobs — Cool Golf Jobs" }] };
    const { state, role, jobs } = loaderData;
    const title = `${role} Golf Jobs in ${state} — ${jobs.length} live | Cool Golf Jobs`;
    const desc = `${jobs.length} ${role.toLowerCase()} jobs in golf in ${state}. Real comp, real perks, no cover letters.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  errorComponent: ({ error }) => <div className="p-12">{error.message}</div>,
  notFoundComponent: () => (
    <div className="min-h-screen bg-canvas">
      <Header />
      <div className="p-12 text-center">
        <h1 className="text-2xl font-semibold">No open roles in that combo. Yet.</h1>
        <Link to="/jobs" className="mt-4 inline-block text-accent">Browse all jobs →</Link>
      </div>
    </div>
  ),
  component: SeoJobsPage,
});

function SeoJobsPage() {
  const { jobs, state, role } = Route.useLoaderData();
  const pays = jobs.map((j: Job) => j.comp_max ?? j.comp_min ?? 0).filter((n: number) => n > 0);
  const minPay = pays.length ? Math.min(...pays) : null;
  const maxPay = pays.length ? Math.max(...pays) : null;

  return (
    <div className="min-h-screen bg-canvas text-fairway">
      <Header />
      <section className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-sm font-medium text-muted-foreground mb-3">
          <Link to="/jobs" className="hover:text-accent">All jobs</Link> · {state}
        </p>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
          {role} Golf Jobs in <span className="font-serif font-normal">{state}</span>
        </h1>
        <p className="text-muted-foreground text-lg mb-10">
          {jobs.length} live role{jobs.length === 1 ? "" : "s"}
          {minPay && maxPay && ` · Pay range ${formatComp(minPay, maxPay, null)}`}
          . All openings are hand-checked for coolness.
        </p>

        <div className="space-y-4">
          {jobs.map((j: Job) => (
            <JobCard job={j} key={j.id} />
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
