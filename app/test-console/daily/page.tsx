"use client";

import { useEffect, useState, Suspense } from "react";
import { Clock, LayoutTemplate, AlertCircle, ChevronRight, Bookmark, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { saveTestResult } from "@/lib/firebase-service";


function CustomExamConsoleInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<{ chapterName: string; subject: string; questions: any[] } | null>(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); 
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const [customTestId] = useState(`custom_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    try {
      const qStr = sessionStorage.getItem("daily_target_questions");
      const eStr = sessionStorage.getItem("daily_target_exam") || "JEE";
      
      if (!qStr) {
        setLoading(false);
        return;
      }
      
      const qList = JSON.parse(qStr);
      setTimeLeft(qList.length * 120); // 2 minutes per question
      
      setData({
        chapterName: "Daily Target Drill",
        subject: eStr,
        questions: qList
      });
      
      const initialStatuses: any = {};
      qList.forEach((question: any, i: number) => {
         const safeId = question.id + '_' + i;
         question._safeId = safeId;
         initialStatuses[safeId] = i === 0 ? "not_answered" : "not_visited";
      });
      setStatuses(initialStatuses);
      setLoading(false);
    } catch(e) {
      console.error(e);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const currentQ = data?.questions[currentIndex];
  // use the safeId
  const currentSafeId = currentQ?._safeId;

  const handleOptionSelect = (optionId: string) => {
    setAnswers({ ...answers, [currentSafeId]: optionId });
  };

  const handleSaveAndNext = () => {
    const isAnswered = !!answers[currentSafeId];
    setStatuses(prev => ({
      ...prev,
      [currentSafeId]: isAnswered ? "answered" : "not_answered"
    }));
    
    if (currentIndex < data!.questions.length - 1) {
      const nextId = data!.questions[currentIndex + 1]._safeId;
      setStatuses(prev => ({
        ...prev,
        [nextId]: prev[nextId] === "not_visited" ? "not_answered" : prev[nextId]
      }));
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleMarkForReview = () => {
    setStatuses(prev => ({
      ...prev,
      [currentSafeId]: "marked"
    }));
    if (currentIndex < data!.questions.length - 1) {
      const nextId = data!.questions[currentIndex + 1]._safeId;
      setStatuses(prev => ({
        ...prev,
        [nextId]: prev[nextId] === "not_visited" ? "not_answered" : prev[nextId]
      }));
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleClearResponse = () => {
    const newAnswers = { ...answers };
    delete newAnswers[currentSafeId];
    setAnswers(newAnswers);
  };

  const jumpToQuestion = (index: number) => {
    const currentId = data!.questions[currentIndex]._safeId;
    if (statuses[currentId] === "not_visited") {
       setStatuses(prev => ({...prev, [currentId]: "not_answered"}));
    }
    setCurrentIndex(index);
    const jumpId = data!.questions[index]._safeId;
    if (statuses[jumpId] === "not_visited") {
       setStatuses(prev => ({...prev, [jumpId]: "not_answered"}));
    }
  };

  const submitExam = async () => {
    if (!data || submitting) return;
    setSubmitting(true);

    try {
      let correct = 0;
      let wrong = 0;
      data.questions.forEach((q: any) => {
        const userAns = answers[q._safeId];
        if (userAns) {
          if (userAns === q.answer) correct++;
          else wrong++;
        }
      });

      const totalQuestions = data.questions.length;
      const unattempted = totalQuestions - (correct + wrong);
      const finalScore = (correct * 4) - (wrong * 1);
      const totalAllocatedTime = data.questions.length * 120;
      const timeUsed = totalAllocatedTime - timeLeft;

      const resultPayload = {
        chapterId: customTestId,
        chapterName: "Custom Generation Drill",
        subject: "Mixed Syllabus",
        questions: data.questions.map(q => ({...q, id: q._safeId})), 
        answers,
        correctCount: correct,
        wrongCount: wrong,
        skippedCount: unattempted,
        totalScore: finalScore,
        maxScore: totalQuestions * 4,
        timeTaken: timeUsed,
        accuracy: (correct + wrong) > 0 ? (correct / (correct + wrong)) * 100 : 0
      };

      if (user) {
        await saveTestResult(user.uid, resultPayload);
      }

      localStorage.setItem(`test_results_${customTestId}`, JSON.stringify({
        ...resultPayload,
        timeTaken: timeLeft 
      }));

      router.push(`/test-results/${customTestId}`);
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Failed to submit your test. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "answered": return "bg-emerald-500 text-white border-emerald-600";
      case "not_answered": return "bg-rose-500 text-white border-rose-600";
      case "marked": return "bg-indigo-500 text-white border-indigo-600";
      case "not_visited": 
      default: return "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
         <Loader2 className="w-12 h-12 text-rose-500 animate-spin mb-4" />
         <h2 className="font-display text-2xl font-bold tracking-widest">ABHYASCORE</h2>
         <p className="text-slate-400 mt-2 tracking-widest text-sm uppercase">Synthesizing Custom Test...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-4">
         <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
         <h2 className="text-2xl font-bold text-slate-900 mb-2">Drill Expired</h2>
         <p className="text-slate-500 mb-6 max-w-md">Daily Drill data not found. Please launch it from the dashboard.</p>
         <Link href="/dashboard/daily-target">
           <button className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg">Return to Test Library</button>
         </Link>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#fafafc] flex flex-col overflow-hidden font-sans selection:bg-indigo-100">
      
      {/* ─── Header ─── */}
      <header className="h-[60px] bg-slate-900 text-white flex items-center justify-between px-3 md:px-6 shrink-0 shadow-md relative z-20">
         <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0 pr-2">
            <div className="hidden md:flex w-8 h-8 bg-rose-500 rounded-md items-center justify-center shadow-inner shrink-0">
               <LayoutTemplate className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
               <div className="text-[13px] md:text-[14px] font-bold tracking-wide truncate">Daily Target Drill</div>
               <div className="text-[9px] md:text-[10px] text-rose-300 font-bold tracking-widest uppercase truncate">{data.subject} • {data.questions.length} Qs</div>
            </div>
         </div>
         
         <div className="flex items-center gap-2 sm:gap-4 md:gap-8 shrink-0">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-rose-900/50 border border-rose-700 rounded-md">
               <span className="text-[10px] font-bold text-rose-200 uppercase tracking-wider">Negative Marking active</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 bg-slate-800 rounded-md md:rounded-lg border border-slate-700">
               <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-400 animate-pulse" />
               <span className="font-display text-[15px] md:text-[18px] font-bold tracking-wider text-emerald-400">{formatTime(timeLeft)}</span>
            </div>
            <button onClick={submitExam} className="px-3 md:px-5 py-1.5 md:py-2 bg-rose-600 hover:bg-rose-500 transition-colors text-white text-[10px] md:text-[12px] font-bold uppercase tracking-widest rounded-md md:rounded-lg shadow-lg">
               Submit
            </button>
         </div>
      </header>

      {/* ─── Main Content ─── */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Side: Question Panel */}
        <div className="flex-1 flex flex-col relative bg-white border-r border-slate-200 shadow-[20px_0_40px_rgba(0,0,0,0.02)] z-10">
           
           <div className="px-4 md:px-8 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-2">
                 <span className="text-[14px] md:text-[15px] font-display font-bold text-slate-900">Question {currentIndex + 1}</span>
                 <span className="text-[12px] md:text-[13px] font-medium text-slate-400">of {data.questions.length}</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-200 text-slate-600 text-[9px] md:text-[10px] font-bold uppercase tracking-wider">
                 Source: {currentQ?.chapterSource?.replace(/_/g, ' ')}
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative z-0">
              <div className="max-w-3xl pb-6">
                 <div className="text-[15px] md:text-[17px] leading-relaxed text-slate-800 font-medium mb-6 md:mb-10 pb-6 border-b border-slate-100">
                    <span className="mr-3 text-indigo-300 font-bold">Q.</span>
                    {currentQ?.text}
                 </div>
                 
                 <div className="space-y-3">
                    {currentQ?.options.map((opt: any) => {
                       const isSelected = answers[currentSafeId] === opt.id;
                       return (
                         <div 
                           key={opt.id}
                           onClick={() => handleOptionSelect(opt.id)}
                           className={`group relative flex items-center p-3 md:p-4 rounded-xl md:rounded-2xl border-2 cursor-pointer transition-all ${
                             isSelected 
                               ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' 
                               : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                           }`}
                         >
                            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center text-[12px] md:text-[13px] font-bold transition-colors mr-3 md:mr-4 shrink-0 ${
                              isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 text-slate-500 group-hover:border-indigo-400'
                            }`}>
                               {opt.id}
                            </div>
                            <div className={`text-[14px] md:text-[15px] font-medium leading-relaxed ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                               {opt.text}
                            </div>
                         </div>
                       )
                    })}
                 </div>
              </div>
           </div>

           <div className="h-[64px] md:h-[70px] bg-white border-t border-slate-200 px-3 md:px-8 flex items-center justify-between shadow-[0_-10px_20px_rgba(0,0,0,0.02)] shrink-0 z-10 w-full">
              <div className="flex gap-2">
                 <button onClick={handleClearResponse} className="px-3 md:px-5 py-2 md:py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg md:rounded-xl text-[12px] md:text-[13px] font-bold transition-colors flex items-center gap-1.5 md:gap-2">
                    <X className="w-4 h-4 hidden sm:block" /> Clear
                 </button>
                 <button onClick={handleMarkForReview} className="px-3 md:px-5 py-2 md:py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 outline outline-1 outline-indigo-200 rounded-lg md:rounded-xl text-[12px] md:text-[13px] font-bold transition-colors flex items-center gap-1.5 md:gap-2 whitespace-nowrap">
                    <Bookmark className="w-4 h-4 hidden sm:block" /> Review
                 </button>
              </div>
              
              <div className="flex items-center gap-2">
                 <button onClick={() => setIsPaletteOpen(true)} className="lg:hidden p-2 md:p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg md:rounded-xl flex items-center justify-center transition-colors">
                    <LayoutTemplate className="w-4 h-4 md:w-5 md:h-5" />
                 </button>
                 <button onClick={handleSaveAndNext} className="px-5 md:px-8 py-2 md:py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg md:rounded-xl text-[13px] md:text-[14px] font-bold tracking-wide shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 flex items-center gap-1.5 md:gap-2 whitespace-nowrap">
                    <span className="hidden sm:inline">Save & Next</span>
                    <span className="sm:hidden">Next</span>
                    <ChevronRight className="w-4 h-4" />
                 </button>
              </div>
           </div>
        </div>

        {/* Right Side: Palette Window */}
        {isPaletteOpen && (
          <div 
            className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm lg:hidden pointer-events-auto transition-opacity"
            onClick={() => setIsPaletteOpen(false)}
          />
        )}
        
        <div className={`
          fixed inset-y-0 right-0 z-[70] w-[300px] lg:w-[320px] bg-slate-50 flex flex-col shrink-0 shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static
          ${isPaletteOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
           <div className="p-4 md:p-5 border-b border-slate-200 bg-white relative">
              <h3 className="text-[12px] md:text-[13px] font-bold text-slate-800 mb-4 uppercase tracking-wider pr-8">Question Palette</h3>
              <button 
                onClick={() => setIsPaletteOpen(false)} 
                className="lg:hidden absolute top-4 right-4 w-6 h-6 flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-full transition-colors"
              >
                 <X className="w-3.5 h-3.5" />
              </button>
              <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                 <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
                    <div className="w-4 h-4 rounded-sm bg-emerald-500 border border-emerald-600" /> Answered
                 </div>
                 <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
                    <div className="w-4 h-4 rounded-sm bg-rose-500 border border-rose-600" /> Not Answered
                 </div>
                 <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
                    <div className="w-4 h-4 rounded-sm bg-slate-100 border border-slate-300" /> Not Visited
                 </div>
                 <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
                    <div className="w-4 h-4 rounded-sm bg-indigo-500 border border-indigo-600" /> Marked
                 </div>
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
              <div className="grid grid-cols-5 gap-2">
                 {data.questions.map((q: any, i: number) => {
                    const status = statuses[q._safeId] || "not_visited";
                    const isCurrent = currentIndex === i;
                    
                    return (
                      <button
                         key={q._safeId}
                         onClick={() => jumpToQuestion(i)}
                         className={`
                           w-full aspect-square rounded-md border flex items-center justify-center text-[13px] font-bold transition-all relative
                           ${getStatusColor(status)}
                           ${isCurrent ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110 z-10 shadow-lg' : ''}
                         `}
                      >
                         {i + 1}
                      </button>
                    )
                 })}
              </div>
           </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}

export default function CustomExamConsole() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center text-slate-500 font-bold bg-slate-900 text-xl tracking-widest uppercase">Loading Core...</div>}>
            <CustomExamConsoleInner />
        </Suspense>
    )
}
