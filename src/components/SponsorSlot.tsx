import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Sponsor lead capture. This is deliberately a form, not a mailto: the whole
 * point is that interested brands land in the sponsor_leads table where they
 * can be followed up and invoiced — an email intent that bounces off a mail
 * client is a lead lost.
 */
export function SponsorSlot({ placement }: { placement: "site" | "newsletter" }) {
  const [open, setOpen] = useState(false);
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("sponsor_leads").insert({
      company,
      contact_email: email.trim().toLowerCase(),
      placement,
    });
    setLoading(false);
    if (error) return void toast.error("Didn't go through — try again?");
    setDone(true);
  }

  return (
    <div className="bg-card border border-dashed border-border rounded-2xl p-6 text-center">
      {done ? (
        <p className="font-semibold">Got it — we'll be in touch this week. 🤝</p>
      ) : open ? (
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          <input
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Brand / company"
            className="bg-canvas border border-border rounded-full px-5 py-2.5 text-sm outline-none focus:border-accent flex-1 min-w-0"
          />
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@brand.com"
            className="bg-canvas border border-border rounded-full px-5 py-2.5 text-sm outline-none focus:border-accent flex-1 min-w-0"
          />
          <button disabled={loading} className="bg-fairway text-cream px-6 py-2.5 rounded-full font-semibold text-sm disabled:opacity-60">
            {loading ? "…" : "Talk sponsorship"}
          </button>
        </form>
      ) : (
        <button onClick={() => setOpen(true)} className="group">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
            Your brand here
          </p>
          <p className="text-sm text-muted-foreground group-hover:text-accent transition">
            Reach golf-obsessed job seekers {placement === "newsletter" ? "in the Friday Digest" : "on every page"} →
          </p>
        </button>
      )}
    </div>
  );
}
