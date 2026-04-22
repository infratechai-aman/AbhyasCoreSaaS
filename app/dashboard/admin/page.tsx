"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/lib/auth-context";
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ShieldCheck, UserCheck, Crown, Search, Loader2 } from "lucide-react";

// List of allowed admin emails who can access this page
const ADMIN_EMAILS = [
  "admin@abhyascore.com",
  "founder@abhyascore.com",
  "test@example.com" // You can change this to your actual email
];

export default function AdminPromoPage() {
  const { user, userData } = useAuth();
  
  const [emailQuery, setEmailQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [foundUser, setFoundUser] = useState<any>(null);

  // Simple Security Check
  if (userData && user && !ADMIN_EMAILS.includes(user.email || "") && !userData.isAdmin) {
     return (
       <DashboardShell>
         <div className="flex flex-col items-center justify-center p-20 text-center">
            <ShieldCheck className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
            <p className="text-slate-500">You do not have administrative privileges to view this page.</p>
         </div>
       </DashboardShell>
     );
  }

  const handleSearch = async () => {
    if (!emailQuery.trim()) return;
    setLoading(true);
    setMessage({ text: "", type: "" });
    setFoundUser(null);
    
    try {
      const q = query(collection(db, "users"), where("email", "==", emailQuery.trim().toLowerCase()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        setMessage({ text: "No user found with that email address. Make sure they have registered first.", type: "error" });
      } else {
        const userDoc = snap.docs[0];
        setFoundUser({ id: userDoc.id, ...userDoc.data() });
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ text: "Error searching for user. Check console.", type: "error" });
    }
    setLoading(false);
  };

  const grantPro = async () => {
    if (!foundUser) return;
    setLoading(true);
    try {
      const userRef = doc(db, "users", foundUser.id);
      await updateDoc(userRef, {
        "subscription.plan": "Pro Yearly",
        "subscription.status": "active",
        "subscription.razorpaySubscriptionId": "MANUAL_PROMO_CREATOR_" + Date.now(),
        "maxTierPassed": 10,
        "updatedAt": serverTimestamp(),
        "isPromo": true
      });
      
      // Update local state to show success
      setFoundUser({
        ...foundUser,
        subscription: { plan: "Pro Yearly", status: "active" },
        maxTierPassed: 10
      });
      setMessage({ text: "Successfully instantly upgraded " + foundUser.email + " to Pro Yearly & Unlocked all Tiers!", type: "success" });
    } catch (err: any) {
      console.error("Upgrade error:", err);
      setMessage({ text: "Failed to upgrade user. Your Firestore rules might be blocking client-side updates to other users.", type: "error" });
    }
    setLoading(false);
  };

  return (
    <DashboardShell>
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <div className="mb-8 border-b border-slate-200 pb-6">
           <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-indigo-600" /> Admin Promotional Portal
           </h1>
           <p className="text-slate-500 mt-2">Provision lifetime 'Pro Yearly' accounts to creators and influencers directly from here without going into Firebase.</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
           
           <h2 className="text-lg font-bold text-slate-900 mb-4">Find User by Email</h2>
           
           <div className="flex items-center gap-3 mb-6">
              <div className="relative flex-1">
                 <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                 <input 
                   type="email" 
                   value={emailQuery}
                   onChange={(e) => setEmailQuery(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                   placeholder="e.g. creator@youtube.com"
                   className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm font-medium"
                 />
              </div>
              <button 
                onClick={handleSearch}
                disabled={loading || !emailQuery}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center min-w-[120px]"
              >
                {loading && !foundUser ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
              </button>
           </div>

           {message.text && (
             <div className={`p-4 rounded-xl text-sm font-medium mb-6 flex items-center gap-2 ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                {message.type === 'success' ? <UserCheck className="w-4 h-4" /> : null}
                {message.text}
             </div>
           )}

           {foundUser && (
             <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-4">User Profile Preview</h3>
                <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100 gap-4">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-100 text-indigo-700 font-bold rounded-full flex items-center justify-center text-lg shadow-sm">
                         {(foundUser.name || "C").charAt(0).toUpperCase()}
                      </div>
                      <div>
                         <div className="font-bold text-slate-900">{foundUser.name || "Unknown Creator"}</div>
                         <div className="text-sm text-slate-500">{foundUser.email}</div>
                         <div className="text-[11px] mt-1 font-semibold flex items-center gap-1.5 text-indigo-600">
                            Status: <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md uppercase tracking-wider">{foundUser.subscription?.plan || "Free Tier"}</span>
                         </div>
                      </div>
                   </div>
                   
                   <button 
                      onClick={grantPro}
                      disabled={loading || foundUser.subscription?.plan?.includes("Pro") && foundUser.subscription?.status === "active"}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                   >
                     {loading && foundUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                     {foundUser.subscription?.plan?.includes("Pro") && foundUser.subscription?.status === "active" ? "Already Pro" : "Grant Pro Access"}
                   </button>
                </div>
             </div>
           )}
        </div>
      </div>
    </DashboardShell>
  );
}
