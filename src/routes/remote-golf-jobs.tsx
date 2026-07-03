import { createFileRoute } from "@tanstack/react-router";
import { fetchLiveJobs, type Job } from "@/lib/jobs";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { LandingLinks } from "@/components/LandingLinks";
import { buildMeta, SITE_NAME } from "@/lib/seo";

// Programmatic SEO: "remote golf jobs" was one of the most-requested things
// in the niche's community comments ("Get me a remote job!!!") — and no
// competitor can filter for it.
export const Route = createFileRoute("/remote-golf-jobs")({
  loader: async () => {
    const jobs = await fetchLiveJobs();
    return {
      remote: jobs.filter((j) => j.is_remote),
      states: Array.from(new Set(jobs.map((j) => j.state).filter(Boolean))) as string[],
    };
  },
  head: ({ loaderData }) => {
    const n = loaderData?.remote.length ?? 0;
    return {
      meta: buildMeta({
        title: `Remote Golf Jobs — ${n} live | ${SITE_NAME}`,
        description: `Work in golf from anywhere: ${n} live remote jobs in golf marketing, media, engineering, and sales. Real comp shown, updated weekly.`,
        path: "/remote-golf-jobs",
      }),
    };
  },
  component: RemotePage,
});

function RemotePage() {
  const { remote, states } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-canvas text-fairway">
      <Header />
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
          Remote <span className="font-serif font-normal">Golf</span> Jobs
        </h1>
        <p className="text-muted-foreground text-lg mb-10 max-w-[65ch]">
          Yes, they exist: marketing, media, engineering, and sales roles at golf companies you can do
          from anywhere with Wi-Fi and a net in the garage. {remote.length} live remote role
          {remote.length === 1 ? "" : "s"} right now.
        </p>

        {remote.length > 0 ? (
          <div className="space-y-4 mb-12">
            {remote.map((j: Job) => (
              <JobCard job={j} key={j.id} />
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-2xl p-12 text-center mb-12">
            <p className="text-xl font-semibold mb-2">No remote roles live at this second.</p>
            <p className="text-muted-foreground">They move fast — get them the moment they land:</p>
          </div>
        )}

        <NewsletterSignup
          sourcePage="remote-golf-jobs"
          variant="inline"
          heading="Remote golf jobs, straight to your inbox"
          subtext="One email each Friday with the week's best — remote roles flagged."
        />

        <LandingLinks states={states} current="remote" />
      </section>
      <Footer />
    </div>
  );
}
