import { Footer } from "@/components/layout/footer";
import { Users, Target, Rocket, Heart } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "About Us | AbhyasCore",
  description: "The story and mission behind AbhyasCore - India's premium AI mock test platform.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fafafc] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Mini Header */}
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 lg:px-6 pointer-events-none">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between rounded-2xl border border-white/60 bg-white/40 px-5 py-3 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] pointer-events-auto">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="AbhyasCore Logo" className="h-28 w-auto object-contain bg-white rounded-2xl p-2 shadow-sm" />
          </Link>
          <Link href="/">
             <button className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-wider">
               <ArrowLeft className="w-4 h-4" /> Back to Home
             </button>
          </Link>
        </div>
      </header>

      <main className="pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-[1000px] mx-auto relative z-10">
        
        <div className="mb-16">
           <div className="inline-flex items-center gap-2.5 rounded-full border border-indigo-200/50 bg-indigo-50/50 backdrop-blur-md px-4 py-2 mb-6">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-700">Our Story</span>
           </div>
           <h1 className="font-display text-[42px] md:text-[56px] font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
              Redefining <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Exam Preparation</span>
           </h1>
           <p className="text-slate-500 font-medium text-xl leading-relaxed max-w-3xl">
              AbhyasCore was born from a simple observation: most mock tests are just static PDFs. We believe every student deserves a dynamic, AI-powered coach that understands their unique learning pattern.
           </p>
        </div>

        <div className="grid gap-12 md:grid-cols-2 mb-20">
           <div className="bg-white p-8 md:p-12 rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-8">
                 <Target className="w-7 h-7 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
              <p className="text-slate-500 font-medium leading-relaxed">
                 To democratize high-end competitive coaching through affordable AI-driven analysis. We aim to reach every JEE and NEET aspirant in India, providing them with the tools they need to unlock their full potential.
              </p>
           </div>
           <div className="bg-white p-8 md:p-12 rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <div className="w-14 h-14 rounded-2xl bg-cyan-50 flex items-center justify-center mb-8">
                 <Rocket className="w-7 h-7 text-cyan-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h2>
              <p className="text-slate-500 font-medium leading-relaxed">
                 To become the gold standard for mock testing in India, where technology doesn&apos;t just replace traditional methods, but enhances them to create 10x more productivity for students.
              </p>
           </div>
        </div>

        <div className="relative overflow-hidden rounded-[40px] bg-slate-900 p-10 md:p-16 text-white shadow-2xl">
           <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500 rounded-full blur-[120px] opacity-30 -z-10" />
           <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 mb-6">
                 <Heart className="w-5 h-5 text-red-400 fill-red-400" />
                 <span className="text-sm font-bold uppercase tracking-widest text-indigo-300">The Human Element</span>
              </div>
              <h2 className="text-[32px] md:text-[44px] font-bold leading-tight mb-6">Built by IITians & Doctors, <br/>powered by AI.</h2>
              <p className="text-slate-400 text-lg font-medium leading-relaxed">
                 Our team consists of academic experts who have cracked these exams themselves. We combine human pedagogical expertise with cutting-edge machine learning to provide insights that actually matter.
              </p>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
