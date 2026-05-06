"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Bell, Shield, Moon, ChevronRight, Check, Zap, Target } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function SettingsPage() {
  const { userData } = useAuth();
  const [notifications, setNotifications] = useState({ email: true, practice: true, results: false });
  const [dailyGoal, setDailyGoal] = useState(30);

  return (
    <DashboardShell>
      <div className="flex flex-col h-full bg-[#fafafc] p-4 md:p-8 overflow-x-hidden overflow-y-auto">
        
        {/* Header */}
        <div className="mb-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold tracking-[0.2em] uppercase mb-4 shadow-sm">
            <Shield className="w-3.5 h-3.5" /> Account & Preferences
          </div>
          <h2 className="text-[32px] font-display font-bold text-slate-900 tracking-tight leading-none mb-3">Settings</h2>
          <p className="text-slate-500 text-[14px]">
            Personalize your AbhyasCore experience. Changes are synced across all your devices.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-8 max-w-5xl">
          
          {/* Left Column */}
          <div className="space-y-6">
            
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
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                    <Zap className="w-2.5 h-2.5" /> Premium Member
                  </span>
                </div>
                <button className="px-4 py-2 rounded-xl border border-slate-200 text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                  Edit
                </button>
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

          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Billing & Subscription */}
            <div className="bg-white rounded-[24px] border border-slate-200/60 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <h3 className="text-[15px] font-bold text-slate-900 mb-5">Billing & Subscription</h3>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-[13px] font-bold text-slate-900">Current Plan</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${userData?.subscription?.plan && userData.subscription.plan !== "Free" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                       {userData?.subscription?.status === "active" ? "Active" : userData?.subscription?.plan && userData.subscription.plan !== "Free" ? "Inactive" : "Free"}
                    </span>
                 </div>
                 <div className="text-[16px] font-display font-bold text-indigo-600 mb-3">
                    {userData?.subscription?.plan && userData.subscription.plan !== "Free" ? userData.subscription.plan : "Basic Free Tier"}
                 </div>
                 
                 {/* Subscription Details */}
                 {userData?.subscription?.plan && userData.subscription.plan !== "Free" && (
                   <div className="space-y-2 pt-2 border-t border-slate-200">
                     <div className="flex justify-between text-[12px]">
                       <span className="text-slate-500 font-medium">Status</span>
                       <span className="font-bold text-emerald-600 capitalize">{userData?.subscription?.status || "active"}</span>
                     </div>
                     {userData?.subscription?.subscriptionId && (
                       <div className="flex justify-between text-[12px]">
                         <span className="text-slate-500 font-medium">Subscription ID</span>
                         <span className="font-mono text-slate-700 text-[11px]">
                           {userData.subscription.subscriptionId.slice(0, 8)}...{userData.subscription.subscriptionId.slice(-4)}
                         </span>
                       </div>
                     )}
                     <div className="flex justify-between text-[12px]">
                       <span className="text-slate-500 font-medium">Billing Cycle</span>
                       <span className="font-bold text-slate-700">
                         {userData?.subscription?.plan?.includes("Yearly") ? "Annual" : userData?.subscription?.plan?.includes("Weekly") ? "Weekly" : "Monthly"}
                       </span>
                     </div>
                     <div className="flex justify-between text-[12px]">
                       <span className="text-slate-500 font-medium">Auto-Renewal</span>
                       <span className="font-bold text-slate-700">{userData?.subscription?.status === "active" ? "Enabled" : "Disabled"}</span>
                     </div>
                   </div>
                 )}

                 {(!userData?.subscription?.plan || userData?.subscription?.plan === "Free") && (
                   <div className="text-[11px] text-slate-500 font-medium">
                      Upgrade to Pro to unlock advanced AI practice, PYQs, and unlimited mocks.
                   </div>
                 )}
              </div>
              <div className="flex flex-col gap-2">
                 {(!userData?.subscription?.plan || userData?.subscription?.plan === "Free" || userData?.subscription?.plan?.includes("Monthly")) && (
                   <button onClick={() => window.location.href = "/dashboard?checkout=Pro Yearly"} className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[13px] transition-colors shadow-sm flex items-center justify-center gap-2">
                      <Zap className="w-3.5 h-3.5" />
                      {userData?.subscription?.plan?.includes("Monthly") ? "Upgrade to Yearly (Save 32%)" : "Upgrade to Pro — ₹399/year"}
                   </button>
                 )}
                 {(!userData?.subscription?.plan || userData?.subscription?.plan === "Free") && (
                   <button onClick={() => window.location.href = "/dashboard?checkout=Pro Monthly"} className="w-full py-2.5 rounded-xl border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold text-[13px] transition-colors flex items-center justify-center gap-2">
                      Pro Monthly — ₹49/mo
                   </button>
                 )}
                 {userData?.subscription?.plan && userData.subscription.plan !== "Free" && (
                   <button 
                     onClick={() => {
                       if (confirm("Are you sure you want to cancel your subscription? You will lose access to Pro features at the end of your current billing cycle. To cancel, you can also visit your Razorpay email receipt and click 'Manage Subscription'.")) {
                         window.open("mailto:support@abhyascore.com?subject=Cancel%20Subscription%20Request&body=Please%20cancel%20my%20subscription.%20My%20email%20is%20" + encodeURIComponent(userData?.email || ""), "_blank");
                       }
                     }} 
                     className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-[13px] transition-colors mt-1"
                   >
                      Cancel Subscription
                   </button>
                 )}
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
    </DashboardShell>
  );
}
