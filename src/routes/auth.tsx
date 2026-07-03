import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: Auth,
});

function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const fn = mode === "signin"
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/admin" } });
    const { error } = await fn;
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success(mode === "signin" ? "Welcome back." : "Account created.");
      navigate({ to: "/admin" });
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-fairway">
      <Header />
      <div className="max-w-md mx-auto px-6 py-24">
        <h1 className="text-3xl font-semibold mb-2">
          {mode === "signin" ? "Sign in" : "Create admin account"}
        </h1>
        <p className="text-muted-foreground mb-8">
          {mode === "signup" ? "First account gets admin access automatically." : "Admins only."}
        </p>
        <form onSubmit={submit} className="space-y-4">
          <input
            required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full bg-card border border-border rounded-xl px-4 py-3 outline-none focus:border-accent"
          />
          <input
            required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (8+ chars)" minLength={8}
            className="w-full bg-card border border-border rounded-xl px-4 py-3 outline-none focus:border-accent"
          />
          <button
            type="submit" disabled={loading}
            className="w-full bg-accent text-accent-foreground py-3 rounded-xl font-semibold hover:brightness-105 transition disabled:opacity-60"
          >
            {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-6 text-sm text-muted-foreground hover:text-accent w-full text-center"
        >
          {mode === "signin" ? "Need an account? Sign up →" : "Have an account? Sign in →"}
        </button>
      </div>
    </div>
  );
}
