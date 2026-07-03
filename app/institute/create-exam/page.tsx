"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Syllabus } from "@/lib/syllabus";
import type { TargetExam, ExamType, ExamDifficulty, ResultVisibility } from "@/lib/institute-types";

export default function CreateExamPage() {
  const { user } = useAuth();
  const router = useRouter();

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

  // Available subjects based on target exam
  const availableSubjects = useMemo(() => {
    if (targetExam === "JEE") return ["Physics", "Chemistry", "Mathematics"];
    return ["Physics", "Chemistry", "Biology"];
  }, [targetExam]);

  // Get chapters for selected subjects
  const availableChapters = useMemo(() => {
    const chapters: { name: string; file: string; subject: string; classLevel: string }[] = [];
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
    // Clear chapters when subjects change
    setSelectedChapters([]);
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
    // Validation
    if (!title.trim() || title.trim().length < 3) {
      setError("Please enter an exam title (at least 3 characters).");
      return;
    }
    if (selectedSubjects.length === 0) {
      setError("Please select at least one subject.");
      return;
    }
    if (selectedChapters.length === 0) {
      setError("Please select at least one chapter.");
      return;
    }
    if (!password || password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/institute/create-exam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          targetExam,
          examType,
          subjects: selectedSubjects,
          chapters: selectedChapters,
          questionCount,
          difficulty,
          password,
          duration,
          allowRetake,
          resultVisibility,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create exam.");
        return;
      }

      setCreatedExam(data);
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

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2
            className="text-xl font-extrabold text-[#0f172a] mb-1"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Create New Exam
          </h2>
          <p className="text-xs font-medium text-[#64748b]">
            Build an exam in minutes. Select chapters, set difficulty, and share the link.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-[#fef2f2] border border-[#fecaca] px-3.5 py-2.5 text-xs font-semibold text-[#dc2626] mb-4">
          {error}
        </div>
      )}

      {/* Step 1: Basic Info */}
      <div className="bg-white border border-[#e2e8f0] rounded-[14px] mb-4 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#e2e8f0] flex items-center gap-2.5">
          <span className="w-[22px] h-[22px] rounded-md bg-[#7c3aed] text-white text-[10px] font-extrabold flex items-center justify-center">
            1
          </span>
          <span className="text-[13px] font-extrabold text-[#0f172a]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Basic Information
          </span>
        </div>
        <div className="px-5 py-4">
          <div className="mb-3.5">
            <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748b] mb-1.5">
              Exam Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. JEE Main Full Mock Test - 05"
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2.5 text-xs font-medium text-[#0f172a] outline-none transition-all focus:border-[#a5b4fc] focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.07)] placeholder:text-[#cbd5e1]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3.5 max-[600px]:grid-cols-1">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748b] mb-1.5">
                Target Exam
              </label>
              <select
                value={targetExam}
                onChange={(e) => {
                  setTargetExam(e.target.value as TargetExam);
                  setSelectedSubjects([]);
                  setSelectedChapters([]);
                }}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2.5 text-xs font-medium text-[#0f172a] outline-none cursor-pointer transition-all focus:border-[#a5b4fc] focus:bg-white appearance-none"
              >
                <option value="JEE">JEE (Mains + Advanced)</option>
                <option value="NEET">NEET UG</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748b] mb-1.5">
                Exam Type
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as ExamType)}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2.5 text-xs font-medium text-[#0f172a] outline-none cursor-pointer transition-all focus:border-[#a5b4fc] focus:bg-white appearance-none"
              >
                <option value="chapter">Chapter Wise</option>
                <option value="subject">Subject Wise</option>
                <option value="full">Full Mock Test</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Content Selection */}
      <div className="bg-white border border-[#e2e8f0] rounded-[14px] mb-4 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#e2e8f0] flex items-center gap-2.5">
          <span className="w-[22px] h-[22px] rounded-md bg-[#7c3aed] text-white text-[10px] font-extrabold flex items-center justify-center">
            2
          </span>
          <span className="text-[13px] font-extrabold text-[#0f172a]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Content Selection
          </span>
        </div>
        <div className="px-5 py-4">
          {/* Subject Chips */}
          <div className="mb-3.5">
            <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748b] mb-1.5">
              Subjects
            </label>
            <div className="flex flex-wrap gap-[7px]">
              {availableSubjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => toggleSubject(sub)}
                  className={`px-3.5 py-1.5 rounded-full border-[1.5px] text-[11px] font-semibold cursor-pointer transition-all ${
                    selectedSubjects.includes(sub)
                      ? "bg-[#ede9fe] border-[#a5b4fc] text-[#4f46e5]"
                      : "bg-white border-[#e2e8f0] text-[#64748b] hover:border-[#a5b4fc] hover:text-[#4f46e5]"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Chapter Grid */}
          {selectedSubjects.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748b]">
                  Chapters ({selectedChapters.length} selected)
                </label>
                <button
                  onClick={selectAllChapters}
                  className="text-[10px] font-bold text-[#4f46e5] cursor-pointer bg-transparent border-none hover:underline"
                >
                  {selectedChapters.length === availableChapters.length ? "Deselect All" : "Select All"}
                </button>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(175px,1fr))] gap-[5px] max-h-[220px] overflow-y-auto p-0.5 custom-scrollbar">
                {availableChapters.map((ch) => (
                  <button
                    key={ch.file}
                    onClick={() => toggleChapter(ch.file)}
                    className={`flex items-center gap-[7px] px-2.5 py-[7px] rounded-[7px] border text-[11px] font-medium cursor-pointer transition-all leading-tight text-left ${
                      selectedChapters.includes(ch.file)
                        ? "bg-[#ede9fe] border-[#a5b4fc] text-[#7c3aed]"
                        : "bg-[#f8fafc] border-[#e2e8f0] text-[#64748b] hover:border-[#a5b4fc] hover:text-[#0f172a]"
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-sm border-[1.5px] flex-shrink-0 flex items-center justify-center text-[8px] ${
                        selectedChapters.includes(ch.file) ? "border-[#7c3aed] text-[#7c3aed]" : "border-current"
                      }`}
                    >
                      {selectedChapters.includes(ch.file) ? "✓" : ""}
                    </span>
                    <span className="truncate">
                      {ch.name}
                      <span className="text-[9px] text-[#94a3b8] ml-1">({ch.classLevel})</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 3: Configuration */}
      <div className="bg-white border border-[#e2e8f0] rounded-[14px] mb-4 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#e2e8f0] flex items-center gap-2.5">
          <span className="w-[22px] h-[22px] rounded-md bg-[#7c3aed] text-white text-[10px] font-extrabold flex items-center justify-center">
            3
          </span>
          <span className="text-[13px] font-extrabold text-[#0f172a]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Configuration
          </span>
        </div>
        <div className="px-5 py-4">
          <div className="grid grid-cols-2 gap-3.5 max-[600px]:grid-cols-1 mb-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748b] mb-1.5">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as ExamDifficulty)}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2.5 text-xs font-medium text-[#0f172a] outline-none cursor-pointer transition-all focus:border-[#a5b4fc] focus:bg-white appearance-none"
              >
                <option value="mixed">Mixed (All Levels)</option>
                <option value="easy">Easy Only</option>
                <option value="medium">Medium Only</option>
                <option value="hard">Hard Only</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748b] mb-1.5">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Math.max(5, Math.min(360, parseInt(e.target.value) || 60)))}
                min={5}
                max={360}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2.5 text-xs font-medium text-[#0f172a] outline-none transition-all focus:border-[#a5b4fc] focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.07)]"
              />
            </div>
          </div>

          {/* Question Count Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748b]">
                Question Count
              </label>
              <span
                className="text-xl font-extrabold text-[#4f46e5]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {questionCount}
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={200}
              step={5}
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              className="w-full h-1 rounded-sm bg-[#e2e8f0] cursor-pointer outline-none accent-[#7c3aed]"
            />
            <div className="flex justify-between text-[10px] text-[#94a3b8] font-semibold mt-1">
              <span>5</span>
              <span>50</span>
              <span>100</span>
              <span>150</span>
              <span>200</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step 4: Access Control */}
      <div className="bg-white border border-[#e2e8f0] rounded-[14px] mb-4 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#e2e8f0] flex items-center gap-2.5">
          <span className="w-[22px] h-[22px] rounded-md bg-[#7c3aed] text-white text-[10px] font-extrabold flex items-center justify-center">
            4
          </span>
          <span className="text-[13px] font-extrabold text-[#0f172a]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Access Control
          </span>
        </div>
        <div className="px-5 py-4">
          <div className="mb-3.5">
            <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748b] mb-1.5">
              Exam Password
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password for students"
                className="flex-1 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2.5 text-xs font-medium text-[#0f172a] outline-none transition-all focus:border-[#a5b4fc] focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.07)] placeholder:text-[#cbd5e1]"
              />
              <button
                onClick={generatePassword}
                className="px-3.5 py-2.5 rounded-lg border border-[#e2e8f0] bg-white text-[11px] font-bold text-[#64748b] cursor-pointer whitespace-nowrap transition-all hover:border-[#a5b4fc] hover:text-[#4f46e5] hover:bg-[#f5f3ff]"
              >
                🎲 Generate
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3.5 max-[600px]:grid-cols-1">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748b] mb-1.5">
                Result Visibility
              </label>
              <select
                value={resultVisibility}
                onChange={(e) => setResultVisibility(e.target.value as ResultVisibility)}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2.5 text-xs font-medium text-[#0f172a] outline-none cursor-pointer transition-all focus:border-[#a5b4fc] focus:bg-white appearance-none"
              >
                <option value="immediate">Immediate (after submit)</option>
                <option value="after_exam_ends">After exam ends</option>
                <option value="manual">Manual release</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-5">
              <button
                onClick={() => setAllowRetake(!allowRetake)}
                className={`relative w-10 h-5 rounded-full transition-all cursor-pointer ${
                  allowRetake ? "bg-[#7c3aed]" : "bg-[#e2e8f0]"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
                    allowRetake ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
              <span className="text-xs font-semibold text-[#0f172a]">Allow Retakes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {!createdExam ? (
        <div className="flex gap-3 mt-1.5">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 rounded-[9px] bg-[#7c3aed] text-white text-[13px] font-bold cursor-pointer border-none shadow-[0_3px_12px_rgba(124,58,237,0.3)] transition-all hover:bg-[#6d28d9] hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Exam..." : "🚀 Create & Generate Link"}
          </button>
          <button
            onClick={() => router.push("/institute/dashboard")}
            className="px-6 py-3 rounded-[9px] bg-white border-[1.5px] border-[#e2e8f0] text-[#64748b] text-[13px] font-bold cursor-pointer transition-all hover:border-[#a5b4fc] hover:text-[#4f46e5]"
          >
            Cancel
          </button>
        </div>
      ) : (
        /* Generated Link Card */
        <div className="rounded-xl border border-[#c4b5fd] bg-gradient-to-br from-[#f5f3ff] to-[#ede9fe] p-[18px] mt-2">
          <h3
            className="text-sm font-extrabold text-[#0f172a] mb-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            ✅ Exam Created Successfully!
          </h3>
          <div className="flex gap-2 mb-2.5">
            <div className="flex-1 bg-white border border-[#ddd6fe] rounded-[7px] px-3 py-2 font-mono text-[11px] text-[#4f46e5] overflow-hidden text-ellipsis whitespace-nowrap">
              {createdExam.joinLink}
            </div>
            <button
              onClick={copyLink}
              className={`px-3.5 py-2 rounded-[7px] text-[11px] font-bold border-none cursor-pointer whitespace-nowrap transition-all ${
                copied
                  ? "bg-[#16a34a] text-white"
                  : "bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
              }`}
            >
              {copied ? "✓ Copied!" : "📋 Copy Link"}
            </button>
          </div>
          <div className="text-[11px] text-[#64748b] mb-3">
            Password:{" "}
            <span className="font-mono font-bold text-[#4f46e5] bg-white px-1.5 py-0.5 rounded border border-[#ddd6fe]">
              {createdExam.password}
            </span>
            <span className="ml-3 text-[#d97706] font-semibold">
              {createdExam.questionCount} questions generated
            </span>
          </div>
          <div className="flex gap-[7px] flex-wrap">
            <button
              onClick={shareWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-[7px] rounded-[7px] border border-[#ddd6fe] bg-white text-[11px] font-bold text-[#64748b] cursor-pointer transition-all hover:bg-[#ede9fe] hover:border-[#c4b5fd] hover:text-[#4f46e5]"
            >
              💬 Share via WhatsApp
            </button>
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-1.5 px-3 py-[7px] rounded-[7px] border border-[#ddd6fe] bg-white text-[11px] font-bold text-[#64748b] cursor-pointer transition-all hover:bg-[#ede9fe] hover:border-[#c4b5fd] hover:text-[#4f46e5]"
            >
              🔗 Copy Link
            </button>
            <button
              onClick={() => {
                setCreatedExam(null);
                setTitle("");
                setPassword("");
                setSelectedChapters([]);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-[7px] rounded-[7px] border border-[#ddd6fe] bg-white text-[11px] font-bold text-[#64748b] cursor-pointer transition-all hover:bg-[#ede9fe] hover:border-[#c4b5fd] hover:text-[#4f46e5]"
            >
              ➕ Create Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
