"use client";

import React, { useState } from "react";
import { 
  BarChart3, TrendingUp, Target, Download, FileText, ChevronRight,
  ArrowUpRight, ArrowDownRight 
} from "lucide-react";

const examTrends = [
  { name: "JEE Full Mock Test 1", score: 62, change: 4, date: "05 Jul 2026" },
  { name: "Physics: Mechanics", score: 71, change: 12, date: "03 Jul 2026" },
  { name: "Chemistry: Organic", score: 54, change: -8, date: "01 Jul 2026" },
  { name: "Mathematics: Calculus", score: 68, change: 5, date: "28 Jun 2026" },
];

const chapterPerformance = [
  { name: "Kinematics", accuracy: 82, attempts: 156 },
  { name: "Electrostatics", accuracy: 41, attempts: 98 },
  { name: "Thermodynamics", accuracy: 38, attempts: 74 },
  { name: "Modern Physics", accuracy: 62, attempts: 112 },
  { name: "Semiconductor", accuracy: 71, attempts: 89 },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30days");

  return (
    <div className="flex-1 p-5 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-[24px] font-semibold text-slate-900 tracking-tight mb-1">Advanced Analytics</h2>
          <p className="text-[14px] text-slate-500">Deep-dive into student performance, chapter-wise accuracy, and trends.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)} 
            className="h-9 px-4 rounded-lg bg-white border border-slate-200 text-[13px] font-medium text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
          <button className="flex items-center justify-center h-9 px-5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[13px] font-semibold hover:bg-slate-50 transition-all gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Stats Cards - matching student dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 mb-10">
        <div className="bg-white rounded-[16px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <Target className="h-4 w-4" />
          </div>
          <div className="text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase mb-1">Avg. Accuracy</div>
          <div className="text-[28px] font-bold text-slate-900 leading-none">68%</div>
        </div>
        <div className="bg-white rounded-[16px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase mb-1">Top Chapter</div>
          <div className="text-[18px] font-bold text-slate-900 leading-none truncate">Kinematics</div>
        </div>
        <div className="bg-white rounded-[16px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-4">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div className="text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase mb-1">Weakest Chapter</div>
          <div className="text-[18px] font-bold text-slate-900 leading-none truncate">Thermodynamics</div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-10">
        {/* Recent Exam Trends */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-slate-900">Recent Exam Trends</h3>
            <button className="text-[10px] font-bold tracking-[0.1em] text-indigo-600 uppercase hover:text-indigo-700 transition-colors flex items-center gap-1">
              View All <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {examTrends.map((exam, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-white rounded-[16px] border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-indigo-100 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-50 border border-indigo-100/50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-slate-900 mb-0.5">{exam.name}</div>
                    <div className="text-[12px] text-slate-500">Score: {exam.score}% &bull; {exam.date}</div>
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-[12px] font-bold ${exam.change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {exam.change >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {Math.abs(exam.change)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chapter Performance */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-slate-900">Chapter Performance</h3>
            <button className="text-[10px] font-bold tracking-[0.1em] text-indigo-600 uppercase hover:text-indigo-700 transition-colors">View All</button>
          </div>
          <div className="bg-white rounded-[16px] border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-2">
            {chapterPerformance.map((ch, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-[13px] font-bold text-slate-900 w-[140px] truncate">{ch.name}</div>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${ch.accuracy >= 70 ? 'bg-emerald-500' : ch.accuracy >= 50 ? 'bg-indigo-500' : 'bg-red-400'}`} 
                      style={{ width: `${ch.accuracy}%` }} 
                    />
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-[13px] font-bold text-slate-900">{ch.accuracy}%</div>
                  <div className="text-[10px] text-slate-400">{ch.attempts} attempts</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
