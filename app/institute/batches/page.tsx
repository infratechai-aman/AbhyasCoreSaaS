"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function BatchesPage() {
  const router = useRouter();

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-[#0f172a] mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Batches
        </h2>
        <p className="text-xs font-medium text-[#64748b]">Organize your students into batches for targeted exam delivery.</p>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.03)] p-10 text-center">
        <div className="text-4xl mb-4">👥</div>
        <h3 className="text-[15px] font-bold text-[#0f172a] mb-2">Batch Management Coming Soon</h3>
        <p className="text-[13px] text-[#64748b] max-w-md mx-auto mb-6">
          Create and manage student batches, assign exams to specific batches, and track batch-wise performance analytics.
        </p>
        <button
          onClick={() => router.push("/institute/create-exam")}
          className="px-5 py-2.5 bg-[#7c3aed] text-white rounded-lg text-[12px] font-bold shadow-[0_2px_8px_rgba(124,58,237,0.3)] hover:bg-[#6d28d9] transition-all"
        >
          Create an Exam Instead
        </button>
      </div>
    </div>
  );
}
