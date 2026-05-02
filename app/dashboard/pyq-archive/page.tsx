"use client";

import { useAuth } from "@/lib/auth-context";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { ArrowRight, History, Calendar, Play } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PyqArchivePage() {
  const { userData } = useAuth();
  const router = useRouter();
  
  const isNeet = userData?.targetExam === "NEET";
  const examPrefix = isNeet ? "neet" : "jee_main";
  const questionCount = isNeet ? 200 : 90;
  
  // Generate [2025, 2024, 2023, ..., 2010]
  const years = Array.from({ length: 16 }, (_, i) => 2025 - i);

  return (
    <DashboardShell>
      <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
              <History className="w-6 h-6 text-indigo-600" />
           </div>
           <div>
              <h1 className="text-[28px] font-display font-bold text-slate-900">
                PYQ Archive
              </h1>
              <p className="text-slate-500">
                Full-length, historical {isNeet ? "NEET" : "JEE Main"} papers from 2010 to 2024.
              </p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          {years.map((year) => (
            <Card 
              key={year}
              onClick={() => router.push(`/test-console/custom?c=${examPrefix}_${year}&q=${questionCount}`)}
              className="group relative h-full rounded-[24px] border-slate-200 bg-white p-6 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
            >
               <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-indigo-900 group-hover:scale-110 transition-transform duration-500">
                  <Calendar className="w-24 h-24" />
               </div>
               
               <div className="relative z-10">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                     <History className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{isNeet ? "NEET" : "JEE Main"} {year}</h3>
                  <p className="text-[13px] text-slate-500 line-clamp-2 mb-4">
                     Authentic, structurally verified {isNeet ? "200" : "90"} question format from {year}.
                  </p>
               </div>
               
               <div className="relative z-10 flex items-center text-[13px] font-bold text-indigo-600">
                  <span>Start Simulation</span>
                  <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center ml-2 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                     <Play className="w-3 h-3 translate-x-[1px]" />
                  </div>
               </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
