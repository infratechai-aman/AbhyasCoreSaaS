import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050816]/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-1 via-brand-2 to-brand-3 shadow-glow">
            <Sparkles className="h-5 w-5 text-slate-950" />
          </div>
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.3em] text-brand-4">AbhyasCore</div>
            <div className="text-xs text-muted">Mock mastery for JEE & NEET</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted lg:flex">
          <Link href="#features">Features</Link>
          <Link href="#subjects">Subjects</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="ghost">Log In</Button>
          <Button>Start Free</Button>
        </div>
      </div>
    </header>
  );
}
