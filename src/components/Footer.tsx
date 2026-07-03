import { useState } from "react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { subscribe } from "@/lib/subscribe";
import { SITE_NAME } from "@/lib/seo";

export function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await subscribe(email, "footer");
    setLoading(false);
    if (!res.ok) {
      toast.error("That email didn't take. Try again?");
    } else {
      toast.success(res.already ? "You're already on the list. See you Friday." : "You're in. Friday digest incoming.");
      setEmail("");
    }
  }

  return (
    <footer className="bg-fairway text-cream py-24 px-6 mt-24">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-semibold mb-4 tracking-tight">
          Get the <span className="font-serif">Friday</span> Digest
        </h2>
        <p className="text-cream/70 text-lg mb-10 max-w-[48ch] mx-auto">
          The 5 coolest jobs of the week, one gear rec, and a playlist for the range. Zero spam.
        </p>
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 px-6 py-4 bg-cream/10 border border-cream/20 rounded-xl text-cream placeholder:text-cream/40 outline-none focus:border-cream/60 transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-accent text-accent-foreground font-semibold rounded-xl hover:brightness-105 transition disabled:opacity-60"
          >
            {loading ? "…" : "Sign Me Up"}
          </button>
        </form>

        <div className="mt-20 pt-10 border-t border-cream/10 flex flex-col md:flex-row justify-between items-center gap-6 text-cream/40 text-xs font-medium tracking-wider">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            <Link to="/jobs" className="hover:text-accent transition">BROWSE</Link>
            <Link to="/remote-golf-jobs" className="hover:text-accent transition">REMOTE</Link>
            <Link to="/collections/$slug" params={{ slug: "women-in-golf" }} className="hover:text-accent transition">WOMEN IN GOLF</Link>
            <Link to="/collections/$slug" params={{ slug: "internships" }} className="hover:text-accent transition">INTERNSHIPS</Link>
            <Link to="/subscribe" className="hover:text-accent transition">NEWSLETTER</Link>
            <Link to="/post" className="hover:text-accent transition">POST A JOB</Link>
            <Link to="/admin" className="hover:text-accent transition">ADMIN</Link>
          </div>
          <p>© 2026 {SITE_NAME.toUpperCase()} · PLAY AWAY</p>
        </div>
      </div>
    </footer>
  );
}
