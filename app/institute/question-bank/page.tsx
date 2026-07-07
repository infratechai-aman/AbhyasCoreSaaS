"use client";

import React, { useState } from "react";
import { Search, Plus, BookOpen, MoreVertical, CheckCircle2, ChevronRight, Filter } from "lucide-react";

const mockQuestions = [
  { id: 1, text: "A particle moves in a straight line with retardation proportional to its displacement. Its loss of kinetic energy for any displacement x is proportional to:", subject: "Physics", chapter: "Kinematics", difficulty: "Medium", usedIn: 3 },
  { id: 2, text: "The standard reduction potential values of three metallic cations, X, Y, Z are 0.52, -3.03 and -1.18 V respectively. The order of reducing power of the corresponding metals is:", subject: "Chemistry", chapter: "Electrochemistry", difficulty: "Hard", usedIn: 5 },
  { id: 3, text: "If the roots of the equation x² - px + q = 0 differ by unity, then:", subject: "Mathematics", chapter: "Quadratic Equations", difficulty: "Easy", usedIn: 2 },
  { id: 4, text: "A body of mass m is thrown vertically upward with velocity v. The height at which the kinetic energy of the body is one-third of the initial value is:", subject: "Physics", chapter: "Work & Energy", difficulty: "Medium", usedIn: 4 },
];

export default function QuestionBankPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");

  const filtered = mockQuestions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase()) || q.chapter.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === "all" || q.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="flex-1 p-5 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-[24px] font-semibold text-slate-900 tracking-tight mb-1">Question Bank</h2>
          <p className="text-[14px] text-slate-500">Browse, add, and manage your custom question repository.</p>
        </div>
        <button className="flex items-center justify-center h-9 px-5 rounded-lg bg-indigo-600 text-white text-[13px] font-semibold shadow-[0_2px_8px_rgba(79,70,229,0.25)] hover:bg-indigo-700 transition-all hover:scale-[1.02] gap-2">
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-10">
        <div className="bg-white rounded-[16px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase mb-1">Total Questions</div>
          <div className="text-[28px] font-bold text-slate-900 leading-none">1,247</div>
        </div>
        <div className="bg-white rounded-[16px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase mb-1">Validated</div>
          <div className="text-[28px] font-bold text-slate-900 leading-none">1,182</div>
        </div>
        <div className="bg-white rounded-[16px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
            <Filter className="h-4 w-4" />
          </div>
          <div className="text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase mb-1">Subjects</div>
          <div className="text-[28px] font-bold text-slate-900 leading-none">3</div>
        </div>
        <div className="bg-white rounded-[16px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="h-8 w-8 rounded-lg bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center mb-4">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase mb-1">Chapters</div>
          <div className="text-[28px] font-bold text-slate-900 leading-none">42</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-bold text-slate-900">All Questions</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search questions..." 
              className="w-[220px] pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-[13px] outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
          <select 
            value={subjectFilter} 
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="h-[38px] px-3 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Subjects</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Mathematics">Mathematics</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="flex flex-col gap-3">
        {filtered.map((q) => (
          <div key={q.id} className="flex items-center justify-between p-5 bg-white rounded-[16px] border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-indigo-100 hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-50 border border-indigo-100/50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <BookOpen className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold text-slate-900 mb-1 line-clamp-2">{q.text}</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-[9px] font-bold text-indigo-600 tracking-[0.1em] uppercase">{q.subject}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-[9px] font-bold text-slate-500 tracking-[0.1em] uppercase">{q.chapter}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-[0.1em] uppercase ${
                    q.difficulty === 'Hard' ? 'bg-red-50 text-red-600' : 
                    q.difficulty === 'Medium' ? 'bg-orange-50 text-orange-600' : 
                    'bg-emerald-50 text-emerald-600'
                  }`}>{q.difficulty}</span>
                  <span className="text-[11px] font-medium text-slate-400">Used in {q.usedIn} exams</span>
                </div>
              </div>
            </div>
            <div className="text-slate-300 group-hover:text-indigo-600 transition-colors ml-4">
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        ))}
      </div>

      <div className="h-12"></div>
    </div>
  );
}
