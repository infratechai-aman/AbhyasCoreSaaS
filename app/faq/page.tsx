import { Footer } from "@/components/layout/footer";
import { HelpCircle, ChevronDown } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Frequently Asked Questions | AbhyasCore",
  description: "Find answers to commonly asked questions about AbhyasCore.",
};

const faqs = [
  {
    question: "Is the exam interface identical to the real NTA console?",
    answer: "Yes, we have meticulously built our exam simulator to mirror the exact UI, functionality, and constraints of the NTA (National Testing Agency) computer-based test interface. This includes the color palette, question palette, flagging system, and timer layout."
  },
  {
    question: "How does the AI Rank Prediction work?",
    answer: "Our AI analysis tool takes your mock test score and compares it against historical JEE/NEET data, current year's difficulty trends, and the performance of thousands of other aspirants on our platform. We provide a projected AIR (All India Rank) with percentile distributions."
  },
  {
    question: "What happens if my internet connection is lost during a test?",
    answer: "AbhyasCore is built with 'Local-Sync' technology. Your responses are saved locally in your browser after every click. If you lose connection, you can continue the test, and your answers will sync to our servers automatically once you're back online."
  },
  {
    question: "Can I use the AI Tutor for every question?",
    answer: "Yes, every question in our repository comes with an 'Ask AI' button. The AI Tutor provides a step-by-step conceptual breakdown, identifies where you potentially made a calculation error, and suggests related theory videos."
  },
  {
    question: "What is the Refund Policy for premium plans?",
    answer: "We offer a 7-day no-questions-asked refund policy for the Pro Monthly plan, provided you have not attempted more than 3 full-length mock tests during that period. The ₹7 Weekly Pass is non-refundable due to its low cost and one-time nature."
  },
  {
    question: "How many devices can I log in from?",
    answer: "To prevent credential sharing and ensure account security, a single account can be active on only one primary testing device at a time. However, you can access your analytics dashboard from both mobile and desktop simultaneously."
  }
];

export default function FAQPage() {
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

      <main className="pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-[900px] mx-auto relative z-10">
        
        <div className="mb-12 text-center">
           <div className="inline-flex items-center gap-2.5 rounded-full border border-indigo-200/50 bg-indigo-50/50 backdrop-blur-md px-4 py-2 mb-6">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-700">Information Hub</span>
           </div>
           <h1 className="font-display text-[42px] md:text-[56px] font-extrabold text-slate-900 leading-tight tracking-tight mb-4">
              Common <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">FAQ&apos;s</span>
           </h1>
           <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
              Quick answers to the most common questions about the AbhyasCore platform.
           </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-[24px] border border-slate-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
               <details className="group">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none appearance-none">
                     <h3 className="text-[17px] font-bold text-slate-900 group-open:text-indigo-600 transition-colors">{faq.question}</h3>
                     <ChevronDown className="w-5 h-5 text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-6 pb-6 pt-0">
                     <p className="text-slate-500 leading-relaxed font-medium">
                        {faq.answer}
                     </p>
                  </div>
               </details>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-slate-900 rounded-[32px] p-10 text-center text-white relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 -z-10" />
           <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
           <p className="text-slate-400 mb-8 max-w-lg mx-auto">
             If you couldn&apos;t find what you were looking for, feel free to reach out to our dedicated support team 24/7.
           </p>
           <Link href="/contact">
             <button className="bg-white text-slate-900 px-8 py-3.5 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-lg">
               Contact Support
             </button>
           </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
