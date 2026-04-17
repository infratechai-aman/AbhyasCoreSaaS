"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Syllabus } from "@/lib/syllabus";
import { Target, Search, CheckCircle2, Circle, Flame, Rocket, ChevronRight, SlidersHorizontal, BookOpen, Lock, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePremium } from "@/lib/hooks/usePremium";
import Link from "next/link";

export default function CustomExamBuilder() {
  const router = useRouter();
  const { canUseCustomBuilder, remainingCustomExams, isPro, plan } = usePremium();
  const [targetExam, setTargetExam] = useState<"JEE" | "NEET">("JEE");
  
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(["Physics"]);
  const [selectedChapters, setSelectedChapters] = useState<Set<string>>(new Set());
  const [questionCount, setQuestionCount] = useState<number>(30);
  
  const subjects = targetExam === "JEE" ? ["Physics", "Chemistry", "Mathematics"] : ["Physics", "Chemistry", "Biology"];

  const toggleSubject = (sub: string) => {
    setSelectedSubjects(prev => 
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const toggleChapter = (fileName: string) => {
    const newSet = new Set(selectedChapters);
    if (newSet.has(fileName)) newSet.delete(fileName);
    else newSet.add(fileName);
    setSelectedChapters(newSet);
  };

  // Aggregate all eligible chapters from both classes for selected subjects
  const getEligibleChapters = () => {
    const chapters: { name: string; file: string; subject: string; class: string }[] = [];
    
    selectedSubjects.forEach(subject => {
       ["Class11", "Class12"].forEach(cls => {
          const subKey = subject as keyof typeof Syllabus.Class11;
          const classData = Syllabus[cls as keyof typeof Syllabus];
          const subjectData = classData[subKey];
          
          subjectData.forEach(ch => {
            if (ch.hasData && ch.file) {
              chapters.push({
                name: ch.name,
                file: ch.file.replace('.xml', ''),
                subject,
                class: cls
              });
            }
          });
       });
    });
    return chapters;
  };

  const eligibleChapters = getEligibleChapters();

  const handleGenerate = () => {
    if (selectedChapters.size === 0) return alert("Please select at least one chapter.");
    const cParam = Array.from(selectedChapters).join(",");
    router.push(`/test-console/custom?c=${cParam}&q=${questionCount}`);
  };

  return (
    <DashboardShell>
       <div className="max-w-5xl mx-auto py-8">
          
          <div className="mb-8">
             <div className="flex items-center gap-3 mb-2">
                <div className="bg-rose-100 text-rose-600 p-2 rounded-xl"><Flame className="w-6 h-6" /></div>
                <h1 className="text-3xl font-display font-bold text-slate-900">Custom Exam Builder</h1>
             </div>
             <p className="text-slate-500 leading-relaxed max-w-2xl">
                Select your target exam, mix and match specific subjects or chapters, and set a custom length to generate a dynamic practice drill instantly.
             </p>
          </div>

          {/* Usage Limit Banner */}
          <div className={`rounded-2xl border p-4 mb-6 flex items-center justify-between ${canUseCustomBuilder ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
             <div className="flex items-center gap-3">
                {canUseCustomBuilder ? (
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><Rocket className="w-4 h-4" /></div>
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center"><Lock className="w-4 h-4" /></div>
                )}
                <div>
                  <div className={`text-[13px] font-bold ${canUseCustomBuilder ? 'text-emerald-900' : 'text-red-900'}`}>
                    {canUseCustomBuilder
                      ? `${remainingCustomExams} custom exam${remainingCustomExams !== 1 ? 's' : ''} remaining ${isPro ? 'today' : 'this week'}`
                      : `Custom exam limit reached (${isPro ? 'daily' : 'weekly'})`
                    }
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {isPro ? 'Pro plan: 5 custom exams/day' : 'Free plan: 1 custom exam/week'}
                  </div>
                </div>
             </div>
             {!canUseCustomBuilder && !isPro && (
               <Link href="/dashboard?checkout=Pro%20Yearly">
                 <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[12px] font-bold hover:bg-indigo-700 transition-colors shadow-md">
                   <Crown className="w-3.5 h-3.5" /> Upgrade
                 </button>
               </Link>
             )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             
             {/* Left Column: Configuration */}
             <div className="lg:col-span-1 space-y-6">
                
                {/* Exam Target */}
                <div className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-200">
                   <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                     <Target className="w-4 h-4 text-indigo-500" /> Target Examination
                   </h3>
                   <div className="flex gap-3">
                      <button 
                        onClick={() => { setTargetExam("JEE"); setSelectedSubjects(["Physics"]); setSelectedChapters(new Set()); }}
                        className={`flex-1 py-2.5 rounded-xl text-[14px] font-bold transition-all ${targetExam === "JEE" ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >
                        JEE Main
                      </button>
                      <button 
                        onClick={() => { setTargetExam("NEET"); setSelectedSubjects(["Physics"]); setSelectedChapters(new Set()); }}
                        className={`flex-1 py-2.5 rounded-xl text-[14px] font-bold transition-all ${targetExam === "NEET" ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >
                        NEET (UG)
                      </button>
                   </div>
                </div>

                {/* Subject Selection */}
                <div className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-200">
                   <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                     <BookOpen className="w-4 h-4 text-emerald-500" /> Include Subjects
                   </h3>
                   <div className="flex flex-col gap-3">
                      {subjects.map(sub => (
                        <button 
                          key={sub}
                          onClick={() => toggleSubject(sub)}
                          className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${selectedSubjects.includes(sub) ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-slate-300'}`}
                        >
                          <span className={`text-[14px] font-bold ${selectedSubjects.includes(sub) ? 'text-emerald-700' : 'text-slate-600'}`}>{sub}</span>
                          {selectedSubjects.includes(sub) ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-slate-300" />}
                        </button>
                      ))}
                   </div>
                </div>

                {/* Length Configuration */}
                <div className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-200">
                   <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                     <SlidersHorizontal className="w-4 h-4 text-orange-500" /> Question Count
                   </h3>
                   <div className="mb-6 flex justify-between items-end">
                      <span className="text-[32px] font-display font-bold text-slate-900 leading-none">{questionCount}</span>
                      <span className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">Questions</span>
                   </div>
                   <input 
                     type="range" 
                     min="10" max="90" step="5" 
                     value={questionCount} 
                     onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                     className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                   />
                   <div className="flex justify-between text-[11px] font-bold text-slate-400 mt-2">
                     <span>10 Qs</span>
                     <span>90 Qs</span>
                   </div>
                </div>

             </div>

             {/* Right Column: Chapter Selection */}
             <div className="lg:col-span-2 flex flex-col bg-white rounded-[20px] shadow-sm border border-slate-200 overflow-hidden h-[600px]">
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                   <h3 className="font-bold text-slate-900 flex items-center gap-2">
                     <Search className="w-4 h-4 text-indigo-500" /> Select Chapters ({selectedChapters.size} / {eligibleChapters.length})
                   </h3>
                   <button 
                     onClick={() => setSelectedChapters(new Set(eligibleChapters.map(c => c.file)))}
                     className="text-[12px] font-bold text-indigo-600 hover:text-indigo-700"
                   >
                     Select All
                   </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                   {selectedSubjects.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <BookOpen className="w-12 h-12 mb-4 opacity-20" />
                        <p>Select at least one subject to view chapters.</p>
                     </div>
                   ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {eligibleChapters.map((ch, idx) => {
                           const isSelected = selectedChapters.has(ch.file);
                           return (
                             <div 
                               key={`${ch.file}-${idx}`}
                               onClick={() => toggleChapter(ch.file)}
                               className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex gap-3 ${isSelected ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}
                             >
                               <div className="pt-0.5">
                                 {isSelected ? <CheckCircle2 className="w-5 h-5 text-indigo-600" /> : <Circle className="w-5 h-5 text-slate-300" />}
                               </div>
                               <div>
                                 <div className={`text-[14px] font-bold leading-tight mb-1 cursor-pointer ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{ch.name}</div>
                                 <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">{ch.subject} • {ch.class}</div>
                               </div>
                             </div>
                           );
                        })}
                     </div>
                   )}
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                   <div className="text-[12px] font-bold text-slate-500">
                     Estimated Time: <span className="text-slate-900">{Math.round(questionCount * 2)} Mins</span>
                   </div>
                   <button 
                      onClick={handleGenerate}
                      disabled={selectedChapters.size === 0 || !canUseCustomBuilder}
                      className="bg-indigo-600 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed hover:bg-indigo-500 text-white px-8 py-3 rounded-xl text-[14px] font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 hover:scale-[1.02]"
                    >
                      {canUseCustomBuilder ? (
                        <><Rocket className="w-4 h-4" /> Generate Custom Run</>
                      ) : (
                        <><Lock className="w-4 h-4" /> Limit Reached</>
                      )}
                    </button>
                </div>
             </div>

          </div>
       </div>
    </DashboardShell>
  );
}
