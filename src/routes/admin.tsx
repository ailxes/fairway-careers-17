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

type SubscriberRow = { id: string; email: string; source_page?: string | null; saved_search?: unknown; created_at: string };
type OrderRow = { id: string; tier: string; employer_name: string; contact_email: string; notes: string | null; status: string; created_at: string };
type LeadRow = { id: string; company: string; contact_email: string; placement: string | null; message: string | null; created_at: string };

const TABS = ["pending", "live", "subs", "orders", "leads"] as const;
type Tab = (typeof TABS)[number];

function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("pending");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [subs, setSubs] = useState<SubscriberRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [stats, setStats] = useState({ live: 0, pending: 0, subs: 0, orders: 0, leads: 0 });

  async function load() {
    const [{ data: pending }, { data: live }, subsRes, ordersRes, leadsRes] = await Promise.all([
      supabase.from("jobs").select("*").eq("status", "pending").order("created_at", { ascending: false }),
      supabase.from("jobs").select("*").eq("status", "live").order("posted_at", { ascending: false }),
      supabase.from("subscribers").select("*").order("created_at", { ascending: false }).limit(1000),
      supabase.from("listing_orders").select("*").order("created_at", { ascending: false }),
      supabase.from("sponsor_leads").select("*").order("created_at", { ascending: false }),
    ]);
    setJobs(tab === "pending" ? ((pending as Job[]) ?? []) : ((live as Job[]) ?? []));
    // orders/leads tables may not exist pre-migration — treat errors as empty
    setSubs((subsRes.data as SubscriberRow[]) ?? []);
    setOrders((ordersRes.data as OrderRow[]) ?? []);
    setLeads((leadsRes.data as LeadRow[]) ?? []);
    setStats({
      live: live?.length ?? 0,
      pending: pending?.length ?? 0,
      subs: subsRes.data?.length ?? 0,
      orders: (ordersRes.data ?? []).filter((o: OrderRow) => o.status === "pending").length,
      leads: leadsRes.data?.length ?? 0,
    });
  }

  function exportSubsCsv() {
    const rows = [["email", "source_page", "created_at"], ...subs.map((s) => [s.email, s.source_page ?? "", s.created_at])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
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
  const CURATION_TAGS = ["women-in-golf", "internships", "career-changers", "no-experience", "augusta-adjacent"];

  async function toggleTag(job: Job, tag: string) {
    const tags = (job.tags ?? []).includes(tag) ? (job.tags ?? []).filter((t) => t !== tag) : [...(job.tags ?? []), tag];
    const { error } = await supabase.from("jobs").update({ tags }).eq("id", job.id);
    if (error) toast.error(error.message);
    else load();
  }

  async function toggleRemote(job: Job) {
    const { error } = await supabase.from("jobs").update({ is_remote: !job.is_remote }).eq("id", job.id);
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

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Stat label="Live jobs" value={stats.live} />
          <Stat label="Pending review" value={stats.pending} highlight />
          <Stat label="Newsletter subs" value={stats.subs} />
          <Stat label="Open orders" value={stats.orders} />
          <Stat label="Sponsor leads" value={stats.leads} />
        </div>

        <div className="flex gap-2 mb-6 border-b border-border overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-semibold capitalize transition whitespace-nowrap ${tab === t ? "border-b-2 border-accent text-accent" : "text-muted-foreground"}`}
            >
              {t === "subs" ? `Subscribers (${stats.subs})` : t === "orders" ? `Orders (${stats.orders})` : t === "leads" ? `Leads (${stats.leads})` : `${t} (${t === "pending" ? stats.pending : stats.live})`}
            </button>
          ))}
        </div>

        {tab === "subs" && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={exportSubsCsv} className="bg-fairway text-cream px-4 py-2 rounded-lg text-sm font-semibold">
                Export CSV ({subs.length})
              </button>
            </div>
            <div className="space-y-2">
              {subs.length === 0 && <p className="text-muted-foreground py-12 text-center">No subscribers yet — embed is live on every page, they'll come.</p>}
              {subs.map((s) => (
                <div key={s.id} className="bg-card border border-border rounded-xl px-5 py-3 flex flex-wrap justify-between items-center gap-2 text-sm">
                  <span className="font-medium">{s.email}</span>
                  <span className="text-muted-foreground text-xs">{s.source_page ?? "—"} · {timeAgo(s.created_at)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div className="space-y-2">
            {orders.length === 0 && <p className="text-muted-foreground py-12 text-center">No upgrade orders yet.</p>}
            {orders.map((o) => (
              <div key={o.id} className="bg-card border border-border rounded-xl px-5 py-4 text-sm space-y-1">
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-semibold">{o.employer_name} <span className="text-muted-foreground font-normal">· {o.contact_email}</span></span>
                  <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${o.status === "pending" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>{o.status}</span>
                </div>
                <p className="text-muted-foreground">{o.notes ?? o.tier}</p>
                {o.status === "pending" && (
                  <button
                    onClick={async () => {
                      await supabase.from("listing_orders").update({ status: "invoiced" }).eq("id", o.id);
                      load();
                    }}
                    className="text-xs font-semibold text-accent hover:underline"
                  >
                    Mark invoiced
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "leads" && (
          <div className="space-y-2">
            {leads.length === 0 && <p className="text-muted-foreground py-12 text-center">No sponsor leads yet.</p>}
            {leads.map((l) => (
              <div key={l.id} className="bg-card border border-border rounded-xl px-5 py-4 text-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-semibold">{l.company} <span className="text-muted-foreground font-normal">· {l.contact_email}</span></span>
                  <span className="text-xs text-muted-foreground">{l.placement ?? "site"} · {timeAgo(l.created_at)}</span>
                </div>
                {l.message && <p className="text-muted-foreground mt-1">{l.message}</p>}
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {(tab === "pending" || tab === "live") && jobs.length === 0 && <p className="text-muted-foreground py-12 text-center">Nothing here.</p>}
          {(tab === "pending" || tab === "live") && jobs.map((j) => (
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
                {tab === "live" && (
                  <details className="mt-2">
                    <summary className="text-xs font-semibold text-muted-foreground cursor-pointer hover:text-accent">
                      Curate: {j.is_remote ? "remote · " : ""}{(j.tags ?? []).join(", ") || "no tags"}
                    </summary>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <button
                        onClick={() => toggleRemote(j)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition ${j.is_remote ? "bg-fairway text-cream border-fairway" : "border-border bg-card hover:border-fairway"}`}
                      >
                        Remote
                      </button>
                      {CURATION_TAGS.map((t) => (
                        <button
                          key={t}
                          onClick={() => toggleTag(j, t)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition ${(j.tags ?? []).includes(t) ? "bg-fairway text-cream border-fairway" : "border-border bg-card hover:border-fairway"}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </details>
                )}
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
