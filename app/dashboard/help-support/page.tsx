import { DashboardShell } from "@/components/layout/dashboard-shell";
import { MessageCircle, Mail, ChevronDown, BookOpen, Zap, AlertCircle, LifeBuoy, ExternalLink } from "lucide-react";

const faqs = [
  {
    q: "How does the AI question generation work?",
    a: "AbhyasCore uses GPT-4 alongside our curated 120-question-per-chapter XML dataset to build personalized 30-question drills. Questions are balanced across Easy, Medium, and Hard difficulty bands."
  },
  {
    q: "Why is a chapter showing 'Coming Soon'?",
    a: "Coming Soon means the question dataset for that chapter hasn't been uploaded yet. Class 11 chapters across all subjects are live. Class 12 chapters will be activated progressively."
  },
  {
    q: "My drill timer expired - was my progress saved?",
    a: "Drill state is stored in browser memory during the session. After time-out you are redirected to the Performance page. Full cloud-sync of in-progress sessions is coming soon."
  },
  {
    q: "How is my AIR Prediction calculated?",
    a: "The projected AIR is computed using a rolling average of your last 5 mock scores, compared against our anonymized leaderboard of 50,000+ active students on the platform."
  },
  {
    q: "Can I switch between JEE and NEET targets?",
    a: "Yes! Head to Settings → Exam Target and choose between JEE, NEET, or Both. This changes the mock paper pattern and subject weightage used in your drills."
  },
];

export default function HelpSupportPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col h-full bg-[#fafafc] p-8 overflow-y-auto">
        
        {/* Header */}
        <div className="mb-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold tracking-[0.2em] uppercase mb-4 shadow-sm">
            <LifeBuoy className="w-3.5 h-3.5" /> Support Center
          </div>
          <h2 className="text-[32px] font-display font-bold text-slate-900 tracking-tight leading-none mb-3">Help & Support</h2>
          <p className="text-slate-500 text-[14px]">
            Find answers to common questions or reach out to our team directly. Average response time: &lt;2 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-8 max-w-5xl">
          
          {/* FAQ Section */}
          <div>
            <h3 className="text-[15px] font-bold text-slate-900 mb-5">Frequently Asked Questions</h3>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details key={i} className="group bg-white rounded-[20px] border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
                  <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none gap-4">
                    <span className="text-[14px] font-bold text-slate-800 leading-snug">{faq.q}</span>
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-6 pb-5 text-[13px] leading-relaxed text-slate-500 font-medium border-t border-slate-100 pt-4">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Right - Contact Options */}
          <div className="space-y-5">
            
            {/* Live Chat Card */}
            <div className="bg-slate-900 rounded-[24px] p-6 text-white relative overflow-hidden shadow-xl">
              <div className="absolute -top-6 -right-6 w-28 h-28 bg-indigo-500 rounded-full blur-[50px] opacity-50 mix-blend-screen" />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 mb-4">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h3 className="font-display text-[18px] font-bold mb-2">Live Chat</h3>
                <p className="text-[13px] text-slate-400 leading-relaxed mb-5">
                  Get instant help from our support team. Available Mon–Sat, 9 AM – 9 PM IST.
                </p>
                <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[13px] rounded-xl transition-colors shadow-lg">
                  Start Chat Session
                </button>
              </div>
            </div>

            {/* Email Support */}
            <div className="bg-white rounded-[24px] border border-slate-200/60 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 mb-4">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-900 mb-1">Email Support</h3>
              <p className="text-[12px] text-slate-500 mb-4">Send us a detailed message. We respond within 24 hours on business days.</p>
              <a
                href="mailto:support@abhyascore.com"
                className="flex items-center justify-between w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-[13px] text-slate-700 transition-colors"
              >
                support@abhyascore.com
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-[24px] border border-slate-200/60 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <h3 className="text-[15px] font-bold text-slate-900 mb-4">Quick Resources</h3>
              <div className="space-y-2">
                {[
                  { icon: BookOpen, label: "Documentation & Guides" },
                  { icon: Zap, label: "Platform Status Page" },
                  { icon: AlertCircle, label: "Report a Bug" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button key={item.label} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[13px] font-bold text-slate-700 group-hover:text-slate-900">{item.label}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-300 ml-auto" />
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
