import { Footer } from "@/components/layout/footer";
import { Download, FileText, Image as ImageIcon, Share2 } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Press Kit | AbhyasCore",
  description: "Official logos, brand guidelines, and media resources for AbhyasCore.",
};

export default function PressKitPage() {
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
              <Share2 className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-700">Media Resources</span>
           </div>
           <h1 className="font-display text-[42px] md:text-[56px] font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
              Official <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Press Kit</span>
           </h1>
           <p className="text-slate-500 font-medium text-xl leading-relaxed max-w-2xl">
              Download our official brand assets, executive bios, and company descriptors for media use.
           </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 mb-16">
           <div className="bg-white p-8 md:p-10 rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
                 <ImageIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Logos & Symbols</h2>
              <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                 High-resolution PNG, SVG, and EPS formats for both light and dark backgrounds.
              </p>
              <button className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-600 transition-colors w-full justify-center">
                 <Download className="w-4 h-4" /> Download Logo Pack
              </button>
           </div>
           <div className="bg-white p-8 md:p-10 rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center mb-6">
                 <FileText className="w-6 h-6 text-cyan-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Fact Sheet</h2>
              <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                 A one-page PDF containing AbhyasCore quick facts, statistics, and founding story.
              </p>
              <button className="flex items-center gap-2 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors w-full justify-center">
                 <Download className="w-4 h-4" /> Download Fact Sheet
              </button>
           </div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
           <h2 className="text-2xl font-bold text-slate-900 mb-8">Brand Colors</h2>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Indigo Primary", hex: "#4F46E5" },
                { name: "Slate Dark", hex: "#0F172A" },
                { name: "Cyan Accent", hex: "#06B6D4" },
                { name: "Off White", hex: "#FAFAFC" },
              ].map((color, i) => (
                <div key={i} className="space-y-3">
                   <div className="h-24 w-full rounded-2xl shadow-inner border border-slate-100" style={{ backgroundColor: color.hex }} />
                   <div>
                      <div className="text-sm font-bold text-slate-900">{color.name}</div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{color.hex}</div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
