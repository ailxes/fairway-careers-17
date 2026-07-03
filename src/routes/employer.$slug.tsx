import { createFileRoute, notFound } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { type Job } from "@/lib/jobs";

export const Route = createFileRoute("/employer/$slug")({
  loader: async ({ params }) => {
    const [{ data: employer }, { data: jobs }] = await Promise.all([
      supabase.from("employers").select("*").eq("slug", params.slug).maybeSingle(),
      supabase.from("jobs").select("*").eq("employer_slug", params.slug).eq("status", "live"),
    ]);
    if (!employer) throw notFound();
    return { employer, jobs: (jobs ?? []) as Job[] };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Employer — Cool Golf Jobs" }] };
    const e = loaderData.employer;
    return {
      meta: [
        { title: `${e.name} — Cool Golf Jobs` },
        { name: "description", content: e.description ?? `Open roles at ${e.name}.` },
        { property: "og:title", content: `${e.name} — Cool Golf Jobs` },
      ],
    };
  },
  errorComponent: ({ error }) => <div className="p-12">{error.message}</div>,
  notFoundComponent: () => <div className="p-12 text-center">Employer not found.</div>,
  component: EmployerPage,
});

function EmployerPage() {
  const { employer, jobs } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-canvas text-fairway">
      <Header />
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight mb-4">{employer.name}</h1>
        {employer.description && (
          <p className="text-lg text-muted-foreground max-w-2xl mb-8">{employer.description}</p>
        )}
        {employer.perks_summary && (
          <div className="bg-fairway text-cream rounded-2xl p-6 mb-12 max-w-2xl">
            <p className="text-cream/60 text-xs font-bold uppercase tracking-widest mb-2">Perks stack</p>
            <p className="text-lg">{employer.perks_summary}</p>
          </div>
        )}

        <h2 className="text-2xl font-semibold mb-6">
          {jobs.length} open role{jobs.length === 1 ? "" : "s"}
        </h2>
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
