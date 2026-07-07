"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Settings, User, LogOut, Shield, Bell, Save } from "lucide-react";

export default function InstituteSettingsPage() {
  const { user, userData, logout } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/institute/login");
  };

  return (
    <div className="flex-1 p-5 md:p-8">
      <div className="mb-8">
        <h2 className="text-[24px] font-semibold text-slate-900 tracking-tight mb-1">Settings</h2>
        <p className="text-[14px] text-slate-500">Manage your institute profile, preferences, and account.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-4xl">
        {/* Institute Profile */}
        <div className="bg-white rounded-[16px] border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <h3 className="text-[14px] font-bold text-slate-900">Institute Profile</h3>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-2 block">Institute Name</label>
              <input type="text" defaultValue="" placeholder="Your Institute Name" className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[13px] outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-2 block">Email</label>
              <input type="email" defaultValue={user?.email || ""} disabled className="w-full h-11 px-4 bg-slate-100 border border-slate-200 rounded-xl text-[13px] text-slate-400 outline-none cursor-not-allowed" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-2 block">Phone / WhatsApp</label>
              <input type="tel" defaultValue="" placeholder="+91 98765 43210" className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[13px] outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all" />
            </div>
            <button
              disabled={saving}
              className="flex items-center justify-center gap-2 h-10 px-5 bg-indigo-600 text-white rounded-xl text-[13px] font-semibold shadow-[0_2px_8px_rgba(79,70,229,0.25)] hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Account Actions */}
        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-[16px] border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Shield className="h-4 w-4" />
              </div>
              <h3 className="text-[14px] font-bold text-slate-900">Account</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-1">Logged in as</div>
                <div className="text-[13px] font-bold text-slate-900">{user?.email || "dev@demo.com"}</div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 border border-red-200 text-red-600 rounded-xl text-[13px] font-semibold hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[16px] border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <Bell className="h-4 w-4" />
              </div>
              <h3 className="text-[14px] font-bold text-slate-900">Notifications</h3>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-medium text-slate-900">Email Notifications</div>
                  <div className="text-[12px] text-slate-500 mt-0.5">Get notified when students complete exams</div>
                </div>
                <button className="relative w-10 h-5 rounded-full bg-indigo-600 transition-all cursor-pointer">
                  <span className="absolute top-0.5 left-[22px] w-4 h-4 rounded-full bg-white shadow-sm transition-all" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
