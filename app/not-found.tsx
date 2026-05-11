import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fafafc] flex items-center justify-center p-6 font-sans selection:bg-indigo-100">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="text-center max-w-md">
        {/* 404 Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-[12px] font-bold tracking-wider uppercase mb-6">
          <Search className="w-3.5 h-3.5" />
          Page Not Found
        </div>

        {/* Giant 404 */}
        <h1 className="text-[120px] sm:text-[160px] font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-200 to-slate-100 leading-none mb-0 select-none">
          404
        </h1>

        <h2 className="text-xl font-bold text-slate-900 mb-3 tracking-tight -mt-4">
          This page doesn&apos;t exist
        </h2>
        <p className="text-slate-500 text-[14px] leading-relaxed mb-8 max-w-sm mx-auto">
          The page you&apos;re looking for may have been moved, deleted, or never existed. Let&apos;s get you back on track.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-[14px] hover:bg-slate-800 transition-all hover:scale-[1.01] active:scale-[0.98] shadow-xl shadow-slate-900/10"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-[14px] hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
