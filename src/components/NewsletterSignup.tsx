import { useState } from "react";
import { toast } from "sonner";
import { subscribe } from "@/lib/subscribe";

/**
 * Reusable email capture. `variant`:
 *  - "card": dark stacked card (sidebars, landing pages)
 *  - "inline": single row on light background (below job grids)
 * Keep the pitch consistent everywhere: the Friday Digest = the Weekly Five, emailed.
 */
export function NewsletterSignup({
  sourcePage,
  variant = "card",
  heading = "Get the Friday Digest",
  subtext = "The 5 coolest jobs in golf, in your inbox every Friday. Zero spam.",
}: {
  sourcePage: string;
  variant?: "card" | "inline";
  heading?: string;
  subtext?: string;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await subscribe(email, sourcePage);
    setLoading(false);
    if (!res.ok) {
      toast.error("That email didn't take. Try again?");
      return;
    }
    setDone(true);
    toast.success(res.already ? "You're already on the list. See you Friday." : "You're in. Friday digest incoming.");
    setEmail("");
  }

  if (variant === "inline") {
    return (
      <form
        onSubmit={onSubmit}
        className="bg-fairway text-cream rounded-2xl p-6 flex flex-col md:flex-row gap-3 items-center"
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold">{heading} →</p>
          <p className="text-cream/60 text-sm">{subtext}</p>
        </div>
        {done ? (
          <p className="text-accent font-semibold text-sm">You're on the list ⛳</p>
        ) : (
          <>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="bg-cream/10 border border-cream/20 rounded-full px-5 py-2.5 text-sm text-cream placeholder:text-cream/40 outline-none focus:border-cream/60 flex-1 min-w-0 md:max-w-xs"
            />
            <button
              disabled={loading}
              className="bg-accent text-accent-foreground px-6 py-2.5 rounded-full font-semibold text-sm disabled:opacity-60"
            >
              {loading ? "…" : "Sign me up"}
            </button>
          </>
        )}
      </form>
    );
  }

  return (
    <div className="bg-fairway text-cream rounded-2xl p-6 space-y-4">
      <p className="text-cream/60 text-xs uppercase tracking-widest">The Friday Digest</p>
      <p className="font-semibold text-lg leading-snug">{heading}</p>
      <p className="text-cream/60 text-sm">{subtext}</p>
      {done ? (
        <p className="text-accent font-semibold">You're on the list ⛳</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full bg-cream/10 border border-cream/20 rounded-xl px-5 py-3 text-sm text-cream placeholder:text-cream/40 outline-none focus:border-cream/60"
          />
          <button
            disabled={loading}
            className="w-full bg-accent text-accent-foreground font-semibold px-6 py-3 rounded-xl hover:brightness-105 transition disabled:opacity-60"
          >
            {loading ? "…" : "Sign me up"}
          </button>
        </form>
      )}
    </div>
  );
}
