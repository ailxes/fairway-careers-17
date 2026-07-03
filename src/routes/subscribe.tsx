import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { subscribe } from "@/lib/subscribe";
import { buildMeta, SITE_NAME } from "@/lib/seo";

export const Route = createFileRoute("/subscribe")({
  head: () => ({
    meta: buildMeta({
      title: `The Friday Digest — ${SITE_NAME}`,
      description:
        "The 5 coolest jobs in golf, delivered every Friday. Caddie gigs, tour media, brand roles, engineering jobs — real comp, real perks, zero spam.",
      path: "/subscribe",
    }),
  }),
  component: SubscribePage,
});

const BULLETS = [
  { title: "The Weekly Five", body: "The five coolest live jobs of the week — the same list on our homepage, before it hits the homepage." },
  { title: "Real comp, always", body: "Every job we send shows pay. No mystery-meat listings, no 'competitive salary' hand-waving." },
  { title: "Jobs you didn't know existed", body: "Course architecture, tour media, launch-monitor engineering, Augusta-adjacent gigs. The stuff that never hits LinkedIn's front page." },
];

function SubscribePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await subscribe(email, "subscribe-page");
    setLoading(false);
    if (!res.ok) return void toast.error("That email didn't take. Try again?");
    setDone(true);
  }

  return (
    <div className="min-h-screen bg-canvas text-fairway">
      <Header />
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Free · Every Friday</p>
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight mb-6">
          The <span className="font-serif font-normal">Friday</span> Digest
        </h1>
        <p className="text-muted-foreground text-lg max-w-[52ch] mx-auto mb-10">
          The five coolest jobs in golf, in your inbox before the weekend. Apply Friday, chill Saturday, interview Monday.
        </p>

        {done ? (
          <div className="bg-card border border-border rounded-2xl p-10">
            <p className="text-2xl font-semibold mb-2">You're in. ⛳</p>
            <p className="text-muted-foreground mb-6">First digest lands Friday. Meanwhile, the live board never closes:</p>
            <Link
              to="/jobs"
              className="inline-block bg-accent text-accent-foreground font-semibold px-8 py-4 rounded-xl hover:brightness-105 transition"
            >
              Browse live jobs →
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-16">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="flex-1 px-6 py-4 bg-card border border-border rounded-xl text-fairway placeholder:text-muted-foreground outline-none focus:border-accent transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-accent text-accent-foreground font-semibold rounded-xl hover:brightness-105 transition disabled:opacity-60"
            >
              {loading ? "…" : "Sign me up"}
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {BULLETS.map((b) => (
            <div key={b.title} className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-semibold mb-2">{b.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
