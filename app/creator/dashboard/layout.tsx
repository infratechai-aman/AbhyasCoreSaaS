"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { LogOut, LayoutDashboard } from "lucide-react";

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user && mounted) {
      router.push("/login");
    }
  }, [user, loading, router, mounted]);

  if (loading || !user || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafc]">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#fafafc] text-slate-800 font-sans flex flex-col">
      {/* Top Header */}
      <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-30 shadow-sm relative">
        <div className="flex items-center gap-4">
          <Link href="/creator/dashboard" className="flex items-center gap-2">
            <Image src="/logo.png" alt="AbhyasCore" width={112} height={56} className="h-10 w-auto object-contain" />
          </Link>
          <div className="h-5 w-px bg-slate-200 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 border border-indigo-100">
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">Creator Hub</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="hidden sm:flex items-center gap-2 text-[13px] font-bold text-slate-500 hover:text-indigo-600 transition-colors"
          >
             <LayoutDashboard className="h-4 w-4" /> Go to App
          </Link>
          <div className="h-5 w-px bg-slate-200 hidden sm:block" />
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold text-slate-500 hover:bg-slate-50 hover:text-rose-600 border border-transparent hover:border-slate-200 transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
