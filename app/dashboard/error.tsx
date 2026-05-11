"use client";

import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="mx-auto w-14 h-14 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center mb-5">
          <AlertTriangle className="w-6 h-6 text-rose-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">
          Something went wrong
        </h2>
        <p className="text-slate-500 text-[13px] leading-relaxed mb-6">
          We encountered an error loading your dashboard. This has been logged automatically.
          {error.digest && (
            <span className="block mt-1 text-[11px] text-slate-400 font-mono">
              Ref: {error.digest}
            </span>
          )}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-[13px] hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry
          </button>
          <a
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-[13px] hover:bg-slate-50 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            Home
          </a>
        </div>
      </div>
    </div>
  );
}
