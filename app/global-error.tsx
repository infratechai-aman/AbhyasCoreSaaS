"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-[#fafafc] flex items-center justify-center p-6 font-sans">
          <div className="text-center max-w-md">
            <div className="mx-auto w-16 h-16 bg-rose-50 border border-rose-200 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-7 h-7 text-rose-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">
              Something went wrong
            </h1>
            <p className="text-slate-500 text-[14px] leading-relaxed mb-8">
              An unexpected error occurred. This has been logged automatically.
              {error.digest && (
                <span className="block mt-2 text-[12px] text-slate-400 font-mono">
                  Error ID: {error.digest}
                </span>
              )}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={reset}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-[14px] hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </button>
              <a
                href="/"
                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-[14px] hover:bg-slate-50 transition-colors"
              >
                <Home className="w-4 h-4" />
                Go Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
