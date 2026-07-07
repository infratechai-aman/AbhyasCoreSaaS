"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, Plus, Search, MoreHorizontal, UserCheck, BookOpen, 
  ChevronRight, FileText 
} from "lucide-react";

const mockBatches = [
  { id: 1, name: "JEE Spark 2025", students: 45, exams: 12, performance: 78, status: "Active", lastActive: "2 hours ago" },
  { id: 2, name: "NEET Ignite 2024", students: 120, exams: 24, performance: 82, status: "Active", lastActive: "5 min ago" },
  { id: 3, name: "Foundation Class 11", students: 60, exams: 8, performance: 65, status: "Active", lastActive: "1 day ago" },
  { id: 4, name: "Dropper's Elite", students: 85, exams: 18, performance: 71, status: "Active", lastActive: "3 hours ago" },
];

export default function BatchesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = mockBatches.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 p-5 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-[24px] font-semibold text-slate-900 tracking-tight mb-1">Batch Management</h2>
          <p className="text-[14px] text-slate-500">Organize your students into batches for targeted exam delivery.</p>
        </div>
        <button className="flex items-center justify-center h-9 px-5 rounded-lg bg-indigo-600 text-white text-[13px] font-semibold shadow-[0_2px_8px_rgba(79,70,229,0.25)] hover:bg-indigo-700 transition-all hover:scale-[1.02] gap-2">
          <Plus className="w-4 h-4" /> Create Batch
        </button>
      </div>

      {/* Stats Cards - matching student dashboard exactly */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 mb-10">
        <div className="bg-white rounded-[16px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <Users className="h-4 w-4" />
          </div>
          <div className="text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase mb-1">Total Batches</div>
          <div className="text-[28px] font-bold text-slate-900 leading-none">8</div>
        </div>
        <div className="bg-white rounded-[16px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <UserCheck className="h-4 w-4" />
          </div>
          <div className="text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase mb-1">Total Students</div>
          <div className="text-[28px] font-bold text-slate-900 leading-none">342</div>
        </div>
        <div className="bg-white rounded-[16px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase mb-1">Active Exams</div>
          <div className="text-[28px] font-bold text-slate-900 leading-none">24</div>
        </div>
      </div>

      {/* Batches Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-bold text-slate-900">All Batches</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search batches..." 
              className="w-[220px] pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-[13px] outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((batch) => (
            <div key={batch.id} className="flex items-center justify-between p-5 bg-white rounded-[16px] border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-indigo-100 hover:shadow-md transition-all cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-50 border border-indigo-100/50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[13px] font-bold text-slate-900 mb-0.5">{batch.name}</div>
                  <div className="text-[12px] text-slate-500 mb-2">{batch.students} Students &bull; {batch.exams} Exams</div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[9px] font-bold text-slate-500 tracking-[0.1em] uppercase">Avg {batch.performance}%</span>
                    <span className="text-[11px] font-medium text-slate-400">{batch.lastActive}</span>
                  </div>
                </div>
              </div>
              <div className="text-slate-300 group-hover:text-indigo-600 transition-colors mr-2">
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
