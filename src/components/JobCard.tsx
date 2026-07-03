import { Link } from "@tanstack/react-router";
import { type Job, PERK_META, formatComp, timeAgo, coolLabel } from "@/lib/jobs";

export function JobCard({ job, variant = "default" }: { job: Job; variant?: "default" | "featured" }) {
  const featured = variant === "featured" || job.is_featured;
  const perks = job.perks ?? [];
  const chipType = job.job_type ?? "";

  return (
    <Link
      to="/jobs/$id"
      params={{ id: job.id }}
      className={
        featured
          ? "group relative block bg-card rounded-3xl overflow-hidden ring-1 ring-accent/30 shadow-xl shadow-accent/10 hover:shadow-accent/20 transition-all"
          : "group block bg-card rounded-2xl overflow-hidden ring-1 ring-border hover:ring-fairway/30 hover:-translate-y-0.5 transition-all"
      }
    >
      <div className="flex flex-col md:flex-row">
        <div
          className={
            featured
              ? "w-full md:w-2/5 h-56 md:h-auto overflow-hidden bg-muted shrink-0"
              : "w-full md:w-56 h-40 md:h-auto overflow-hidden bg-muted shrink-0"
          }
        >
          {job.photo_url ? (
            <img
              src={job.photo_url}
              alt={job.employer}
              loading="lazy"
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="h-full w-full bg-fairway/10" />
          )}
        </div>
        <div className={featured ? "flex-1 p-8" : "flex-1 p-6"}>
          <div className="flex justify-between items-start gap-4 mb-3">
            <div className="min-w-0">
              {featured && (
                <span className="inline-block px-2 py-0.5 bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest rounded mb-2">
                  Featured
                </span>
              )}
              <h3
                className={
                  featured
                    ? "text-2xl font-semibold leading-tight mb-1 group-hover:text-accent transition"
                    : "text-xl font-semibold leading-tight mb-1 group-hover:text-accent transition"
                }
              >
                {job.title}
              </h3>
              <p className="text-fairway font-medium">{job.employer}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {job.location} · Posted {timeAgo(job.posted_at)}
                {job.source && job.source !== "direct" ? ` · via ${job.source}` : ""}
              </p>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-2">
              <div className="bg-fairway text-cream px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                {job.cool_score ?? 75}{" "}
                <span className="font-normal opacity-70">· {job.cool_label ?? coolLabel(job.cool_score)}</span>
              </div>
            </div>
          </div>

          <div className={featured ? "text-xl font-semibold mb-5 text-fairway" : "text-lg font-semibold mb-4 text-fairway"}>
            {formatComp(job.comp_min, job.comp_max, job.comp_notes)}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {perks.slice(0, featured ? 6 : 4).map((p) => {
              const meta = PERK_META[p];
              if (!meta) return null;
              return (
                <span
                  key={p}
                  className="flex items-center gap-1 text-[11px] font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded-md"
                  title={meta.label}
                >
                  <span>{meta.icon}</span>
                  <span>{meta.label}</span>
                </span>
              );
            })}
            {chipType && (
              <span className="ml-auto px-3 py-1 bg-fairway/5 rounded-full text-[10px] font-bold uppercase tracking-wider text-fairway">
                {chipType}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
