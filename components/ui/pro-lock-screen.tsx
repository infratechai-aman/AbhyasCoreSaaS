"use client";

import { Lock, Sparkles, Crown, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ProLockScreenProps {
  featureName: string;
  description?: string;
  /** If true, shows a trial-expired variant */
  isTrialExpired?: boolean;
}

/**
 * A premium-looking lock screen that blocks free-tier users
 * from accessing Pro-only features.
 */
export function ProLockScreen({ featureName, description, isTrialExpired }: ProLockScreenProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Animated glow background */}
        <div className="relative mx-auto w-24 h-24 mb-8">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-[40px] animate-pulse" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-[28px] flex items-center justify-center shadow-2xl shadow-indigo-600/30">
            <Lock className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold tracking-[0.2em] uppercase mb-5">
          <Crown className="w-3.5 h-3.5" />
          {isTrialExpired ? "Trial Expired" : "Pro Feature"}
        </div>

        <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 tracking-tight mb-3">
          {featureName} is{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
            Pro Only
          </span>
        </h2>

        <p className="text-slate-500 text-[14px] leading-relaxed max-w-sm mx-auto mb-8">
          {description || (
            isTrialExpired
              ? "Your 7-day free trial has expired. Upgrade now to continue accessing premium features and accelerate your preparation."
              : "Unlock this feature and get unlimited access to the most advanced AI-powered preparation engine. Join thousands of serious rankers."
          )}
        </p>

        {/* Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {[
            { icon: Zap, label: "Unlimited Mocks" },
            { icon: Sparkles, label: "AI Analytics" },
            { icon: Crown, label: "Full Access" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-200/60 shadow-sm"
            >
              <item.icon className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="text-[12px] font-bold text-slate-700">{item.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link href="/dashboard?checkout=Pro%20Yearly">
          <button className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl font-bold text-[15px] shadow-xl shadow-indigo-600/25 transition-all hover:scale-[1.02] hover:-translate-y-0.5 flex items-center justify-center gap-3 mx-auto">
            <Crown className="w-5 h-5" />
            Upgrade to Pro — ₹399/yr
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>

        <p className="mt-4 text-[11px] font-medium text-slate-400">
          Cancel anytime • 7-day money back guarantee
        </p>
      </div>
    </div>
  );
}
