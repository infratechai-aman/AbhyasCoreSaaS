import Link from "next/link";
import { Sparkles } from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "Mock Tests", href: "/dashboard/tests/mock-live" },
    { label: "Practice Mode", href: "/dashboard/practice" },
    { label: "AI Tutor", href: "/dashboard/ai-tutor" },
    { label: "Performance", href: "/dashboard/performance" },
    { label: "Leaderboard", href: "/dashboard/leaderboard" },
  ],
  Support: [
    { label: "Help Center", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "FAQ", href: "#" },
    { label: "System Status", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press Kit", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-and-conditions" },
    { label: "Refund Policy", href: "/refund-and-cancellation" },
  ],
};

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/8 bg-[#030712] px-4 py-16 text-white lg:px-8">
      {/* Subtle glow */}
      <div className="absolute -bottom-40 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-[#7c3aed] opacity-20 blur-[100px]" />

      <div className="relative mx-auto max-w-[1400px]">
        {/* Top row */}
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          {/* Brand column */}
          <div>
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="AbhyasCore Logo" className="h-20 w-auto object-contain bg-white rounded-lg p-1" />
              <div>
                <div className="font-display text-lg font-bold text-white">AbhyasCore</div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-indigo-300/70">JEE + NEET Platform</div>
              </div>
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-7 text-slate-400">
              India&apos;s most premium AI-powered mock test platform. Exam-real simulations, AI analytics, and rank prediction — all in one place.
            </p>
            <div className="mt-6 flex gap-4">
              {["X", "In", "YT", "IG"].map((social) => (
                <div
                  key={social}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/5 text-xs font-bold text-slate-400 transition-all hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-white"
                >
                  {social}
                </div>
              ))}
            </div>
          </div>

          {/* Links grid */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-300/80">{category}</div>
                <ul className="mt-5 space-y-3.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-400 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="mt-14 border-t border-white/6 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} AbhyasCore. All rights reserved.
            </p>
            <p className="text-xs text-slate-500">
              Built with ❤️ for JEE & NEET aspirants across India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
