import { Footer } from "@/components/layout/footer";
import { CreditCard, History, Ban, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Refund and Cancellation Policy | AbhyasCore",
  description: "Guidelines detailing the refund logic and cancellation workflows for AbhyasCore Premium subscriptions.",
};

export default function RefundAndCancellationPage() {
  return (
    <div className="min-h-screen bg-[#fafafc] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Mini Header */}
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 lg:px-6 pointer-events-none">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between rounded-2xl border border-white/60 bg-white/40 px-5 py-3 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] pointer-events-auto">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="AbhyasCore Logo" className="h-[38px] w-auto object-contain" />
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
              <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-700">Billing Policies</span>
           </div>
           <h1 className="font-display text-[42px] md:text-[56px] font-extrabold text-slate-900 leading-tight tracking-tight mb-4">
              Refund & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Cancellation</span>
           </h1>
           <p className="text-slate-500 font-medium text-lg max-w-2xl">
              Last updated: April 19, 2026. Please review our specific policies concerning strictly digital goods, AI processing allocations, and subscription cancellations.
           </p>
        </div>

        <div className="prose prose-slate prose-lg max-w-none bg-white p-8 md:p-12 rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">
             <Ban className="w-6 h-6 text-indigo-500" /> 1. Nature of Digital Goods
          </h2>
          <p className="mb-8">
            AbhyasCore is a provider of entirely digital subscriptions encompassing mock examinations, real-time AI logic processing, and immediate data insight reports. Because the delivery of our computational goods happens instantaneously upon payment processing, retracting the utilized computational tokens or test exposures is technologically impossible.
          </p>

          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">
             <ShieldCheck className="w-6 h-6 text-indigo-500" /> 2. Strict Digital "No-Refund" Policy
          </h2>
          <p>
            Due to the architecture described above, <strong>all purchases made for Monthly Pro or Yearly Pro plans are absolutely final and non-refundable</strong> once a payment has successfully cleared and the premium features have unlocked on your dashboard.
          </p>
          <ul className="mb-8">
            <li>We do not offer pro-rated refunds for partially unused billing cycles.</li>
            <li>We do not issue refunds if you change your target examination mid-year or if your official exam dates are postponed by the government bodies (NTA/CBSE/etc.).</li>
            <li>If you fail to utilize the platform frequently, we cannot execute a refund based on inactivity. Your active subscription guarantees system availability for you at all times.</li>
          </ul>

          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">
             <History className="w-6 h-6 text-indigo-500" /> 3. Exceptions & Accidental Charges
          </h2>
          <p className="mb-8">
             We acknowledge that billing anomalies may rarely occur. The sole exceptions to our "No-Refund" policy exist if:
             <br/><br/>
             1. <strong>Double Deductions:</strong> If our payment gateway (Razorpay) erroneously deducts the identical subscription volume twice for the exact same billing cycle due to a network glitch. In such cases, the replica charge will be credited back.<br/>
             2. <strong>Immediate Rectification:</strong> If you accidentally purchase a Yearly plan instead of Monthly, you must reach out to our billing support precisely within <strong>12 hours</strong> of the transaction and zero premium mock examinations must have been started. We may, at our discretion, downgrade your tier and refund the proportional difference.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">
             4. Subscription Cancellation Procedure
          </h2>
          <p className="mb-8">
             You are not locked into any permanent contracts with AbhyasCore. You can seamlessly cancel the auto-renewal of your subscription logic inside your dashboard at any point before the next billing trigger.
             <br/><br/>
             <strong>Steps to cancel:</strong><br/>
             1. Log into your active AbhyasCore account.<br/>
             2. Navigate to the <strong>Settings & Billing</strong> panel.<br/>
             3. Click <strong>"Manage Subscription"</strong>.<br/>
             4. Select <strong>"Cancel Auto-Renewal"</strong>.<br/><br/>
             Once successfully halted, your account will retain its "Pro" status until the exact end moment of your previously paid billing cycle. Beyond that point, you will gracefully revert to our "Free Base Tier."
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">
             5. Failure of Service
          </h2>
          <p className="mb-8">
             In the devastatingly rare event that AbhyasCore suffers catastrophic prolonged server outages exceeding 72 continuous hours, causing members to be entirely unable to access critical practice material right before official exam dates, our executive team will assess the damage. Any compensatory action (such as extending billing cycle durations for free) will be communicated explicitly to impacted cohorts.
          </p>

          <div className="mt-12 bg-red-50 p-6 rounded-2xl border border-red-200/60">
             <h3 className="font-bold text-red-900 mb-2">Discharge Inquiries</h3>
             <p className="text-sm text-red-700/80">
               If you believe you belong to the rare exception categories (e.g. double transaction network flaw), explicitly provide your transaction ID directly to <strong>billing@abhyascore.com</strong>.
             </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
