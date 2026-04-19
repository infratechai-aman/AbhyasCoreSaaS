import { Footer } from "@/components/layout/footer";
import { Gavel, AlertCircle, FileText, Cpu } from "lucide-react";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms and Conditions | AbhyasCore",
  description: "Terms and conditions for utilizing the AbhyasCore platform.",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-[#fafafc] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Mini Header */}
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 lg:px-6 pointer-events-none">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between rounded-2xl border border-white/60 bg-white/40 px-5 py-3 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] pointer-events-auto">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="AbhyasCore Logo" className="h-32 w-auto object-contain" />
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
              <Gavel className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-700">Legal Sub-Directory</span>
           </div>
           <h1 className="font-display text-[42px] md:text-[56px] font-extrabold text-slate-900 leading-tight tracking-tight mb-4">
              Terms & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Conditions</span>
           </h1>
           <p className="text-slate-500 font-medium text-lg max-w-2xl">
              Last updated: April 19, 2026. By registering and utilizing the AbhyasCore platform, you agree to comply strictly with the terms outlined below.
           </p>
        </div>

        <div className="prose prose-slate prose-lg max-w-none bg-white p-8 md:p-12 rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">
             <FileText className="w-6 h-6 text-indigo-500" /> 1. Acceptance of Terms
          </h2>
          <p className="mb-8">
            These Terms of Service ("Terms") dictate the rules and operations concerning your use of the AbhyasCore platform. If you register an account, purchase a subscription, or partake in a mock examination, you signify irrefutable acceptance of these Terms. If you do not agree with any clause, refrain from accessing the software.
          </p>

          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">
             <AlertCircle className="w-6 h-6 text-indigo-500" /> 2. User Accounts & Security
          </h2>
          <p>
             Your account is non-transferable. You are entirely responsible for:
          </p>
          <ul className="mb-8">
            <li>Maintaining the absolute confidentiality of your authentication credentials.</li>
            <li>All activities, examinations taken, and API tokens consumed under your account identity.</li>
            <li>Notifying support immediately upon suspecting an unauthorized compromise of your login state.</li>
          </ul>

          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">
             <Cpu className="w-6 h-6 text-indigo-500" /> 3. AI Service Usage & Fair Play
          </h2>
          <p>
            Our core product involves highly intensive computational operations to grade and analyze your mock responses via artificial intelligence.
          </p>
          <ul className="mb-8">
            <li><strong>AI Token Limits:</strong> For free tier users, queries sent to the generative Tutor and examination analyses are capped to prevent server overloads. Premium users are subject to "Fair Use" volume limits to halt programmatic API scraping.</li>
            <li><strong>Automated Scripts:</strong> Utilizing bots, scrapers, web-crawlers, or automated injection scripts to pull questions or flood the testing engine with artificial attempts is strictly prohibited. Doing so will result in an instant, unappealable IP and account ban.</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">
             4. Intellectual Property Rights
          </h2>
          <p className="mb-8">
            All original questions, UI architectures, backend systems, code logic, analytical visualizations, and textual assets located on the AbhyasCore platform are the exclusive intellectual property of the developers. You may not reproduce, redistribute, sell, or mirror our examination content or AI outputs on competing platforms or educational sites. Past year official questions (PYQs) belong to their respective governing councils (NTA/CBSE) and are aggregated purely for educational simulations under Fair Use principles.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">
             5. Premium Subscriptions
          </h2>
          <p className="mb-8">
             Access to the "Pro Engine" requires an active subscription processed through authorized billing partners (Razorpay). 
             <br/><br/>
             Billing cycles apply automatically depending on the selected plan. Disruption of payment, fraudulent chargebacks, or manual circumvention of gated paywalls will result in the immediate forfeiture of your account and related historical data.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">
             6. Limitation of Liability
          </h2>
          <p className="mb-8">
             AbhyasCore functions strictly "as-is". We make no warranties, explicit or implied, that the platform will be 100% immune from downtime or minor computational anomalies. Under no circumstances will our team be held legally or financially liable for an individual's failure to clear their actual JEE/NEET competitive examination. The predictive ranks and analytics serve to guide; they are not concrete prophecies.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">
             7. Termination
          </h2>
          <p className="mb-8">
             We maintain the absolute right to suspend or terminate your access, without prior written notice or financial refund, if we conclusively detect violations of these terms, abusive behavior, credential pooling (group sharing a single account), or utilization of the platform to conduct malicious cyber activities.
          </p>

          <div className="mt-12 bg-slate-50 p-6 rounded-2xl border border-slate-200/60 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
             <div>
                <h3 className="font-bold text-slate-900 mb-1">Legal Queries</h3>
                <p className="text-sm text-slate-600">
                  Questions regarding our Terms can be forwarded.
                </p>
             </div>
             <a href="mailto:legal@abhyascore.com" className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors shadow-sm">
                 legal@abhyascore.com
             </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
