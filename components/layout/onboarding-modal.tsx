"use client";

import { useState } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Target, Activity, Atom } from "lucide-react";
import { Subject } from "@/lib/types";

export function OnboardingModal() {
  const { user, userData } = useAuth();
  const [saving, setSaving] = useState(false);

  // If we already have a target exam, don't show the modal
  if (!userData || userData.targetExam !== null) return null;

  const handleSelection = async (exam: "JEE" | "NEET") => {
    if (!user || !db || saving) return;
    setSaving(true);
    
    try {
      await updateDoc(doc(db, "users", user.uid), {
        targetExam: exam
      });
      // Force reload to refresh auth context and dashboard syllabus
      window.location.reload();
    } catch (error) {
      console.error("Failed to save target exam", error);
      alert("Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden p-10 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
        
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
          <Target className="w-8 h-8" />
        </div>
        
        <h2 className="text-[32px] font-display font-bold text-slate-900 leading-tight mb-3">Welcome to RankForge!</h2>
        <p className="text-slate-500 text-[15px] max-w-md mx-auto mb-10 leading-relaxed">
          To personalize your curriculum, mock tests, and AI analytics, please select your primary target examination.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
          
          <button 
            onClick={() => handleSelection("JEE")}
            disabled={saving}
            className="group relative bg-white border-2 border-slate-200 hover:border-indigo-600 rounded-[24px] p-6 text-left transition-all hover:shadow-[0_8px_30px_rgb(79,70,229,0.12)] cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:text-indigo-600 transition-colors">
              <Atom className="w-24 h-24 -mt-6 -mr-6" />
            </div>
            
            <div className="relative z-10">
              <div className="w-12 h-12 bg-slate-100 group-hover:bg-indigo-100 text-slate-400 group-hover:text-indigo-600 rounded-xl flex items-center justify-center transition-colors mb-4">
                <Atom className="w-6 h-6" />
              </div>
              <h3 className="text-[22px] font-display font-bold text-slate-900 mb-2">JEE Main & Adv</h3>
              <p className="text-[13px] text-slate-500 font-medium">Physics • Chemistry • Mathematics</p>
            </div>
          </button>

          <button 
            onClick={() => handleSelection("NEET")}
            disabled={saving}
            className="group relative bg-white border-2 border-slate-200 hover:border-emerald-500 rounded-[24px] p-6 text-left transition-all hover:shadow-[0_8px_30px_rgb(16,185,129,0.12)] cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:text-emerald-500 transition-colors">
              <Activity className="w-24 h-24 -mt-6 -mr-6" />
            </div>
            
            <div className="relative z-10">
              <div className="w-12 h-12 bg-slate-100 group-hover:bg-emerald-100 text-slate-400 group-hover:text-emerald-600 rounded-xl flex items-center justify-center transition-colors mb-4">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-[22px] font-display font-bold text-slate-900 mb-2">NEET (UG)</h3>
              <p className="text-[13px] text-slate-500 font-medium">Physics • Chemistry • Biology</p>
            </div>
          </button>

        </div>

        {saving && (
          <div className="mt-8 text-[13px] font-bold text-indigo-600 animate-pulse">
            Configuring your syllabus...
          </div>
        )}
        
      </div>
    </div>
  );
}
