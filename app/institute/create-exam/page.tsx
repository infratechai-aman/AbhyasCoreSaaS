"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Syllabus } from "@/lib/syllabus";
import type { TargetExam, ExamType, ExamDifficulty, ResultVisibility } from "@/lib/institute-types";
import { 
  ChevronRight, ChevronLeft, Check, Zap, BookOpen, Clock, 
  Lock, Copy, MessageCircle, Plus, FileText,
  ArrowRight
} from "lucide-react";

export default function CreateExamPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Step state
  const [step, setStep] = useState(1);

  // Form State
  const [title, setTitle] = useState("");
  const [targetExam, setTargetExam] = useState<TargetExam>("JEE");
  const [examType, setExamType] = useState<ExamType>("chapter");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(30);
  const [difficulty, setDifficulty] = useState<ExamDifficulty>("mixed");
  const [password, setPassword] = useState("");
  const [duration, setDuration] = useState(60);
  const [allowRetake, setAllowRetake] = useState(false);
  const [resultVisibility, setResultVisibility] = useState<ResultVisibility>("immediate");

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdExam, setCreatedExam] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [activeSubjectTab, setActiveSubjectTab] = useState("");

  // Available subjects based on target exam
  const availableSubjects = useMemo(() => {
    if (targetExam === "JEE") return ["Physics", "Chemistry", "Mathematics"];
    return ["Physics", "Chemistry", "Biology"];
  }, [targetExam]);

  // Get chapters for selected subjects
  const availableChapters = useMemo(() => {
    const chapters: { name: string; file: string; subject: string; classLevel: string; chapterNumber: number }[] = [];
    const classes = ["Class11", "Class12"] as const;

    for (const cls of classes) {
      for (const subject of selectedSubjects) {
        const subjectKey = subject as keyof typeof Syllabus.Class11;
        const chapList = Syllabus[cls]?.[subjectKey];
        if (chapList) {
          chapList.forEach((ch) => {
            if (ch.file && ch.hasData) {
              chapters.push({
                name: ch.name,
                file: ch.file.replace(".xml", ""),
                subject,
                classLevel: cls === "Class11" ? "11" : "12",
                chapterNumber: ch.chapterNumber,
              });
            }
          });
        }
      }
    }
    return chapters;
  }, [selectedSubjects]);

  const toggleSubject = (sub: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
    setSelectedChapters([]);
    if (!activeSubjectTab || !selectedSubjects.includes(sub)) setActiveSubjectTab(sub);
  };

  const toggleChapter = (file: string) => {
    setSelectedChapters((prev) =>
      prev.includes(file) ? prev.filter((f) => f !== file) : [...prev, file]
    );
  };

  const selectAllChapters = () => {
    if (selectedChapters.length === availableChapters.length) {
      setSelectedChapters([]);
    } else {
      setSelectedChapters(availableChapters.map((c) => c.file));
    }
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let pw = "";
    for (let i = 0; i < 6; i++) {
      pw += chars[Math.floor(Math.random() * chars.length)];
    }
    setPassword(pw);
  };

  const handleSubmit = async () => {
    if (!title.trim() || title.trim().length < 3) { setError("Please enter an exam title (at least 3 characters)."); return; }
    if (selectedSubjects.length === 0) { setError("Please select at least one subject."); return; }
    if (selectedChapters.length === 0) { setError("Please select at least one chapter."); return; }
    if (!password || password.length < 4) { setError("Password must be at least 4 characters."); return; }

    setError("");
    setLoading(true);

    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/institute/create-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: title.trim(), targetExam, examType, subjects: selectedSubjects, chapters: selectedChapters, questionCount, difficulty, password, duration, allowRetake, resultVisibility }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create exam."); return; }
      setCreatedExam(data);
      setStep(5);
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (createdExam?.joinLink) {
      const text = `Exam Link: ${createdExam.joinLink}\nPassword: ${createdExam.password}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareWhatsApp = () => {
    if (createdExam) {
      const text = `📝 *${createdExam.title}*\n\nJoin the exam using this link:\n${createdExam.joinLink}\n\n🔑 Password: ${createdExam.password}\n\nPowered by AbhyasCore`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  // Step indicator
  const steps = [
    { num: 1, label: "Exam Type" },
    { num: 2, label: "Subjects & Chapters" },
    { num: 3, label: "Configuration" },
    { num: 4, label: "Review" },
  ];

  const filteredChapters = activeSubjectTab 
    ? availableChapters.filter(c => c.subject === activeSubjectTab) 
    : availableChapters;

  return (
    <div className="flex-1 p-5 md:p-8 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-md bg-indigo-600 text-white text-[9px] font-bold tracking-[0.1em] uppercase">Exam Builder</span>
        </div>
        <h2 className="text-[28px] font-semibold text-slate-900 tracking-tight mb-1">Create New Exam</h2>
        <p className="text-[14px] text-slate-500">Build a custom exam for your students in a few simple steps.</p>
      </div>

      {/* Step Indicator */}
      {step < 5 && (
        <div className="flex items-center gap-0 mb-10 max-w-2xl">
          {steps.map((s, i) => (
            <React.Fragment key={s.num}>
              <button 
                onClick={() => s.num < step ? setStep(s.num) : null}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all shrink-0 ${
                  step === s.num 
                    ? "bg-indigo-600 text-white shadow-[0_2px_8px_rgba(79,70,229,0.25)]" 
                    : step > s.num 
                      ? "bg-emerald-50 text-emerald-700 cursor-pointer hover:bg-emerald-100"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {step > s.num ? <Check className="w-3.5 h-3.5" /> : <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">{s.num}</span>}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px mx-1 ${step > s.num ? 'bg-emerald-300' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[13px] font-semibold text-red-600 mb-6 flex items-center gap-2">
          ⚠️ {error}
        </div>
      )}

      {/* Step 1: Choose Exam Type */}
      {step === 1 && (
        <div className="max-w-3xl">
          <h3 className="text-[18px] font-bold text-slate-900 mb-2">Choose Exam Type</h3>
          <p className="text-[13px] text-slate-500 mb-8">Select the target examination and exam format.</p>
          
          {/* Target Exam Selection */}
          <div className="mb-8">
            <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-3 block">Target Exam</label>
            <div className="grid grid-cols-2 gap-4 max-w-md">
              {(["JEE", "NEET"] as TargetExam[]).map((exam) => (
                <button
                  key={exam}
                  onClick={() => { setTargetExam(exam); setSelectedSubjects([]); setSelectedChapters([]); }}
                  className={`relative p-5 rounded-[16px] border-2 text-left transition-all ${
                    targetExam === exam 
                      ? "border-indigo-600 bg-indigo-50/50 shadow-[0_2px_12px_rgba(79,70,229,0.1)]" 
                      : "border-slate-200 bg-white hover:border-indigo-200"
                  }`}
                >
                  {targetExam === exam && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className="text-[16px] font-bold text-slate-900 mb-1">{exam}</div>
                  <div className="text-[11px] text-slate-500">
                    {exam === "JEE" ? "Physics, Chemistry, Mathematics" : "Physics, Chemistry, Biology"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Exam Format */}
          <div className="mb-8">
            <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-3 block">Exam Format</label>
            <div className="grid grid-cols-2 gap-4 max-w-md">
              {([
                { value: "chapter", label: "Chapter Test", desc: "Test specific chapters" },
                { value: "full", label: "Full Mock", desc: "Complete syllabus mock" },
              ] as const).map((fmt) => (
                <button
                  key={fmt.value}
                  onClick={() => setExamType(fmt.value)}
                  className={`relative p-5 rounded-[16px] border-2 text-left transition-all ${
                    examType === fmt.value 
                      ? "border-indigo-600 bg-indigo-50/50 shadow-[0_2px_12px_rgba(79,70,229,0.1)]" 
                      : "border-slate-200 bg-white hover:border-indigo-200"
                  }`}
                >
                  {examType === fmt.value && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className="text-[14px] font-bold text-slate-900 mb-1">{fmt.label}</div>
                  <div className="text-[11px] text-slate-500">{fmt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Exam Title */}
          <div className="mb-8 max-w-md">
            <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-2 block">Exam Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Physics Weekly Test - Mechanics"
              className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-[14px] outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-slate-300"
            />
          </div>

          <button 
            onClick={() => { if (!title.trim()) { setError("Enter an exam title"); return; } setError(""); setStep(2); }}
            className="flex items-center gap-2 h-11 px-6 rounded-xl bg-indigo-600 text-white text-[13px] font-semibold shadow-[0_2px_8px_rgba(79,70,229,0.25)] hover:bg-indigo-700 transition-all"
          >
            Next: Select Chapters <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 2: Subjects & Chapters */}
      {step === 2 && (
        <div className="max-w-4xl">
          <h3 className="text-[18px] font-bold text-slate-900 mb-2">Select Subjects & Chapters</h3>
          <p className="text-[13px] text-slate-500 mb-8">Pick the subjects and chapters to include in your exam.</p>
          
          {/* Subject Selection */}
          <div className="mb-6">
            <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-3 block">Subjects</label>
            <div className="flex gap-3">
              {availableSubjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => toggleSubject(sub)}
                  className={`px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-all ${
                    selectedSubjects.includes(sub)
                      ? "bg-indigo-600 text-white shadow-[0_2px_8px_rgba(79,70,229,0.25)]"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Chapter Grid */}
          {selectedSubjects.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {/* Subject tabs for filtering */}
                  {selectedSubjects.length > 1 && selectedSubjects.map(sub => (
                    <button
                      key={sub}
                      onClick={() => setActiveSubjectTab(sub)}
                      className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${
                        activeSubjectTab === sub ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={selectAllChapters} 
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  {selectedChapters.length === availableChapters.length ? "Deselect All" : "Select All"}
                </button>
              </div>

              {/* Chapter Cards - inspired by student Test Library */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredChapters.map((ch) => {
                  const isSelected = selectedChapters.includes(ch.file);
                  return (
                    <button
                      key={ch.file}
                      onClick={() => toggleChapter(ch.file)}
                      className={`relative text-left p-4 rounded-[16px] border transition-all group ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/50 shadow-[0_2px_12px_rgba(79,70,229,0.08)]"
                          : "border-slate-200/60 bg-white hover:border-indigo-200 shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
                      }`}
                    >
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">CH {ch.chapterNumber}</div>
                      <div className="text-[13px] font-bold text-slate-900 mb-2 leading-tight line-clamp-2">{ch.name}</div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> 120 Qs</span>
                        <span className="flex items-center gap-1">Class {ch.classLevel}</span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 text-[12px] text-slate-500 font-medium">
                {selectedChapters.length} chapter{selectedChapters.length !== 1 ? "s" : ""} selected
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button onClick={() => setStep(1)} className="flex items-center gap-2 h-11 px-5 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-semibold hover:bg-slate-50 transition-all">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button 
              onClick={() => { if (selectedSubjects.length === 0) { setError("Select at least one subject"); return; } if (selectedChapters.length === 0) { setError("Select at least one chapter"); return; } setError(""); setStep(3); }}
              className="flex items-center gap-2 h-11 px-6 rounded-xl bg-indigo-600 text-white text-[13px] font-semibold shadow-[0_2px_8px_rgba(79,70,229,0.25)] hover:bg-indigo-700 transition-all"
            >
              Next: Configure <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Configuration */}
      {step === 3 && (
        <div className="max-w-3xl">
          <h3 className="text-[18px] font-bold text-slate-900 mb-2">Exam Configuration</h3>
          <p className="text-[13px] text-slate-500 mb-8">Set duration, difficulty, questions, and access control.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {/* Questions */}
            <div className="bg-white rounded-[16px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase">Questions</div>
              </div>
              <input type="number" value={questionCount} onChange={(e) => setQuestionCount(parseInt(e.target.value) || 30)} min={5} max={200}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[18px] font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all text-center"
              />
            </div>
            
            {/* Duration */}
            <div className="bg-white rounded-[16px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase">Duration (min)</div>
              </div>
              <input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value) || 60)} min={10} max={300}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[18px] font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all text-center"
              />
            </div>

            {/* Difficulty */}
            <div className="bg-white rounded-[16px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Zap className="h-4 w-4" />
                </div>
                <div className="text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase">Difficulty</div>
              </div>
              <div className="flex gap-2">
                {(["easy", "medium", "hard", "mixed"] as ExamDifficulty[]).map((d) => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={`flex-1 py-2 rounded-lg text-[11px] font-bold capitalize transition-all ${
                      difficulty === d ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                    }`}
                  >{d}</button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div className="bg-white rounded-[16px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center">
                  <Lock className="h-4 w-4" />
                </div>
                <div className="text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase">Exam Password</div>
              </div>
              <div className="flex gap-2">
                <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter or generate"
                  className="flex-1 h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-mono outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
                <button onClick={generatePassword} className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-all whitespace-nowrap">
                  🎲 Generate
                </button>
              </div>
            </div>
          </div>

          {/* Extra Settings */}
          <div className="bg-white rounded-[16px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)] mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-2 block">Result Visibility</label>
                <select value={resultVisibility} onChange={(e) => setResultVisibility(e.target.value as ResultVisibility)}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[13px] outline-none focus:border-indigo-500 cursor-pointer appearance-none"
                >
                  <option value="immediate">Immediate (after submit)</option>
                  <option value="after_exam_ends">After exam ends</option>
                  <option value="manual">Manual release</option>
                </select>
              </div>
              <div className="flex items-center gap-4 pt-6">
                <button onClick={() => setAllowRetake(!allowRetake)}
                  className={`relative w-11 h-6 rounded-full transition-all cursor-pointer ${allowRetake ? "bg-indigo-600" : "bg-slate-200"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${allowRetake ? "left-[24px]" : "left-1"}`} />
                </button>
                <span className="text-[13px] font-medium text-slate-700">Allow Retakes</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setStep(2)} className="flex items-center gap-2 h-11 px-5 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-semibold hover:bg-slate-50 transition-all">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={() => { if (!password || password.length < 4) { setError("Password must be at least 4 characters"); return; } setError(""); setStep(4); }}
              className="flex items-center gap-2 h-11 px-6 rounded-xl bg-indigo-600 text-white text-[13px] font-semibold shadow-[0_2px_8px_rgba(79,70,229,0.25)] hover:bg-indigo-700 transition-all"
            >
              Next: Review <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="max-w-3xl">
          <h3 className="text-[18px] font-bold text-slate-900 mb-2">Review & Create</h3>
          <p className="text-[13px] text-slate-500 mb-8">Double-check your exam configuration before creating.</p>

          <div className="bg-white rounded-[16px] border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 mb-6">
            <div className="grid grid-cols-2 gap-y-5 gap-x-8">
              <div><div className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-1">Title</div><div className="text-[14px] font-bold text-slate-900">{title}</div></div>
              <div><div className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-1">Target Exam</div><div className="text-[14px] font-bold text-slate-900">{targetExam}</div></div>
              <div><div className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-1">Format</div><div className="text-[14px] font-bold text-slate-900 capitalize">{examType === "full" ? "Full Mock" : "Chapter Test"}</div></div>
              <div><div className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-1">Questions</div><div className="text-[14px] font-bold text-slate-900">{questionCount}</div></div>
              <div><div className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-1">Duration</div><div className="text-[14px] font-bold text-slate-900">{duration} min</div></div>
              <div><div className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-1">Difficulty</div><div className="text-[14px] font-bold text-slate-900 capitalize">{difficulty}</div></div>
              <div><div className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-1">Password</div><div className="text-[14px] font-mono font-bold text-indigo-600">{password}</div></div>
              <div><div className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-1">Chapters</div><div className="text-[14px] font-bold text-slate-900">{selectedChapters.length} selected</div></div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setStep(3)} className="flex items-center gap-2 h-11 px-5 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-semibold hover:bg-slate-50 transition-all">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="flex items-center gap-2 h-11 px-6 rounded-xl bg-indigo-600 text-white text-[13px] font-semibold shadow-[0_2px_8px_rgba(79,70,229,0.25)] hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {loading ? "Creating..." : "🚀 Create Exam"} 
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Success */}
      {step === 5 && createdExam && (
        <div className="max-w-2xl">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-[20px] border border-indigo-200/60 p-8 text-center mb-8">
            <div className="h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="text-[22px] font-bold text-slate-900 mb-2">Exam Created Successfully!</h3>
            <p className="text-[14px] text-slate-500 mb-6">{createdExam.title} is ready. Share the link with your students.</p>

            <div className="bg-white rounded-xl border border-indigo-100 p-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-50 rounded-lg px-4 py-3 font-mono text-[12px] text-indigo-600 overflow-hidden text-ellipsis whitespace-nowrap text-left">
                  {createdExam.joinLink}
                </div>
                <button onClick={copyLink}
                  className={`h-10 px-4 rounded-lg text-[12px] font-bold flex items-center gap-2 transition-all ${
                    copied ? "bg-emerald-600 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" /> {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="mt-3 text-left text-[12px] text-slate-500">
                Password: <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{createdExam.password}</span>
                <span className="ml-4 text-orange-600 font-semibold">{createdExam.questionCount} questions generated</span>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button onClick={shareWhatsApp} className="flex items-center gap-2 h-10 px-5 rounded-xl border border-slate-200 bg-white text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                <MessageCircle className="w-4 h-4" /> Share WhatsApp
              </button>
              <button onClick={() => { setCreatedExam(null); setTitle(""); setPassword(""); setSelectedChapters([]); setStep(1); }}
                className="flex items-center gap-2 h-10 px-5 rounded-xl border border-slate-200 bg-white text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-all"
              >
                <Plus className="w-4 h-4" /> Create Another
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-12"></div>
    </div>
  );
}
