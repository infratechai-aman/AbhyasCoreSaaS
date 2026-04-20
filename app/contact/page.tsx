import { Footer } from "@/components/layout/footer";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Contact Us | AbhyasCore",
  description: "Get in touch with the AbhyasCore team.",
};

export default function ContactPage() {
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

      <main className="pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto relative z-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          {/* Left Column */}
          <div>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-indigo-200/50 bg-indigo-50/50 backdrop-blur-md px-4 py-2 mb-6">
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-700">Get In Touch</span>
            </div>
            <h1 className="font-display text-[42px] md:text-[56px] font-extrabold text-slate-900 leading-tight tracking-tight mb-4">
               Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Us</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg mb-12">
               Have questions about our plans, AI features, or need technical assistance? Our team is here to help you succeed.
            </p>

            <div className="space-y-8">
              {[
                { icon: Mail, title: "Support Email", detail: "support@abhyascore.ai" },
                { icon: Phone, title: "Call center", detail: "+91 (800) ABHYAS-CORE" },
                { icon: MapPin, title: "HQ Office", detail: "Cyber Hub, DLF Phase 2, Gurgaon, India" },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                    <item.icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 mb-0.5">{item.title}</div>
                    <div className="text-slate-500 text-[15px] font-medium">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="bg-white p-8 md:p-10 rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
             <form className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                    <input type="text" placeholder="John Doe" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                    <input type="email" placeholder="john@example.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Subject</label>
                   <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none appearance-none bg-white">
                      <option>Technical Support</option>
                      <option>Billing Inquiry</option>
                      <option>AI Tutor Feedback</option>
                      <option>Partnership opportunities</option>
                      <option>Other</option>
                   </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Message</label>
                  <textarea rows={5} placeholder="How can we help you?" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none"></textarea>
                </div>
                <button className="w-full flex justify-center items-center gap-2.5 rounded-xl bg-slate-900 px-8 py-4 text-[15px] font-bold text-white shadow-xl shadow-slate-900/20 transition-all hover:bg-indigo-600 hover:shadow-indigo-600/30">
                  Send Message
                  <Send className="w-4 h-4" />
                </button>
             </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
