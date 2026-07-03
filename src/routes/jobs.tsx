import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { z } from "zod";
import { fetchLiveJobs, PERK_META, type Job } from "@/lib/jobs";
import { JobCard } from "@/components/JobCard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const searchSchema = z.object({
  q: z.string().optional(),
  state: z.string().optional(),
  role: z.string().optional(),
  type: z.string().optional(),
  perk: z.string().optional(),
  sort: z.enum(["newest", "cool", "pay"]).optional(),
});

export const Route = createFileRoute("/jobs")({
  validateSearch: searchSchema,
  component: JobsPage,
});

function JobsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/jobs" });
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs-live"],
    queryFn: fetchLiveJobs,
  });

  const setSearch = (patch: Partial<typeof search>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }) as never });

  const filtered = useMemo(() => {
    let arr = jobs.slice();
    if (search.q) {
      const q = search.q.toLowerCase();
      arr = arr.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.employer.toLowerCase().includes(q) ||
          (j.location ?? "").toLowerCase().includes(q),
      );
    }
    if (search.state) arr = arr.filter((j) => j.state === search.state);
    if (search.role) arr = arr.filter((j) => j.role_category === search.role);
    if (search.type) arr = arr.filter((j) => j.job_type === search.type);
    if (search.perk) arr = arr.filter((j) => (j.perks ?? []).includes(search.perk!));

    if (search.sort === "cool") arr.sort((a, b) => (b.cool_score ?? 0) - (a.cool_score ?? 0));
    else if (search.sort === "pay")
      arr.sort((a, b) => (b.comp_max ?? b.comp_min ?? 0) - (a.comp_max ?? a.comp_min ?? 0));
    else arr.sort((a, b) => +new Date(b.posted_at) - +new Date(a.posted_at));

    // Featured always pinned
    arr.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    return arr;
  }, [jobs, search]);

  const counts = useMemo(() => {
    const c = { state: {} as Record<string, number>, role: {} as Record<string, number>, type: {} as Record<string, number>, perk: {} as Record<string, number> };
    for (const j of jobs) {
      if (j.state) c.state[j.state] = (c.state[j.state] ?? 0) + 1;
      if (j.role_category) c.role[j.role_category] = (c.role[j.role_category] ?? 0) + 1;
      if (j.job_type) c.type[j.job_type] = (c.type[j.job_type] ?? 0) + 1;
      for (const p of j.perks ?? []) c.perk[p] = (c.perk[p] ?? 0) + 1;
    }
    return c;
  }, [jobs]);

  const activeFilters = [search.state, search.role, search.type, search.perk].filter(Boolean).length;
  const [mobileFilters, setMobileFilters] = useState(false);

  return (
    <div className="min-h-screen bg-canvas text-fairway">
      <Header />

      <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-2">
          Every <span className="font-serif font-normal">cool</span> job in golf.
        </h1>
        <p className="text-muted-foreground text-lg">
          {filtered.length} of {jobs.length} live jobs match your filters.
        </p>

        <div className="mt-8 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <input
              value={search.q ?? ""}
              onChange={(e) => setSearch({ q: e.target.value || undefined })}
              placeholder="Search titles, employers, cities..."
              className="w-full bg-card border border-border rounded-full px-5 py-3 text-fairway placeholder:text-muted-foreground outline-none focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilters(true)}
              className="md:hidden bg-fairway text-cream px-5 py-2.5 rounded-full font-semibold text-sm"
            >
              Filters{activeFilters ? ` (${activeFilters})` : ""}
            </button>
            <select
              value={search.sort ?? "newest"}
              onChange={(e) => setSearch({ sort: e.target.value as never })}
              className="bg-card border border-border rounded-full px-5 py-2.5 text-sm font-medium outline-none cursor-pointer"
            >
              <option value="newest">Sort: Newest</option>
              <option value="cool">Sort: Cool Score</option>
              <option value="pay">Sort: Pay (high → low)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-10 pb-12">
        {/* Sidebar */}
        <aside className={`${mobileFilters ? "fixed inset-0 z-40 bg-canvas overflow-y-auto p-6" : "hidden"} lg:block lg:relative lg:w-64 shrink-0`}>
          {mobileFilters && (
            <div className="flex justify-between items-center mb-6 lg:hidden">
              <h3 className="text-xl font-semibold">Filters</h3>
              <button onClick={() => setMobileFilters(false)} className="text-2xl">✕</button>
            </div>
          )}
          <div className="lg:sticky lg:top-24 space-y-8">
            <FilterGroup
              title="State"
              options={Object.entries(counts.state)}
              active={search.state}
              onSelect={(v) => setSearch({ state: v })}
            />
            <FilterGroup
              title="Role"
              options={Object.entries(counts.role)}
              active={search.role}
              onSelect={(v) => setSearch({ role: v })}
            />
            <FilterGroup
              title="Job Type"
              options={Object.entries(counts.type)}
              active={search.type}
              onSelect={(v) => setSearch({ type: v })}
            />
            <FilterGroup
              title="Perks"
              options={Object.entries(counts.perk).map(([k, v]) => [PERK_META[k]?.label ?? k, v, k] as [string, number, string])}
              active={search.perk}
              onSelect={(v) => setSearch({ perk: v })}
            />
            {activeFilters > 0 && (
              <button
                onClick={() => navigate({ search: {} as never })}
                className="text-sm font-medium text-accent hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="text-muted-foreground py-24 text-center">Loading the good stuff…</div>
          ) : filtered.length === 0 ? (
            <div className="bg-card rounded-2xl p-12 text-center">
              <p className="text-xl font-semibold mb-2">No matches. Yet.</p>
              <p className="text-muted-foreground">Loosen a filter or subscribe below to get notified.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((j) => (
                <JobCard job={j} key={j.id} variant={j.is_featured ? "featured" : "default"} />
              ))}
            </div>
          )}

          {activeFilters > 0 && filtered.length > 0 && (
            <SavedSearchBar search={search} />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

function FilterGroup({
  title,
  options,
  active,
  onSelect,
}: {
  title: string;
  options: [string, number, string?][] | [string, number][];
  active: string | undefined;
  onSelect: (v: string | undefined) => void;
}) {
  return (
    <div>
      <h4 className="font-semibold uppercase tracking-wider text-xs text-muted-foreground mb-3">{title}</h4>
      <ul className="space-y-2">
        {options.map((opt) => {
          const [label, count, valueOverride] = opt as [string, number, string?];
          const value = valueOverride ?? label;
          const isActive = active === value;
          return (
            <li key={value}>
              <button
                onClick={() => onSelect(isActive ? undefined : value)}
                className={`w-full flex justify-between items-center text-sm font-medium py-1 transition ${isActive ? "text-accent" : "hover:text-accent"}`}
              >
                <span>{label}</span>
                <span className={isActive ? "text-accent/70" : "text-muted-foreground"}>{count}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SavedSearchBar({ search }: { search: Record<string, unknown> }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const parts = [search.role, search.state].filter(Boolean).join(" · ");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("subscribers").insert({ email, saved_search: search });
    setLoading(false);
    if (error) toast.error("Try again.");
    else {
      toast.success("Saved. We'll email you when matches drop.");
      setEmail("");
    }
  }
  return (
    <form onSubmit={submit} className="mt-8 bg-fairway text-cream rounded-2xl p-6 flex flex-col md:flex-row gap-3 items-center">
      <div className="flex-1 min-w-0">
        <p className="font-semibold">Get new {parts || "matching"} jobs in your inbox →</p>
        <p className="text-cream/60 text-sm">One email when something worth your time lands.</p>
      </div>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="bg-cream/10 border border-cream/20 rounded-full px-5 py-2.5 text-sm text-cream placeholder:text-cream/40 outline-none focus:border-cream/60 flex-1 min-w-0 md:max-w-xs"
      />
      <button disabled={loading} className="bg-accent text-accent-foreground px-6 py-2.5 rounded-full font-semibold text-sm">
        {loading ? "…" : "Alert me"}
      </button>
    </form>
  );
}
