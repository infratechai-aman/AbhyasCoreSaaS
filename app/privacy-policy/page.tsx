import { Footer } from "@/components/layout/footer";
import { Shield, Lock, Eye, Database } from "lucide-react";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | AbhyasCore",
  description: "Privacy Policy and Data Protection guidelines for AbhyasCore.",
};

export default function PrivacyPolicyPage() {
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
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-700">Legal Sub-Directory</span>
           </div>
           <h1 className="font-display text-[42px] md:text-[56px] font-extrabold text-slate-900 leading-tight tracking-tight mb-4">
              Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Policy</span>
           </h1>
           <p className="text-slate-500 font-medium text-lg max-w-2xl">
              Last updated: April 19, 2026. This Privacy Policy details how AbhyasCore collects, utilizes, and protects your personal data while you use our mock test and AI-tutoring platform.
           </p>
        </div>

        <div className="prose prose-slate prose-lg max-w-none bg-white p-8 md:p-12 rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">
             <Database className="w-6 h-6 text-indigo-500" /> 1. Information We Collect
          </h2>
          <p>
            When you interact with AbhyasCore, we collect information that helps us provide you with the most accurate, realistic, and productive JEE/NEET mock environment possible. Your data is split into two categories:
          </p>
          <ul className="mb-8">
            <li><strong>Personal/Identifiable Information:</strong> When you register an account, we collect your Name, Email Address, Contact Number, Educational Institution (optional), and target examination (JEE Mains, JEE Advanced, NEET).</li>
            <li><strong>Usage & Performance Analytics:</strong> We meticulously track your interaction with the examination engine. This includes time-spent-per-question, accuracy rates, chapter-wise competence, browser telemetry during the live test, and inputs to our AI Tutor bot.</li>
          </ul>

          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">
             <Lock className="w-6 h-6 text-indigo-500" /> 2. How We Use Your Data
          </h2>
          <p>
            The primary reason we collect your data is to power our AI models and improve your academic performance. We do not sell your personal data to third parties. We use your data for the following essential purposes:
          </p>
          <ul className="mb-8">
            <li><strong>AI Analysis:</strong> To calculate granular weaknesses (e.g., identifying precision drops in specific Physics topics) and auto-generating custom drills based on your past mock test mistakes.</li>
            <li><strong>Authentication & Security:</strong> To keep your session secure and prevent abuse or credential sharing.</li>
            <li><strong>Communication:</strong> To send you weekly analytical reports, rank predictions, password resets, and critical updates about syllabus modifications or platform outages.</li>
            <li><strong>Payment Processing:</strong> We rely on secure third-party processors (such as Razorpay) to handle payment data. AbhyasCore does not store full credit card numbers or backend UPI pins on our primary servers.</li>
          </ul>

          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">
             <Eye className="w-6 h-6 text-indigo-500" /> 3. Data Storage, Tracking & Cookies
          </h2>
          <p>
             <strong>Cookies and Local Storage:</strong> We heavily utilize browser Local Storage and secure cookies to maintain active login sessions across routes, save transient examination states (so you can resume a test if your browser crashes), and store your theme preferences.
          </p>
          <p className="mb-8">
             <strong>Retention:</strong> Your historical test data, including answers and AI tokens utilized, are stored persistently to allow for long-term progress graphs. If you decide to delete your account, your personal identifiers will be scrubbed, but anonymized aggregate test data may be retained to further train our general analytic models.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">
             4. Third-Party Integrations
          </h2>
          <p className="mb-8">
             We integrate with highly reputable third-party services to ensure our platform is functional:
             <br/><br/>
             - <strong>Razorpay:</strong> Acts as our authorized payment gateway for handling subscription transactions (Monthly Pro, Yearly Pro). By completing a purchase, your transaction data is subject to Razorpay's independent Privacy Policy.<br/>
             - <strong>OpenAI / Associated AI APIs:</strong> For processing complex textual prompts via the AI Tutor. User queries are sent securely, but we strictly advise students against inputting sensitive personal identifiable information into the chat boxes.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">
             5. User Rights & Data Deletion
          </h2>
          <p className="mb-8">
             Depending on your jurisdiction, you maintain robust rights regarding your data:
             <br/><br/>
             - <strong>Right to Access:</strong> You can view all exam logs, purchase histories, and performance metrics directly in your Dashboard.<br/>
             - <strong>Right to Erasure:</strong> You can explicitly request the deletion of your account and associated personal data by emailing support. We will process these requests within 14 business days, resulting in permanent termination of your dashboard access.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">
             6. AI-Model Disclosure
          </h2>
          <p className="mb-8">
             The insights generated by our diagnostic engines are predictive. While our algorithms closely emulate NTA standards and historical percentile distributions, we do not guarantee a direct translation to official rank outcomes. The AI is a tool meant to supplement, not replace, formal academic counsel.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">
             7. Policy Modifications
          </h2>
          <p className="mb-8">
             AbhyasCore reserves the right to dynamically amend this Privacy Policy as our feature set expands (especially as we integrate deeper AI functions). Notice of substantial modifications will be broadcasted to your registered email address and updated here.
          </p>

          <div className="mt-12 bg-slate-50 p-6 rounded-2xl border border-slate-200/60">
             <h3 className="font-bold text-slate-900 mb-2">Contact The Privacy Team</h3>
             <p className="text-sm text-slate-600">
               If you have inquiries, concerns, or requests regarding this Privacy Policy, please email us directly at <strong>privacy@abhyascore.com</strong>.
             </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
