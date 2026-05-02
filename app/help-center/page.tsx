import { Footer } from "@/components/layout/footer";
import { HelpCircle, Book, MessageSquare, LifeBuoy } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Help Center | AbhyasCore",
  description: "Get help and support for AbhyasCore platform.",
};

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-[#fafafc] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Mini Header */}
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 lg:px-6 pointer-events-none">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between rounded-2xl border border-white/60 bg-white/40 px-5 py-3 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] pointer-events-auto">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="AbhyasCore Logo" className="h-28 w-auto object-contain" />
          </Link>
          <Link href="/">
             <button className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-wider">
               <ArrowLeft className="w-4 h-4" /> Back to Home
             </button>
          </Link>
        </div>
      </header>

      <main className="pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-[1000px] mx-auto relative z-10">
        
        <div className="mb-12">
           <div className="inline-flex items-center gap-2.5 rounded-full border border-indigo-200/50 bg-indigo-50/50 backdrop-blur-md px-4 py-2 mb-6">
              <LifeBuoy className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-700">Support Hub</span>
           </div>
           <h1 className="font-display text-[42px] md:text-[56px] font-extrabold text-slate-900 leading-tight tracking-tight mb-4">
              Help <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Center</span>
           </h1>
           <p className="text-slate-500 font-medium text-lg max-w-2xl">
              Everything you need to know about using AbhyasCore effectively. Find guides, tutorials, and answers to common questions.
           </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-12">
          {[
            { icon: Book, title: "Getting Started", desc: "New to AbhyasCore? Follow our quick start guide to set up your profile and start your first mock test." },
            { icon: HelpCircle, title: "Exam Simulator", desc: "Learn how to use the NTA-style console, mark questions for review, and understand negative marking." },
            { icon: MessageSquare, title: "AI Tutor Guide", desc: "Discover how to get the most out of your personal AI tutor for doubt clearing and concept explanation." },
            { icon: LifeBuoy, title: "Billing & Subscriptions", desc: "Manage your Pro plans, update payment methods, and understand our trial periods." },
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:border-indigo-200 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                <item.icon className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="prose prose-slate prose-lg max-w-none bg-white p-8 md:p-12 rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Popular Articles</h2>
          <ul className="space-y-4">
            <li><Link href="/faq" className="text-indigo-600 hover:underline">How does the AI rank prediction work?</Link></li>
            <li><Link href="/faq" className="text-indigo-600 hover:underline">Can I take mock tests on my mobile device?</Link></li>
            <li><Link href="/faq" className="text-indigo-600 hover:underline">What happens if my internet disconnects during a test?</Link></li>
            <li><Link href="/terms-and-conditions" className="text-indigo-600 hover:underline">Understanding our fair usage policy for AI tokens.</Link></li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}
