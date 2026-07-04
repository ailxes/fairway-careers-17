import { Link } from "@tanstack/react-router";
import { type Job, PERK_META, formatComp, timeAgo, coolLabel } from "@/lib/jobs";

// Text-only list card. Only the homepage Weekly Five uses images; list/related/
// landing cards are clean text (title, employer, location, comp, blurb) so the
// many jobs without photos don't render empty image blocks.
export function JobCard({ job, variant = "default" }: { job: Job; variant?: "default" | "featured" }) {
  const featured = variant === "featured" || job.is_featured;
  const perks = job.perks ?? [];
  const chipType = job.job_type ?? "";
  const blurb = (job.description ?? "").trim();

  return (
    <Link
      to="/jobs/$id"
      params={{ id: job.id }}
      className={
        featured
          ? "group block bg-card rounded-2xl p-6 ring-1 ring-accent/30 shadow-lg shadow-accent/10 hover:shadow-accent/20 transition-all"
          : "group block bg-card rounded-2xl p-6 ring-1 ring-border hover:ring-fairway/30 hover:-translate-y-0.5 transition-all"
      }
    >
      <div className="flex justify-between items-start gap-4 mb-2">
        <div className="min-w-0">
          {featured && (
            <span className="inline-block px-2 py-0.5 bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest rounded mb-2">
              Featured
            </span>
          )}
          <h3 className="text-xl font-semibold leading-tight mb-1 group-hover:text-accent transition">
            {job.title}
          </h3>
          <p className="text-fairway font-medium">{job.employer}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {job.location} · Posted {timeAgo(job.posted_at)}
            {job.source && job.source !== "direct" ? ` · via ${job.source}` : ""}
          </p>
        </div>
        <div className="shrink-0 bg-fairway text-cream px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
          {job.cool_score ?? 75}{" "}
          <span className="font-normal opacity-70">· {job.cool_label ?? coolLabel(job.cool_score)}</span>
        </div>
      </div>

      {blurb && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">{blurb}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-base font-semibold text-fairway mr-1">
          {formatComp(job.comp_min, job.comp_max, job.comp_notes)}
        </span>
        {perks.slice(0, 4).map((p) => {
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
    </Link>
  );
}
