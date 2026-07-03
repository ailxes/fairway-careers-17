import { supabase } from "@/integrations/supabase/client";

export type Job = {
  id: string;
  title: string;
  employer: string;
  employer_slug: string | null;
  location: string | null;
  state: string | null;
  city: string | null;
  role_category: string | null;
  job_type: string | null;
  comp_min: number | null;
  comp_max: number | null;
  comp_notes: string | null;
  perks: string[] | null;
  description: string | null;
  photo_url: string | null;
  apply_url: string | null;
  source: string | null;
  cool_score: number | null;
  cool_label: string | null;
  is_featured: boolean | null;
  is_featured_weekly: boolean | null;
  weekly_rank: number | null;
  status: string;
  views: number;
  posted_at: string;
};

export const PERK_META: Record<string, { icon: string; label: string }> = {
  playing_privileges: { icon: "🏌️", label: "Free Golf" },
  housing: { icon: "🏠", label: "Housing" },
  meals: { icon: "🍽️", label: "Meals" },
  gear_discount: { icon: "🎽", label: "Gear" },
  pga_dues: { icon: "📜", label: "PGA Dues" },
  travel: { icon: "✈️", label: "Travel" },
};

export function formatComp(min: number | null, max: number | null, notes: string | null): string {
  const fmt = (n: number) => (n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`);
  if (min && max) return `${fmt(min)} – ${fmt(max)}${notes ? ` · ${notes}` : ""}`;
  if (min) return `${fmt(min)}+${notes ? ` · ${notes}` : ""}`;
  return notes ?? "Comp on request";
}

export function coolLabel(score: number | null): string {
  const s = score ?? 0;
  if (s >= 95) return "Legendary";
  if (s >= 88) return "Very Cool";
  if (s >= 78) return "Cool";
  return "Solid";
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const days = Math.floor(diff / 86400000);
  if (days === 0) {
    const h = Math.floor(diff / 3600000);
    return h <= 1 ? "just now" : `${h}h ago`;
  }
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export async function fetchLiveJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "live")
    .order("is_featured", { ascending: false })
    .order("posted_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Job[];
}

export async function fetchWeeklyFive(): Promise<Job[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "live")
    .eq("is_featured_weekly", true)
    .order("weekly_rank", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Job[];
}

export async function fetchJob(id: string): Promise<Job | null> {
  const { data, error } = await supabase.from("jobs").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Job | null;
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
