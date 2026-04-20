import { Footer } from "@/components/layout/footer";
import { Briefcase, MapPin, Search, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Careers | AbhyasCore",
  description: "Join the team building the future of AI-powered competitive exam preparation.",
};

const jobs = [
  {
    title: "Senior AI Engineer",
    type: "Full-Time",
    location: "Remote / Hybrid (Gurgaon)",
    dept: "Engineering"
  },
  {
    title: "Subject Matter Expert (Physics)",
    type: "Contract",
    location: "Remote",
    dept: "Content"
  },
  {
    title: "Product Designer (UX/UI)",
    type: "Full-Time",
    location: "Hybrid (Gurgaon)",
    dept: "Design"
  },
  {
    title: "Frontend Developer (Next.js)",
    type: "Full-Time",
    location: "Remote",
    dept: "Engineering"
  }
];

export default function CareersPage() {
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
        
        <div className="mb-16 text-center">
           <div className="inline-flex items-center gap-2.5 rounded-full border border-indigo-200/50 bg-indigo-50/50 backdrop-blur-md px-4 py-2 mb-6">
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-700">Join Our Mission</span>
           </div>
           <h1 className="font-display text-[42px] md:text-[56px] font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
              Help us build <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Education&apos;s Future</span>
           </h1>
           <p className="text-slate-500 font-medium text-xl leading-relaxed max-w-2xl mx-auto">
              We&apos;re looking for passionate problem solvers who want to make high-end exam preparation accessible to every Indian student.
           </p>
        </div>

        <div className="bg-white p-4 rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-12">
           <div className="flex flex-col md:flex-row items-center gap-4 p-2">
              <div className="relative flex-1 w-full">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                 <input type="text" placeholder="Search roles (e.g. Engineer, Physics)..." className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none" />
              </div>
              <button className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-colors">
                 Find Jobs
              </button>
           </div>
        </div>

        <div className="space-y-4">
           {jobs.map((job, i) => (
             <div key={i} className="group bg-white p-6 rounded-[24px] border border-slate-200/60 hover:border-indigo-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between">
                <div className="flex items-center gap-6">
                   <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-inner">
                      <Briefcase className="w-5 h-5" />
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1">{job.title}</h3>
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                         <span>{job.dept}</span>
                         <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                         </span>
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-6">
                   <span className="hidden sm:inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">{job.type}</span>
                   <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                </div>
             </div>
           ))}
        </div>

        <div className="mt-20 border-t border-slate-100 pt-16 grid gap-12 md:grid-cols-3">
           {[
             { title: "Remote First", desc: "We prioritize productivity over location. Work from anywhere in India that inspires you." },
             { title: "Ownership", desc: "Join a high-growth startup where your decisions directly impact millions of students." },
             { title: "Learning", desc: "Access to premium courses, tech conferences, and a team of toppers to learn from." },
           ].map((perk, i) => (
             <div key={i} className="text-center md:text-left">
                <h4 className="text-lg font-bold text-slate-900 mb-3">{perk.title}</h4>
                <p className="text-slate-500 font-medium leading-relaxed">{perk.desc}</p>
             </div>
           ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
