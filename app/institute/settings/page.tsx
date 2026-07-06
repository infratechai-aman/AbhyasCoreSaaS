"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function InstituteSettingsPage() {
  const { user, userData, logout } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/institute/login");
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-[#0f172a] mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Settings
        </h2>
        <p className="text-xs font-medium text-[#64748b]">Manage your institute profile, preferences, and account.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Institute Profile */}
        <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#e2e8f0]">
            <h3 className="text-[13px] font-extrabold text-[#0f172a]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Institute Profile
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748b] mb-1.5 block">Institute Name</label>
              <input type="text" defaultValue="" placeholder="Your Institute Name" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-[#7c3aed] transition-colors" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748b] mb-1.5 block">Email</label>
              <input type="email" defaultValue={user?.email || ""} disabled className="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-lg text-[13px] text-slate-500 outline-none cursor-not-allowed" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748b] mb-1.5 block">Phone / WhatsApp</label>
              <input type="tel" defaultValue="" placeholder="+91 98765 43210" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-[#7c3aed] transition-colors" />
            </div>
            <button
              disabled={saving}
              className="px-5 py-2.5 bg-[#7c3aed] text-white rounded-lg text-[12px] font-bold shadow-[0_2px_8px_rgba(124,58,237,0.3)] hover:bg-[#6d28d9] transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#e2e8f0]">
            <h3 className="text-[13px] font-extrabold text-[#0f172a]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Account
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-1">Logged in as</div>
              <div className="text-[13px] font-bold text-slate-800">{user?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-2.5 border border-red-200 text-red-600 rounded-lg text-[12px] font-bold hover:bg-red-50 transition-colors"
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
