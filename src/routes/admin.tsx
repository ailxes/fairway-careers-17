import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { toast } from "sonner";
import { type Job, formatComp, timeAgo } from "@/lib/jobs";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: Admin,
});

function Admin() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        navigate({ to: "/auth" });
        return;
      }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userData.user.id);
      const admin = (roles ?? []).some((r) => r.role === "admin");
      setIsAdmin(admin);
      setReady(true);
    })();
  }, [navigate]);

  if (!ready) return <div className="min-h-screen bg-canvas"><Header /><div className="p-12 text-center text-muted-foreground">Loading…</div></div>;
  if (!isAdmin) return (
    <div className="min-h-screen bg-canvas">
      <Header />
      <div className="p-12 text-center max-w-md mx-auto">
        <h1 className="text-2xl font-semibold mb-2">You're not on the list.</h1>
        <p className="text-muted-foreground">This account doesn't have admin access. First person to sign up gets admin automatically.</p>
      </div>
    </div>
  );

  return <AdminDashboard />;
}

function AdminDashboard() {
  const [tab, setTab] = useState<"pending" | "live" | "stats">("pending");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState({ live: 0, pending: 0, subs: 0 });

  async function load() {
    const [{ data: pending }, { data: live }, { count: subs }] = await Promise.all([
      supabase.from("jobs").select("*").eq("status", "pending").order("created_at", { ascending: false }),
      supabase.from("jobs").select("*").eq("status", "live").order("posted_at", { ascending: false }),
      supabase.from("subscribers").select("*", { count: "exact", head: true }),
    ]);
    setJobs(tab === "pending" ? (pending as Job[]) ?? [] : (live as Job[]) ?? []);
    setStats({ live: live?.length ?? 0, pending: pending?.length ?? 0, subs: subs ?? 0 });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function approve(id: string) {
    const { error } = await supabase.from("jobs").update({ status: "live" }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Approved."); load(); }
  }
  async function reject(id: string) {
    const { error } = await supabase.from("jobs").update({ status: "expired" }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Rejected."); load(); }
  }
  async function toggleWeekly(job: Job) {
    const { error } = await supabase
      .from("jobs")
      .update({ is_featured_weekly: !job.is_featured_weekly })
      .eq("id", job.id);
    if (error) toast.error(error.message);
    else load();
  }
  async function setRank(id: string, rank: number) {
    const { error } = await supabase.from("jobs").update({ weekly_rank: rank }).eq("id", id);
    if (error) toast.error(error.message);
    else load();
  }
  async function toggleFeatured(job: Job) {
    const { error } = await supabase.from("jobs").update({ is_featured: !job.is_featured }).eq("id", job.id);
    if (error) toast.error(error.message);
    else load();
  }

  return (
    <div className="min-h-screen bg-canvas text-fairway">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-baseline mb-8">
          <h1 className="text-3xl font-semibold">Admin</h1>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
            className="text-sm text-muted-foreground hover:text-accent"
          >
            Sign out
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <Stat label="Live jobs" value={stats.live} />
          <Stat label="Pending review" value={stats.pending} highlight />
          <Stat label="Newsletter subs" value={stats.subs} />
        </div>

        <div className="flex gap-2 mb-6 border-b border-border">
          {(["pending", "live"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-semibold capitalize transition ${tab === t ? "border-b-2 border-accent text-accent" : "text-muted-foreground"}`}
            >
              {t} ({t === "pending" ? stats.pending : stats.live})
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {jobs.length === 0 && <p className="text-muted-foreground py-12 text-center">Nothing here.</p>}
          {jobs.map((j) => (
            <div key={j.id} className="bg-card border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{j.title}</h3>
                  {j.is_featured && <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded font-bold">FEATURED</span>}
                  {j.is_featured_weekly && <span className="text-[10px] bg-fairway/10 text-fairway px-2 py-0.5 rounded font-bold">WEEKLY #{j.weekly_rank}</span>}
                </div>
                <p className="text-sm text-muted-foreground">
                  {j.employer} · {j.location} · {formatComp(j.comp_min, j.comp_max, j.comp_notes)} · {timeAgo(j.posted_at)} · {j.views} views
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {tab === "pending" && (
                  <>
                    <button onClick={() => approve(j.id)} className="bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm font-semibold">Approve</button>
                    <button onClick={() => reject(j.id)} className="bg-muted px-4 py-2 rounded-lg text-sm font-semibold">Reject</button>
                  </>
                )}
                {tab === "live" && (
                  <>
                    <button onClick={() => toggleFeatured(j)} className="bg-muted px-3 py-2 rounded-lg text-xs font-semibold">
                      {j.is_featured ? "Unfeature" : "Feature"}
                    </button>
                    <button onClick={() => toggleWeekly(j)} className="bg-muted px-3 py-2 rounded-lg text-xs font-semibold">
                      {j.is_featured_weekly ? "Remove weekly" : "Add weekly"}
                    </button>
                    {j.is_featured_weekly && (
                      <select
                        value={j.weekly_rank ?? ""}
                        onChange={(e) => setRank(j.id, Number(e.target.value))}
                        className="bg-card border border-border rounded-lg px-2 py-1 text-xs"
                      >
                        <option value="">Rank</option>
                        {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>#{n}</option>)}
                      </select>
                    )}
                    <Link to="/jobs/$id" params={{ id: j.id }} className="text-xs text-muted-foreground hover:text-accent self-center">View</Link>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-6 ${highlight ? "bg-accent text-accent-foreground" : "bg-card border border-border"}`}>
      <p className={`text-xs font-bold uppercase tracking-widest ${highlight ? "text-accent-foreground/70" : "text-muted-foreground"}`}>{label}</p>
      <p className="text-4xl font-semibold mt-1">{value}</p>
    </div>
  );
}
