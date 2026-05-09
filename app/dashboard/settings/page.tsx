"use client";

import { useState, useMemo } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { 
  Bell, Shield, Moon, ChevronRight, Check, Zap, Target, 
  Crown, Calendar, CreditCard, Clock, AlertTriangle,
  Sparkles, ArrowUpRight, X
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { authenticatedFetch } from "@/lib/api";

export default function SettingsPage() {
  const { userData, user } = useAuth();
  const [notifications, setNotifications] = useState({ email: true, practice: true, results: false });
  const [dailyGoal, setDailyGoal] = useState(30);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Derive subscription info
  const sub = userData?.subscription;
  const isPro = sub?.status === "active" && sub?.plan && sub.plan !== "Free";
  const planName = isPro ? sub.plan : "Free Tier";
  const isMonthly = sub?.plan?.includes("Monthly");
  const isYearly = sub?.plan?.includes("Yearly");
  const isWeekly = sub?.plan?.includes("Weekly");

  // Calculate next billing date
  const nextBillingDate = useMemo(() => {
    if (!isPro || !sub?.activatedAt) return null;
    const activated = new Date(sub.activatedAt);
    const now = new Date();
    
    if (isYearly) {
      // Add years until we're in the future
      let next = new Date(activated);
      while (next <= now) {
        next.setFullYear(next.getFullYear() + 1);
      }
      return next;
    } else if (isWeekly) {
      let next = new Date(activated);
      while (next <= now) {
        next.setDate(next.getDate() + 7);
      }
      return next;
    } else {
      // Monthly
      let next = new Date(activated);
      while (next <= now) {
        next.setMonth(next.getMonth() + 1);
      }
      return next;
    }
  }, [isPro, sub?.activatedAt, isYearly, isWeekly]);

  const daysUntilBilling = useMemo(() => {
    if (!nextBillingDate) return null;
    const diff = nextBillingDate.getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [nextBillingDate]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  };

  const planPrice = isYearly ? "₹399" : isWeekly ? "₹49" : "₹49";
  const billingCycle = isYearly ? "year" : isWeekly ? "week" : "month";

  const handleCancelSubscription = async () => {
    setCancelling(true);
    try {
      // Open email for cancellation request
      window.open(
        `mailto:support@abhyascore.com?subject=Cancel%20Subscription%20Request&body=Please%20cancel%20my%20subscription.%0A%0AEmail:%20${encodeURIComponent(userData?.email || "")}%0ASubscription%20ID:%20${encodeURIComponent(sub?.razorpaySubscriptionId || "")}`,
        "_blank"
      );
    } finally {
      setCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  return (
    <DashboardShell>
      <div className="flex flex-col h-full bg-[#fafafc] p-4 md:p-8 overflow-x-hidden overflow-y-auto">
        
        {/* Header */}
        <div className="mb-8 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold tracking-[0.2em] uppercase mb-4 shadow-sm">
            <Shield className="w-3.5 h-3.5" /> Account & Preferences
          </div>
          <h2 className="text-[32px] font-display font-bold text-slate-900 tracking-tight leading-none mb-3">Settings</h2>
          <p className="text-slate-500 text-[14px]">
            Manage your membership, billing, and preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-8 max-w-5xl">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* ═══════════ MEMBERSHIP SECTION (Netflix-style) ═══════════ */}
            <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="p-6 pb-0">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className={`w-5 h-5 ${isPro ? "text-indigo-600" : "text-slate-400"}`} />
                  <h3 className="text-[18px] font-display font-bold text-slate-900">Membership</h3>
                </div>
                <p className="text-[12px] text-slate-500 mb-5">Plan Details</p>
              </div>

              {/* Plan Card with gradient top border */}
              <div className="mx-6 mb-5">
                <div className="rounded-xl overflow-hidden border border-slate-200">
                  <div className={`h-1.5 ${isPro ? "bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-600" : "bg-slate-300"}`} />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[15px] font-bold text-slate-900">{planName}</span>
                      {isPro && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-100">Active</span>
                      )}
                    </div>
                    <p className="text-[12px] text-slate-500 leading-relaxed">
                      {isPro 
                        ? `Unlimited mocks, AI tutor, PYQ archive, and full analytics — ${planPrice}/${billingCycle}.`
                        : "Limited access. Upgrade to Pro for unlimited mocks, AI tutor, and more."
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Change Plan Row */}
              {isPro && !isYearly && (
                <button 
                  onClick={() => window.location.href = "/dashboard?checkout=Pro Yearly"}
                  className="mx-6 mb-4 w-[calc(100%-48px)] flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors group"
                >
                  <div>
                    <span className="text-[14px] font-bold text-slate-900">Change plan</span>
                    <p className="text-[11px] text-slate-500">Switch to Yearly and save 32%</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </button>
              )}

              {!isPro && (
                <div className="mx-6 mb-4 space-y-2">
                  <button 
                    onClick={() => window.location.href = "/dashboard?checkout=Pro Monthly"}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors group"
                  >
                    <div className="text-left">
                      <span className="text-[14px] font-bold">Upgrade to Pro</span>
                      <p className="text-[11px] text-indigo-200">₹49/month or ₹399/year — unlock everything</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-indigo-200 group-hover:text-white transition-colors" />
                  </button>
                </div>
              )}

              <div className="border-t border-slate-100" />

              {/* Payment Info Section */}
              <div className="p-6 pt-5">
                <p className="text-[12px] text-slate-500 font-bold uppercase tracking-wider mb-4">Payment Info</p>

                {isPro && nextBillingDate ? (
                  <div className="space-y-0">
                    {/* Next Payment */}
                    <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[14px] font-bold text-slate-900 mb-0.5">Next payment</div>
                        <div className="text-[13px] text-slate-700 font-medium">{formatDate(nextBillingDate)}</div>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {daysUntilBilling === 0 
                            ? "Due today"
                            : daysUntilBilling === 1 
                              ? "Due tomorrow"
                              : `${daysUntilBilling} days remaining`
                          }
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[18px] font-display font-black text-slate-900">{planPrice}</span>
                        <div className="text-[10px] text-slate-400 font-medium">/{billingCycle}</div>
                      </div>
                    </div>

                    {/* Subscription ID */}
                    {sub?.razorpaySubscriptionId && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 mb-3">
                        <span className="text-[11px] text-slate-500 font-medium">Subscription ID</span>
                        <span className="font-mono text-[11px] text-slate-600">
                          {sub.razorpaySubscriptionId.slice(0, 10)}...{sub.razorpaySubscriptionId.slice(-4)}
                        </span>
                      </div>
                    )}

                    {/* Activated On */}
                    {sub?.activatedAt && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 mb-3">
                        <span className="text-[11px] text-slate-500 font-medium">Member since</span>
                        <span className="text-[11px] text-slate-700 font-bold">
                          {formatDate(new Date(sub.activatedAt))}
                        </span>
                      </div>
                    )}

                    {/* Auto-renewal */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[11px] text-slate-500 font-medium">Auto-renewal</span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Enabled
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <CreditCard className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="text-[13px] font-bold text-slate-700">No active subscription</div>
                      <div className="text-[11px] text-slate-500">Upgrade to Pro to start your billing cycle.</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Cancel Membership */}
              {isPro && (
                <>
                  <div className="border-t border-slate-100" />
                  <div className="p-6 pt-4 pb-5">
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="w-full py-3 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50/50 text-red-500 hover:text-red-600 font-bold text-[13px] transition-all"
                    >
                      Cancel Membership
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-[24px] border border-slate-200/60 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <h3 className="text-[15px] font-bold text-slate-900 mb-6">Profile</h3>
              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-display text-[22px] font-bold shadow-lg shadow-indigo-500/20">
                  {userData?.name ? userData.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="flex-1">
                  <div className="text-[16px] font-bold text-slate-900">{userData?.name || "Aspirant"}</div>
                  <div className="text-[12px] text-slate-500 mb-2">{userData?.email || "No email available"}</div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    isPro
                      ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}>
                    <Zap className="w-2.5 h-2.5" />
                    {isPro ? sub.plan : "Free Member"}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Full Name", value: userData?.name || "Aspirant" },
                  { label: "Email Address", value: userData?.email || "No email available" },
                  { label: "Academic Profile", value: userData?.academicClass || "Not specified" },
                ].map((field) => (
                  <div key={field.label} className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{field.label}</label>
                    <div className="h-10 px-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center text-[13px] font-medium text-slate-700">
                      {field.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
          
          {/* Right Column */}
          <div className="space-y-6">

            {/* Exam Target */}
            <div className="bg-white rounded-[24px] border border-slate-200/60 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] relative overflow-hidden">
              <h3 className="text-[15px] font-bold text-slate-900 mb-2">Target Examination</h3>
              <p className="text-[12px] text-slate-500 mb-5 leading-relaxed">
                Your target syllabus is permanently locked to customize question difficulty, subject logic, and AI metrics.
              </p>
              
              <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl w-max">
                 <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold shadow-sm ${
                   userData?.targetExam === "NEET" 
                     ? "bg-emerald-100 text-emerald-600" 
                     : "bg-indigo-100 text-indigo-600"
                 }`}>
                   <Target className="w-5 h-5" />
                 </div>
                 <div>
                    <div className="text-[14px] font-bold text-slate-900">
                      {userData?.targetExam === "NEET" ? "NEET (UG)" : "JEE Main & Adv"}
                    </div>
                    <div className="text-[11px] font-medium text-slate-500">
                      {userData?.targetExam === "NEET" ? "Physics, Chemistry, Biology" : "Physics, Chemistry, Mathematics"}
                    </div>
                 </div>
                 <div className="ml-4 px-3 py-1 bg-slate-200/50 border border-slate-300 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-md">
                   Locked
                 </div>
              </div>
            </div>
            
            {/* Daily Goal */}
            <div className="bg-white rounded-[24px] border border-slate-200/60 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[15px] font-bold text-slate-900">Daily Practice Goal</h3>
                <span className="text-[22px] font-display font-bold text-indigo-600">{dailyGoal}Q</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-full accent-indigo-600 h-2 rounded-full"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2">
                <span>10 Q / day</span>
                <span>100 Q / day</span>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-[24px] border border-slate-200/60 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <h3 className="text-[15px] font-bold text-slate-900 mb-5">Notifications</h3>
              <div className="space-y-4">
                {[
                  { key: "email", label: "Email Digests", desc: "Weekly performance reports" },
                  { key: "practice", label: "Practice Reminders", desc: "Daily study streak alerts" },
                  { key: "results", label: "Mock Test Results", desc: "Instant result notifications" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <div className="text-[13px] font-bold text-slate-800">{item.label}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{item.desc}</div>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                      className={`relative inline-flex w-10 h-5.5 rounded-full transition-colors shrink-0 ${
                        notifications[item.key as keyof typeof notifications] ? "bg-indigo-600" : "bg-slate-200"
                      }`}
                      style={{ height: "22px" }}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${
                        notifications[item.key as keyof typeof notifications] ? "translate-x-4.5" : "translate-x-0"
                      }`} style={{ width: "18px", height: "18px", transform: notifications[item.key as keyof typeof notifications] ? "translateX(18px)" : "translateX(0)" }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-[24px] border border-red-100 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <h3 className="text-[15px] font-bold text-red-600 mb-4">Danger Zone</h3>
              <button className="w-full py-3 rounded-xl border-2 border-red-200 text-red-600 font-bold text-[13px] hover:bg-red-50 transition-colors">
                Reset All Progress Data
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[24px] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300 p-6 text-center relative">
            <button 
              onClick={() => setShowCancelConfirm(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-[18px] font-display font-bold text-slate-900 mb-2">Cancel Membership?</h3>
            <p className="text-[13px] text-slate-500 mb-1 leading-relaxed">
              You&apos;ll lose access to all Pro features at the end of your current billing cycle
              {nextBillingDate ? ` on ${formatDate(nextBillingDate)}` : ""}.
            </p>
            <p className="text-[11px] text-slate-400 mb-6">
              This action will email our support team to process your cancellation.
            </p>

            <div className="space-y-2">
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-[14px] transition-colors"
              >
                {cancelling ? "Processing..." : "Yes, Cancel Membership"}
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="w-full py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[14px] transition-colors"
              >
                Keep My Membership
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
