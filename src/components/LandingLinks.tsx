import { Link } from "@tanstack/react-router";
import { CATEGORIES, COLLECTIONS, stateToSlug } from "@/lib/taxonomy";

/**
 * Internal-link block for the programmatic SEO pages. Cross-linking every
 * hub from every hub is what lets crawlers discover the whole page set from
 * any entry point — do not remove to "clean up" a page.
 */
export function LandingLinks({ states = [], current }: { states?: string[]; current?: string }) {
  return (
    <section className="mt-16 pt-12 border-t border-border space-y-8">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Browse by role</h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/golf-jobs/$category"
              params={{ category: c.slug }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${current === `cat-${c.slug}` ? "bg-fairway text-cream" : "bg-secondary hover:bg-fairway hover:text-cream"}`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Collections</h3>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/remote-golf-jobs"
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${current === "remote" ? "bg-fairway text-cream" : "bg-secondary hover:bg-fairway hover:text-cream"}`}
          >
            Remote
          </Link>
          {COLLECTIONS.map((c) => (
            <Link
              key={c.slug}
              to="/collections/$slug"
              params={{ slug: c.slug }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${current === `col-${c.slug}` ? "bg-fairway text-cream" : "bg-secondary hover:bg-fairway hover:text-cream"}`}
            >
              {c.title}
            </Link>
          ))}
        </div>
      </div>
      {states.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Golf jobs by state</h3>
          <div className="flex flex-wrap gap-2">
            {states.map((s) => (
              <Link
                key={s}
                to="/golf-jobs-in/$state"
                params={{ state: stateToSlug(s) }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${current === `state-${stateToSlug(s)}` ? "bg-fairway text-cream" : "bg-secondary hover:bg-fairway hover:text-cream"}`}
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
