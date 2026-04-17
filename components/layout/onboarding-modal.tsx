"use client";

import { useState } from "react";
import { setDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { 
  Target, Activity, Atom, User, 
  GraduationCap, ChevronRight, Sparkles,
  Crown, Gift, Zap, Check, Star, Shield
} from "lucide-react";

export function OnboardingModal() {
  const { user, userData } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [selectedExam, setSelectedExam] = useState<"JEE" | "NEET" | null>(null);
  
  const [formData, setFormData] = useState({
    name: user?.displayName || "",
    academicClass: "",
    targetExam: ""
  });

  // If we already have a track record, don't show the modal
  if (!userData || (userData.targetExam !== null && userData.academicClass !== null)) return null;

  const handleNext = () => {
    if (step === 1 && !formData.name.trim()) return;
    if (step === 2 && !formData.academicClass) return;
    setStep(s => Math.min(s + 1, 4));
  };

  const handleBack = () => {
    setStep(s => Math.max(s - 1, 1));
  };

  const handleExamSelect = (exam: "JEE" | "NEET") => {
    setSelectedExam(exam);
    setStep(4); // Move to trial page
  };

  // Final submit: save profile + activate 7-day trial
  const handleFinalize = async (claimTrial: boolean) => {
    if (!user || !db || saving || !selectedExam) return;
    setSaving(true);
    
    const now = new Date();
    const trialExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days

    try {
      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        email: user.email,
        academicClass: formData.academicClass,
        targetExam: selectedExam,
        createdAt: now.toISOString(),
        streak: 0,
        questionsSolved: 0,
        mocksCompleted: 0,
        subscription: claimTrial 
          ? {
              plan: "Pro Trial",
              status: "active",
              trialStartDate: now.toISOString(),
              expiryDate: trialExpiry.toISOString(),
            }
          : {
              plan: "Free",
              status: "none",
            },
        usage: {
          lastTrackedDate: now.toISOString().split("T")[0],
          examsAttemptedToday: 0,
          aiTokensUsedToday: 0,
          customExamsCreatedToday: 0,
          lastTrackedWeek: "",
          customExamsCreatedWeek: 0,
          completedExamIds: [],
        }
      }, { merge: true });
      // Force reload to refresh auth context and dashboard syllabus
      window.location.reload();
    } catch (error) {
      console.error("Failed to save onboarding data", error);
      alert("Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  const progress = (step / 4) * 100;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 relative">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
           <div 
             className="h-full bg-indigo-600 transition-all duration-500 ease-out" 
             style={{ width: `${progress}%` }} 
           />
        </div>

        <div className="p-10 pt-12 flex flex-col items-center text-center">
          
          {step === 1 && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <User className="w-8 h-8" />
              </div>
              <h2 className="text-[28px] font-display font-bold text-slate-900 leading-tight mb-2">Create Your Profile</h2>
              <p className="text-slate-500 text-[14px] mb-8">What should we call you on the leaderboard?</p>
              
              <div className="text-left w-full mb-8">
                <label className="text-[12px] font-bold uppercase tracking-wider text-slate-500 block mb-2 px-1">Full Name</label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter your name"
                  autoFocus
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-600 focus:bg-white focus:outline-none rounded-2xl px-5 py-4 text-[16px] font-medium text-slate-900 transition-all placeholder:text-slate-400"
                />
              </div>
              
              <button 
                onClick={handleNext}
                disabled={!formData.name.trim()}
                className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 disabled:bg-slate-300 disabled:text-slate-500 hover:bg-indigo-700 disabled:hover:bg-slate-300 text-white rounded-[16px] font-bold text-[15px] transition-colors shadow-md"
              >
                Continue <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h2 className="text-[28px] font-display font-bold text-slate-900 leading-tight mb-2">Academic Profile</h2>
              <p className="text-slate-500 text-[14px] mb-8">Select your current academic status to calibrate question difficulty.</p>
              
              <div className="flex flex-col gap-3 w-full mb-8">
                {["Class 11", "Class 12", "Dropper"].map(cls => (
                  <button 
                    key={cls}
                    onClick={() => setFormData({...formData, academicClass: cls})}
                    className={`w-full py-4 px-6 border-2 rounded-[16px] font-bold text-[15px] text-left transition-all flex items-center justify-between ${
                      formData.academicClass === cls 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {cls}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.academicClass === cls ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                      {formData.academicClass === cls && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={handleBack}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[16px] font-bold text-[15px] transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={handleNext}
                  disabled={!formData.academicClass}
                  className="flex-[2] flex items-center justify-center gap-2 py-4 bg-indigo-600 disabled:bg-slate-300 hover:bg-indigo-700 text-white rounded-[16px] font-bold text-[15px] transition-colors shadow-md"
                >
                  Continue <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="w-16 h-16 bg-fuchsia-50 text-fuchsia-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-[28px] font-display font-bold text-slate-900 leading-tight mb-2">Select Your Journey</h2>
              <p className="text-slate-500 text-[14px] mb-8">This determines your primary analytics and syllabus. You cannot change this later.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8">
                
                <button 
                  onClick={() => handleExamSelect("JEE")}
                  disabled={saving}
                  className="group relative bg-white border-2 border-slate-200 hover:border-indigo-600 rounded-[24px] p-6 text-left transition-all hover:shadow-[0_8px_30px_rgb(79,70,229,0.12)] cursor-pointer overflow-hidden flex flex-col h-full"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:text-indigo-600 transition-colors">
                    <Atom className="w-24 h-24 -mt-6 -mr-6" />
                  </div>
                  
                  <div className="relative z-10 flex-1 flex flex-col justify-between">
                    <div className="w-12 h-12 bg-slate-100 group-hover:bg-indigo-100 text-slate-400 group-hover:text-indigo-600 rounded-xl flex items-center justify-center transition-colors mb-4">
                      <Atom className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-[20px] font-display font-bold text-slate-900 mb-1 leading-snug">JEE Main & Adv</h3>
                      <p className="text-[12px] text-slate-500 font-medium">Physics • Chemistry • Mathematics</p>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => handleExamSelect("NEET")}
                  disabled={saving}
                  className="group relative bg-white border-2 border-slate-200 hover:border-emerald-500 rounded-[24px] p-6 text-left transition-all hover:shadow-[0_8px_30px_rgb(16,185,129,0.12)] cursor-pointer overflow-hidden flex flex-col h-full"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:text-emerald-500 transition-colors">
                    <Activity className="w-24 h-24 -mt-6 -mr-6" />
                  </div>
                  
                  <div className="relative z-10 flex-1 flex flex-col justify-between">
                    <div className="w-12 h-12 bg-slate-100 group-hover:bg-emerald-100 text-slate-400 group-hover:text-emerald-600 rounded-xl flex items-center justify-center transition-colors mb-4">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-[20px] font-display font-bold text-slate-900 mb-1 leading-snug">NEET (UG)</h3>
                      <p className="text-[12px] text-slate-500 font-medium">Physics • Chemistry • Biology</p>
                    </div>
                  </div>
                </button>

              </div>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={handleBack}
                  disabled={saving}
                  className="w-full py-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-[16px] font-bold text-[15px] transition-colors"
                >
                  Back
                </button>
              </div>

              {saving && (
                <div className="mt-6 text-[13px] font-bold text-indigo-600 animate-pulse">
                  Finalizing profile and configuring engine...
                </div>
              )}
            </div>
          )}

          {/* ═══════════════ STEP 4: 7-DAY FREE TRIAL OFFER ═══════════════ */}
          {step === 4 && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Celebration icon */}
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-[30px] animate-pulse" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-[24px] flex items-center justify-center shadow-2xl shadow-amber-500/30">
                  <Gift className="w-10 h-10 text-white" />
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">
                <Star className="w-3.5 h-3.5 fill-amber-500" /> Welcome Gift
              </div>

              <h2 className="text-[28px] font-display font-bold text-slate-900 leading-tight mb-2">
                🎉 Claim Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">7-Day Pro Trial</span>
              </h2>
              <p className="text-slate-500 text-[14px] mb-8 max-w-sm mx-auto">
                Get full access to every premium feature absolutely free for 7 days. No payment required.
              </p>

              {/* Pro features list */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-5 mb-8 text-left">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-4">Everything Unlocked for 7 Days</div>
                <div className="space-y-3">
                  {[
                    "Unlimited mock tests with repeats",
                    "Market Practice & Examination Repository",
                    "40,000 AI Tutor tokens per day",
                    "5 Custom Exams per day",
                    "Deep analytics & rank prediction",
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-[13px] font-medium text-slate-700">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full">
                {/* Claim Trial CTA */}
                <button 
                  onClick={() => handleFinalize(true)}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white rounded-[16px] font-bold text-[16px] transition-all shadow-xl shadow-amber-500/25 hover:scale-[1.01]"
                >
                  <Crown className="w-5 h-5" /> Claim 7-Day Free Trial
                </button>

                {/* Skip Trial Option */}
                <button 
                  onClick={() => handleFinalize(false)}
                  disabled={saving}
                  className="w-full py-3 text-slate-400 hover:text-slate-600 text-[13px] font-semibold transition-colors"
                >
                  Skip and continue with Free plan →
                </button>
              </div>

              {/* Trust badge */}
              <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold">
                <Shield className="w-3 h-3" /> No credit card required • Auto-downgrades after 7 days
              </div>

              {saving && (
                <div className="mt-4 text-[13px] font-bold text-amber-600 animate-pulse">
                  Activating your trial access...
                </div>
              )}
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
