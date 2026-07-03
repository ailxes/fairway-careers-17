import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PERK_META, slugify, formatComp } from "@/lib/jobs";
import { toast } from "sonner";

export const Route = createFileRoute("/post")({
  component: PostJob,
});

const schema = z.object({
  title: z.string().trim().min(3).max(120),
  employer: z.string().trim().min(2).max(120),
  location: z.string().trim().min(2).max(120),
  role_category: z.string().min(1),
  job_type: z.enum(["seasonal", "year-round", "tour", "remote"]),
  comp_min: z.number().min(0).max(2000000).optional(),
  comp_max: z.number().min(0).max(2000000).optional(),
  comp_notes: z.string().max(120).optional(),
  description: z.string().min(20).max(4000),
  apply_url: z.string().url().max(500),
  photo_url: z.string().url().max(500).optional().or(z.literal("")),
});

const ROLES = ["Caddie", "Professional", "Operations", "Sales", "Media", "Retail", "Hospitality", "Marketing", "Fitting"];
const UPSELLS = [
  { key: "highlight", label: "Highlight color", price: 49 },
  { key: "pin", label: "Pin to top for 14 days", price: 149 },
  { key: "logo", label: "Show company logo", price: 29 },
  { key: "newsletter", label: "Newsletter blast", price: 199 },
  { key: "social", label: "Social feature", price: 99 },
];

function PostJob() {
  const [form, setForm] = useState({
    title: "",
    employer: "",
    location: "",
    role_category: "Professional",
    job_type: "year-round" as const,
    comp_min: "",
    comp_max: "",
    comp_notes: "",
    description: "",
    apply_url: "",
    photo_url: "",
    perks: [] as string[],
  });
  const [upsells, setUpsells] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const upsellTotal = UPSELLS.filter((u) => upsells[u.key]).reduce((s, u) => s + u.price, 0);

  const togglePerk = (p: string) =>
    setForm((f) => ({ ...f, perks: f.perks.includes(p) ? f.perks.filter((x) => x !== p) : [...f.perks, p] }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({
      ...form,
      comp_min: form.comp_min ? Number(form.comp_min) : undefined,
      comp_max: form.comp_max ? Number(form.comp_max) : undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("jobs").insert({
      title: parsed.data.title,
      employer: parsed.data.employer,
      employer_slug: slugify(parsed.data.employer),
      location: parsed.data.location,
      role_category: parsed.data.role_category,
      job_type: parsed.data.job_type,
      comp_min: parsed.data.comp_min ?? null,
      comp_max: parsed.data.comp_max ?? null,
      comp_notes: parsed.data.comp_notes ?? null,
      perks: form.perks,
      description: parsed.data.description,
      apply_url: parsed.data.apply_url,
      photo_url: parsed.data.photo_url || null,
      is_featured: !!upsells.pin,
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Submitted. Our editor will review within 24h.");
    setForm({ ...form, title: "", description: "", apply_url: "" });
  }

  return (
    <div className="min-h-screen bg-canvas text-fairway">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-12 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-3">
            Post a <span className="font-serif font-normal">cool</span> job.
          </h1>
          <p className="text-muted-foreground text-lg">
            3 minutes. No sales calls. Basic post is free — upsells below for reach.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Form */}
          <form onSubmit={submit} className="lg:col-span-3 space-y-6">
            <Field label="Job title">
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="Head Caddie" />
            </Field>
            <Field label="Employer">
              <input required value={form.employer} onChange={(e) => setForm({ ...form, employer: e.target.value })} className={inputCls} placeholder="Bandon Dunes" />
            </Field>
            <Field label="Location">
              <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputCls} placeholder="Bandon, OR" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Role category">
                <select value={form.role_category} onChange={(e) => setForm({ ...form, role_category: e.target.value })} className={inputCls}>
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </Field>
              <Field label="Job type">
                <select value={form.job_type} onChange={(e) => setForm({ ...form, job_type: e.target.value as never })} className={inputCls}>
                  <option value="year-round">Year-round</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="tour">Tour</option>
                  <option value="remote">Remote</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Min pay ($)">
                <input type="number" value={form.comp_min} onChange={(e) => setForm({ ...form, comp_min: e.target.value })} className={inputCls} placeholder="50000" />
              </Field>
              <Field label="Max pay ($)">
                <input type="number" value={form.comp_max} onChange={(e) => setForm({ ...form, comp_max: e.target.value })} className={inputCls} placeholder="70000" />
              </Field>
              <Field label="Comp notes">
                <input value={form.comp_notes} onChange={(e) => setForm({ ...form, comp_notes: e.target.value })} className={inputCls} placeholder="+ tips" />
              </Field>
            </div>

            <Field label="Perks">
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(PERK_META).map(([k, meta]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => togglePerk(k)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition ${form.perks.includes(k) ? "bg-fairway text-cream border-fairway" : "border-border bg-card hover:border-fairway"}`}
                  >
                    {meta.icon} {meta.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Description">
              <textarea required rows={6} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} placeholder="What makes this job great?" />
            </Field>
            <Field label="Apply URL">
              <input required type="url" value={form.apply_url} onChange={(e) => setForm({ ...form, apply_url: e.target.value })} className={inputCls} placeholder="https://..." />
            </Field>
            <Field label="Photo URL (optional)">
              <input type="url" value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} className={inputCls} placeholder="https://..." />
            </Field>

            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Boost your post</h3>
              <div className="space-y-3">
                {UPSELLS.map((u) => (
                  <label key={u.key} className="flex items-center justify-between gap-3 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!!upsells[u.key]}
                        onChange={(e) => setUpsells((s) => ({ ...s, [u.key]: e.target.checked }))}
                        className="h-5 w-5 accent-[oklch(0.68_0.19_32)]"
                      />
                      <span className="font-medium">{u.label}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">${u.price}</span>
                  </label>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm">
                <span className="text-muted-foreground">Total upsells</span>
                <span className="font-semibold">${upsellTotal}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-accent text-accent-foreground py-4 rounded-xl font-semibold text-lg hover:brightness-105 transition disabled:opacity-60"
            >
              {submitting ? "Submitting…" : upsellTotal > 0 ? `Continue to checkout ($${upsellTotal})` : "Submit for review"}
            </button>
            <p className="text-xs text-muted-foreground text-center">
              Basic posts free. Human review within 24h. Upsells billed via Stripe.
            </p>
          </form>

          {/* Live preview */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Live preview</p>
              <div
                className={`bg-card rounded-2xl overflow-hidden ring-1 transition-all ${upsells.pin ? "ring-accent/40 shadow-xl shadow-accent/10" : "ring-border"} ${upsells.highlight ? "border-l-4 border-l-accent" : ""}`}
              >
                <div className="h-40 bg-muted overflow-hidden">
                  {form.photo_url ? (
                    <img src={form.photo_url} alt="preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-fairway/20 to-accent/20" />
                  )}
                </div>
                <div className="p-5">
                  {upsells.pin && (
                    <span className="inline-block px-2 py-0.5 bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest rounded mb-2">Featured</span>
                  )}
                  <h3 className="text-lg font-semibold">{form.title || "Job title"}</h3>
                  <p className="text-sm font-medium text-fairway/80">{form.employer || "Employer"}</p>
                  <p className="text-xs text-muted-foreground">{form.location || "Location"}</p>
                  <p className="mt-3 font-semibold">
                    {formatComp(
                      form.comp_min ? Number(form.comp_min) : null,
                      form.comp_max ? Number(form.comp_max) : null,
                      form.comp_notes || null,
                    )}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {form.perks.map((p) => (
                      <span key={p} className="text-xs bg-secondary px-2 py-1 rounded">
                        {PERK_META[p]?.icon} {PERK_META[p]?.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {upsells.newsletter && (
                <p className="mt-3 text-xs text-accent">✦ Included in Friday newsletter blast to 12k+ subscribers</p>
              )}
              {upsells.social && (
                <p className="mt-1 text-xs text-accent">✦ Featured on our Instagram + TikTok</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const inputCls =
  "w-full bg-card border border-border rounded-xl px-4 py-3 text-fairway placeholder:text-muted-foreground outline-none focus:border-accent transition";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold mb-2">{label}</span>
      {children}
    </label>
  );
}
