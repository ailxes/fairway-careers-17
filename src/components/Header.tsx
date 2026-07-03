import { Link } from "@tanstack/react-router";

export function Header({ transparent = false }: { transparent?: boolean }) {
  return (
    <header
      className={
        transparent
          ? "absolute top-0 left-0 right-0 z-30"
          : "sticky top-0 z-30 backdrop-blur-md bg-canvas/80 border-b border-border"
      }
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span
            className={`text-xl font-bold tracking-tight ${transparent ? "text-cream" : "text-fairway"}`}
          >
            Cool Golf Jobs
          </span>
          <span className="text-accent font-serif text-xl leading-none">·</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link
            to="/jobs"
            className={`hover:text-accent transition-colors ${transparent ? "text-cream/90" : "text-fairway"}`}
          >
            Browse Jobs
          </Link>
          <Link
            to="/post"
            className="bg-accent text-accent-foreground px-5 py-2 rounded-full font-semibold hover:brightness-105 transition"
          >
            Post a Job
          </Link>
        </nav>
      </div>
    </header>
  );
}
