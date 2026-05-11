"use client";

import { Loader2 } from "lucide-react";

export default function TestConsoleLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a1628] to-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-white/80 font-semibold text-sm">Preparing your exam...</p>
          <p className="text-white/40 text-xs mt-1">Loading questions & initializing timer</p>
        </div>
      </div>
    </div>
  );
}
