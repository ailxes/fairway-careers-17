import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchJob, fetchLiveJobs, formatComp, PERK_META, timeAgo, coolLabel } from "@/lib/jobs";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";

export const Route = createFileRoute("/jobs/$id")({
  loader: async ({ params }) => {
    const job = await fetchJob(params.id);
    if (!job || job.status !== "live") throw notFound();
    return { job };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Job — Cool Golf Jobs" }] };
    const j = loaderData.job;
    const title = `${j.title} at ${j.employer} — Cool Golf Jobs`;
    const desc = (j.description ?? "").slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        ...(j.photo_url ? [{ property: "og:image", content: j.photo_url }] : []),
      ],
    };
  },
  component: JobDetail,
  errorComponent: ({ error }) => (
    <div className="p-12 text-center text-muted-foreground">{error.message}</div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen bg-canvas">
      <Header />
      <div className="p-12 text-center">
        <h1 className="text-3xl font-semibold">This job has been filled or expired.</h1>
        <Link to="/jobs" className="mt-6 inline-block text-accent font-medium">Browse live jobs →</Link>
      </div>
    </div>
  ),
});

function JobDetail() {
  const { job } = Route.useLoaderData();
  const { data: allJobs } = useQuery({ queryKey: ["jobs-live"], queryFn: fetchLiveJobs });

  useEffect(() => {
    supabase.from("job_views").insert({ job_id: job.id }).then(() => {});
  }, [job.id]);

  const related = (allJobs ?? [])
    .filter((j) => j.id !== job.id && (j.role_category === job.role_category || j.state === job.state))
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.posted_at,
    employmentType: (job.job_type ?? "").toUpperCase(),
    hiringOrganization: { "@type": "Organization", name: job.employer },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: job.city, addressRegion: job.state, addressCountry: "US" },
    },
    baseSalary: job.comp_min
      ? {
          "@type": "MonetaryAmount",
          currency: "USD",
          value: { "@type": "QuantitativeValue", minValue: job.comp_min, maxValue: job.comp_max ?? job.comp_min, unitText: "YEAR" },
        }
      : undefined,
  };

  return (
    <div className="min-h-screen bg-canvas text-fairway">
      <Header transparent />

      {/* Hero */}
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden">
        {job.photo_url && (
          <img src={job.photo_url} alt={job.title} className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-fairway-deep via-fairway-deep/40 to-fairway-deep/30" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 h-full flex flex-col justify-end pb-12">
          {job.is_featured && (
            <span className="inline-block w-fit px-2 py-1 bg-accent/20 backdrop-blur text-accent text-[10px] font-bold uppercase tracking-widest rounded mb-4">
              Featured
            </span>
          )}
          <h1 className="text-4xl md:text-6xl font-semibold text-cream leading-tight mb-3">{job.title}</h1>
          <p className="text-cream/80 text-xl">
            {job.employer_slug ? (
              <Link to="/employer/$slug" params={{ slug: job.employer_slug }} className="hover:text-accent">
                {job.employer}
              </Link>
            ) : (
              job.employer
            )}{" "}
            · {job.location}
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-wrap items-center gap-4">
            <div className="text-2xl font-semibold">{formatComp(job.comp_min, job.comp_max, job.comp_notes)}</div>
            <span className="bg-fairway text-cream px-3 py-1 rounded-full text-xs font-bold">
              Cool Score {job.cool_score ?? 75} · {job.cool_label ?? coolLabel(job.cool_score)}
            </span>
            {job.job_type && (
              <span className="px-3 py-1 bg-secondary rounded-full text-[10px] font-bold uppercase tracking-wider">
                {job.job_type}
              </span>
            )}
          </div>

          {(job.perks ?? []).length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Perks</h2>
              <div className="flex flex-wrap gap-2">
                {(job.perks ?? []).map((p) => {
                  const meta = PERK_META[p];
                  if (!meta) return null;
                  return (
                    <span key={p} className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-full text-sm font-medium">
                      <span>{meta.icon}</span>
                      <span>{meta.label}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">About the job</h2>
            <p className="text-lg leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>
        </div>

        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 bg-fairway text-cream rounded-2xl p-6 space-y-4">
            <p className="text-cream/60 text-xs uppercase tracking-widest">Ready to send it?</p>
            <a
              href={job.apply_url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-accent text-accent-foreground font-semibold text-center px-6 py-4 rounded-xl hover:brightness-105 transition"
            >
              Apply now →
            </a>
            <p className="text-xs text-cream/50">Applies at {job.employer}. No cover letter needed.</p>
            <p className="text-xs text-cream/40">Posted {timeAgo(job.posted_at)} · {job.views} views</p>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <h2 className="text-2xl font-semibold mb-6">More cool jobs like this</h2>
          <div className="space-y-4">
            {related.map((j) => (
              <JobCard job={j} key={j.id} />
            ))}
          </div>
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Footer />
    </div>
  );
}
