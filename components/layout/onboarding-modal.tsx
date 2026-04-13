"use client";

import { useState } from "react";
import { setDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { 
  Target, Activity, Atom, User, 
  GraduationCap, ChevronRight, Sparkles 
} from "lucide-react";

export function OnboardingModal() {
  const { user, userData } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  
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
    setStep(s => Math.min(s + 1, 3));
  };

  const handleBack = () => {
    setStep(s => Math.max(s - 1, 1));
  };

  const handleSubmit = async (exam: "JEE" | "NEET") => {
    if (!user || !db || saving) return;
    setSaving(true);
    
    try {
      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        email: user.email,
        academicClass: formData.academicClass,
        targetExam: exam,
        createdAt: new Date().toISOString(),
        streak: 0,
        questionsSolved: 0,
        mocksCompleted: 0
      }, { merge: true });
      // Force reload to refresh auth context and dashboard syllabus
      window.location.reload();
    } catch (error) {
      console.error("Failed to save onboarding data", error);
      alert("Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  const progress = (step / 3) * 100;

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
                  onClick={() => handleSubmit("JEE")}
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
                  onClick={() => handleSubmit("NEET")}
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
          
        </div>
      </div>
    </div>
  );
}
