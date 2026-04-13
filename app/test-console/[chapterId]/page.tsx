"use client";

import { useEffect, useState } from "react";
import { Clock, LayoutTemplate, AlertCircle, ChevronRight, Bookmark, X, PlayCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { saveTestResult } from "@/lib/firebase-service";

export default function ExamConsole({ params }: { params: { chapterId: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<{ chapterName: string; subject: string; questions: any[] } | null>(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour for 30 questions
  
  // States: 'not_visited', 'not_answered', 'answered', 'marked'
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch test data
    fetch(`/api/exam/${params.chapterId}`)
      .then(res => res.json())
      .then(json => {
        if (json.questions) {
          setData(json);
          // Initialize statuses
          const initialStatuses: any = {};
          json.questions.forEach((q: any, i: number) => {
            initialStatuses[q.id] = i === 0 ? "not_answered" : "not_visited";
          });
          setStatuses(initialStatuses);
        }
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, [params.chapterId]);

  // Timer logic
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

  const handleOptionSelect = (optionId: string) => {
    setAnswers({ ...answers, [currentQ.id]: optionId });
  };

  const handleSaveAndNext = () => {
    const isAnswered = !!answers[currentQ.id];
    setStatuses(prev => ({
      ...prev,
      [currentQ.id]: isAnswered ? "answered" : "not_answered"
    }));
    
    if (currentIndex < data!.questions.length - 1) {
      const nextId = data!.questions[currentIndex + 1].id;
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
      [currentQ.id]: "marked"
    }));
    if (currentIndex < data!.questions.length - 1) {
      const nextId = data!.questions[currentIndex + 1].id;
      setStatuses(prev => ({
        ...prev,
        [nextId]: prev[nextId] === "not_visited" ? "not_answered" : prev[nextId]
      }));
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleClearResponse = () => {
    const newAnswers = { ...answers };
    delete newAnswers[currentQ.id];
    setAnswers(newAnswers);
  };

  const jumpToQuestion = (index: number) => {
    // Current Q status update before leaving if it's "not_answered" / "not_visited"
    const currentId = data!.questions[currentIndex].id;
    if (statuses[currentId] === "not_visited") {
       setStatuses(prev => ({...prev, [currentId]: "not_answered"}));
    }
    
    setCurrentIndex(index);
    const jumpId = data!.questions[index].id;
    if (statuses[jumpId] === "not_visited") {
       setStatuses(prev => ({...prev, [jumpId]: "not_answered"}));
    }
  };

  const submitExam = async () => {
    if (!data || submitting) return;
    setSubmitting(true);

    try {
      // 1. Calculate Score based on JEE (+4, -1)
      let correct = 0;
      let wrong = 0;
      data.questions.forEach((q: any) => {
        const userAns = answers[q.id];
        if (userAns) {
          if (userAns === q.answer) correct++;
          else wrong++;
        }
      });

      const totalQuestions = data.questions.length;
      const unattempted = totalQuestions - (correct + wrong);
      const finalScore = (correct * 4) - (wrong * 1);
      const timeUsed = 3600 - timeLeft;

      const resultPayload = {
        chapterId: params.chapterId,
        chapterName: data.chapterName,
        subject: data.subject,
        questions: data.questions,
        answers,
        correctCount: correct,
        wrongCount: wrong,
        skippedCount: unattempted,
        totalScore: finalScore,
        maxScore: totalQuestions * 4,
        timeTaken: timeUsed,
        accuracy: (correct + wrong) > 0 ? (correct / (correct + wrong)) * 100 : 0
      };

      // 2. Persist to Firebase if logged in
      if (user) {
        await saveTestResult(user.uid, resultPayload);
      }

      // 3. Fallback/Sync with LocalStorage for the results page
      localStorage.setItem(`test_results_${params.chapterId}`, JSON.stringify({
        ...resultPayload,
        timeTaken: timeLeft // Keeping consistency with existing results page logic which expects remaining time
      }));

      router.push(`/test-results/${params.chapterId}`);
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Failed to submit your test. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  // UI Status color config
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
         <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
         <h2 className="font-display text-2xl font-bold tracking-widest">RANKFORGE</h2>
         <p className="text-slate-400 mt-2 tracking-widest text-sm uppercase">Initializing Exam Environment...</p>
      </div>
    );
  }

  if (!data || !data.questions.length) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-4">
         <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
         <h2 className="text-2xl font-bold text-slate-900 mb-2">Drill Initialization Failed</h2>
         <p className="text-slate-500 mb-6 max-w-md">The selected chapter dataset could not be parsed or was not found in the raw_questions directory.</p>
         <Link href="/dashboard/practice-mode">
           <button className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg">Return to Dashboard</button>
         </Link>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#fafafc] flex flex-col overflow-hidden font-sans selection:bg-indigo-100">
      
      {/* ─── Header ─── */}
      <header className="h-[60px] bg-slate-900 text-white flex items-center justify-between px-6 shrink-0 shadow-md relative z-20">
         <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center shadow-inner">
               <LayoutTemplate className="w-4 h-4 text-white" />
            </div>
            <div>
               <div className="text-[14px] font-bold tracking-wide">{data.chapterName}</div>
               <div className="text-[10px] text-indigo-300 font-bold tracking-widest uppercase">{data.subject} Drill • 30 Qs</div>
            </div>
         </div>
         
         <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 px-3 py-1 bg-rose-900/50 border border-rose-700 rounded-md">
               <span className="text-[10px] font-bold text-rose-200 uppercase tracking-wider">Negative Marking active</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
               <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
               <span className="font-display text-[18px] font-bold tracking-wider text-emerald-400">{formatTime(timeLeft)}</span>
            </div>
            <button onClick={submitExam} className="px-5 py-2 bg-rose-600 hover:bg-rose-500 transition-colors text-white text-[12px] font-bold uppercase tracking-widest rounded-lg shadow-lg">
               Submit Mock
            </button>
         </div>
      </header>

      {/* ─── Main Content ─── */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Side: Question Panel */}
        <div className="flex-1 flex flex-col relative bg-white border-r border-slate-200 shadow-[20px_0_40px_rgba(0,0,0,0.02)] z-10">
           
           {/* Info Bar */}
           <div className="px-8 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                 <span className="text-[15px] font-display font-bold text-slate-900">Question {currentIndex + 1}</span>
                 <span className="text-[13px] font-medium text-slate-400">of {data.questions.length}</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                 Difficulty: {currentQ.difficulty}
              </div>
           </div>

           {/* Question Viewer */}
           <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="max-w-3xl">
                 {/* Question Text */}
                 <div className="text-[17px] leading-relaxed text-slate-800 font-medium mb-10 pb-6 border-b border-slate-100">
                    <span className="mr-3 text-indigo-300 font-bold">Q.</span>
                    {currentQ.text}
                 </div>
                 
                 {/* Options */}
                 <div className="space-y-3">
                    {currentQ.options.map((opt: any) => {
                       const isSelected = answers[currentQ.id] === opt.id;
                       return (
                         <div 
                           key={opt.id}
                           onClick={() => handleOptionSelect(opt.id)}
                           className={`group relative flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                             isSelected 
                               ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' 
                               : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                           }`}
                         >
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[13px] font-bold transition-colors mr-4 shrink-0 ${
                              isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 text-slate-500 group-hover:border-indigo-400'
                            }`}>
                               {opt.id}
                            </div>
                            <div className={`text-[15px] font-medium leading-relaxed ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                               {opt.text}
                            </div>
                         </div>
                       )
                    })}
                 </div>
              </div>
           </div>

           {/* Bottom Action Bar */}
           <div className="h-[70px] bg-white border-t border-slate-200 px-8 flex items-center justify-between shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
              <div className="flex gap-3">
                 <button onClick={handleClearResponse} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[13px] font-bold transition-colors flex items-center gap-2">
                    <X className="w-4 h-4" /> Clear
                 </button>
                 <button onClick={handleMarkForReview} className="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 outline outline-1 outline-indigo-200 rounded-xl text-[13px] font-bold transition-colors flex items-center gap-2">
                    <Bookmark className="w-4 h-4" /> Mark for Review
                 </button>
              </div>
              
              <button onClick={handleSaveAndNext} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[14px] font-bold tracking-wide shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 flex items-center gap-2">
                 Save & Next <ChevronRight className="w-4 h-4" />
              </button>
           </div>
        </div>

        {/* Right Side: Palette Window */}
        <div className="w-[320px] bg-slate-50 flex flex-col shrink-0">
           {/* Legend */}
           <div className="p-5 border-b border-slate-200 bg-white">
              <h3 className="text-[13px] font-bold text-slate-800 mb-4 uppercase tracking-wider">Question Palette</h3>
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
           
           {/* Palette Grid */}
           <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
              <div className="grid grid-cols-5 gap-2">
                 {data.questions.map((q, i) => {
                    const status = statuses[q.id] || "not_visited";
                    const isCurrent = currentIndex === i;
                    
                    return (
                      <button
                         key={q.id}
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
           
           {/* User Profile Mini */}
           <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-full text-white font-bold flex items-center justify-center">AT</div>
              <div className="flex-1">
                 <div className="text-[12px] font-bold text-slate-900">Aman Talukdar</div>
                 <div className="text-[10px] text-indigo-600 font-bold">PREMIUM STUDENT</div>
              </div>
           </div>
        </div>

      </div>
      
      {/* Global styles for dark custom-scrollbar to keep it tight */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}
