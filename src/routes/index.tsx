import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { fetchLiveJobs, fetchWeeklyFive, type Job } from "@/lib/jobs";
import { COLLECTIONS as CURATED_COLLECTIONS } from "@/lib/taxonomy";
import { buildMeta, SITE_NAME, SITE_TAGLINE } from "@/lib/seo";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import heroImg from "@/assets/hero-fairway.jpg";

export const Route = createFileRoute("/")({
  // SSR loader (not client useQuery): the homepage is the highest-traffic
  // entry page — jobs must be in the first HTML byte for crawlers.
  loader: async () => {
    const [jobs, weekly] = [await fetchLiveJobs(), await fetchWeeklyFive()];
    return { jobs, weekly };
  },
  head: () => ({
    meta: buildMeta({
      title: `${SITE_NAME} — ${SITE_TAGLINE}`,
      description:
        "The searchable directory of the coolest jobs in golf. Caddie gigs, tour media, brand and engineering roles — real comp always shown. Plus the Friday Digest newsletter.",
      path: "/",
    }),
  }),
  component: Home,
});

const PERK_TILES = [
  { label: "Jobs with Housing", perk: "housing" },
  { label: "Free Golf Included", perk: "playing_privileges" },
  { label: "PGA Dues Paid", perk: "pga_dues" },
  { label: "Tour & Travel", perk: "travel" },
];

const COLLECTIONS = [
  { title: "Work at a Top-100 Course", filter: { role: "Professional" } },
  { title: "Tour & Media Jobs", filter: { role: "Media" } },
  { title: "Get Paid to Caddie", filter: { role: "Caddie" } },
  { title: "Golf Brand Jobs", filter: { role: "Sales" } },
];

function Home() {
  const [q, setQ] = useState("");
  const { jobs, weekly } = Route.useLoaderData();
  const count = jobs?.length ?? 0;

  const states = Array.from(new Set((jobs ?? []).map((j) => j.state).filter(Boolean))) as string[];
  const roles = Array.from(new Set((jobs ?? []).map((j) => j.role_category).filter(Boolean))) as string[];

  return (
    <div className="min-h-screen bg-canvas text-fairway">
      <Header transparent />

      {/* Hero */}
      <section className="relative h-[92vh] min-h-[640px] flex items-center overflow-hidden">
        <img
          src={heroImg}
          alt="Misty coastal golf course at sunrise"
          width={1920}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-fairway-deep/50 via-fairway-deep/20 to-fairway-deep/70" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold text-cream leading-[0.95] text-balance mb-8">
              Work where you'd <span className="font-serif font-normal">rather</span> be playing.
            </h1>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = `/jobs?q=${encodeURIComponent(q)}`;
              }}
              className="backdrop-blur-xl bg-cream/90 p-2 rounded-2xl ring-1 ring-black/5 flex flex-col md:flex-row gap-2 shadow-2xl"
            >
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                type="text"
                placeholder="Search roles, courses, or destinations..."
                className="flex-1 bg-transparent outline-none text-fairway placeholder:text-fairway/40 text-lg font-medium px-4 py-3"
              />
              <button
                type="submit"
                className="bg-accent text-accent-foreground font-semibold px-8 py-4 rounded-xl hover:brightness-105 transition"
              >
                Find My Office
              </button>
            </form>

            <div className="mt-6 flex items-center gap-3">
              <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
              <p className="text-cream/90 font-medium tracking-wide text-sm">
                {count} COOL JOBS LIVE RIGHT NOW
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Five */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
            The Five <span className="font-serif font-normal">Coolest</span> Jobs This Week
          </h2>
          <span className="hidden md:inline text-muted-foreground text-sm font-medium tracking-wider">
            UPDATED FRIDAYS
          </span>
        </div>
        <p className="text-muted-foreground max-w-xl italic mb-12">
          Five hand-picked roles worth interrupting your range session for. New list every Friday.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {(weekly ?? []).map((job) => (
            <Link
              key={job.id}
              to="/jobs/$id"
              params={{ id: job.id }}
              className="group cursor-pointer"
            >
              <div className="relative mb-5 overflow-hidden rounded-2xl aspect-[3/4] bg-muted">
                {job.photo_url && (
                  <img
                    src={job.photo_url}
                    alt={job.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-fairway-deep/60 to-transparent" />
                <span className="absolute top-4 left-4 text-5xl font-serif text-cream drop-shadow-lg">
                  0{job.weekly_rank}
                </span>
              </div>
              <h3 className="font-semibold text-lg leading-tight mb-1 group-hover:text-accent transition">
                {job.title}
              </h3>
              <p className="text-xs text-muted-foreground font-medium mb-2">{job.employer}</p>
              <p className="text-sm text-fairway/70 leading-relaxed italic">
                {jobHook(job)}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Perk tiles + browse */}
      <section className="bg-fairway py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-cream text-3xl md:text-4xl font-semibold mb-2">Browse by Lifestyle</h2>
          <p className="text-cream/60 mb-12">Because pay isn't the only thing that pays.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PERK_TILES.map((tile, i) => (
              <Link
                key={tile.perk}
                to="/jobs"
                search={{ perk: tile.perk } as never}
                className={
                  i === 1
                    ? "aspect-square md:aspect-auto md:h-48 bg-accent rounded-2xl flex flex-col justify-end p-6 hover:opacity-90 transition"
                    : "aspect-square md:aspect-auto md:h-48 bg-cream/10 rounded-2xl flex flex-col justify-end p-6 hover:bg-cream/20 transition ring-1 ring-cream/10"
                }
              >
                <span className="text-cream font-semibold text-xl">{tile.label}</span>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
            <div>
              <h3 className="text-cream/60 text-xs font-bold uppercase tracking-widest mb-4">By State</h3>
              <div className="flex flex-wrap gap-2">
                {states.map((s) => (
                  <Link
                    key={s}
                    to="/jobs"
                    search={{ state: s } as never}
                    className="text-cream/90 bg-cream/5 hover:bg-cream/15 px-4 py-2 rounded-full text-sm font-medium transition"
                  >
                    {s}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-cream/60 text-xs font-bold uppercase tracking-widest mb-4">By Role</h3>
              <div className="flex flex-wrap gap-2">
                {roles.map((r) => (
                  <Link
                    key={r}
                    to="/jobs"
                    search={{ role: r } as never}
                    className="text-cream/90 bg-cream/5 hover:bg-cream/15 px-4 py-2 rounded-full text-sm font-medium transition"
                  >
                    {r}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-16">
            <h3 className="text-cream/60 text-xs font-bold uppercase tracking-widest mb-4">Collections</h3>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/remote-golf-jobs"
                className="text-cream/90 bg-cream/5 hover:bg-cream/15 px-4 py-2 rounded-full text-sm font-medium transition"
              >
                Remote Golf Jobs
              </Link>
              {CURATED_COLLECTIONS.map((c) => (
                <Link
                  key={c.slug}
                  to="/collections/$slug"
                  params={{ slug: c.slug }}
                  className="text-cream/90 bg-cream/5 hover:bg-cream/15 px-4 py-2 rounded-full text-sm font-medium transition"
                >
                  {c.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Curated collections */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="space-y-16">
          {COLLECTIONS.map((c) => {
            const list = (jobs ?? []).filter((j) => j.role_category === c.filter.role).slice(0, 3);
            if (list.length === 0) return null;
            return (
              <div key={c.title}>
                <div className="flex items-baseline justify-between mb-6">
                  <h3 className="text-2xl md:text-3xl font-semibold">{c.title}</h3>
                  <Link
                    to="/jobs"
                    search={{ role: c.filter.role } as never}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    See all →
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {list.map((j) => (
                    <MiniJobCard job={j} key={j.id} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function MiniJobCard({ job }: { job: Job }) {
  return (
    <Link
      to="/jobs/$id"
      params={{ id: job.id }}
      className="block bg-card rounded-2xl p-5 ring-1 ring-border hover:ring-fairway/30 hover:-translate-y-0.5 transition-all"
    >
      <h4 className="font-semibold text-lg leading-tight mb-1 group-hover:text-accent">{job.title}</h4>
      <p className="text-sm text-fairway/70">{job.employer}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{job.location}</p>
      {job.description && (
        <p className="text-sm text-muted-foreground leading-relaxed mt-3 line-clamp-2">{job.description}</p>
      )}
    </Link>
  );
}

function jobHook(job: Job): string {
  const hooks: Record<string, string> = {
    Caddie: "Loop the best courses in America. Get paid in cash and stories.",
    Operations: "Sunrises over the Pacific. Every. Single. Day.",
    Sales: "Own a territory. Fit real players. Bring your bag.",
    Media: "Travel the world, chase the sun, never miss a Sunday charge.",
    Professional: "Run the shop. Play the course. Everyone knows your name.",
  };
  return hooks[job.role_category ?? ""] ?? job.description?.slice(0, 90) ?? "Apply now.";
}
