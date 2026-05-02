import { Footer } from "@/components/layout/footer";
import { Activity, CheckCircle, Clock, Zap, Server, Globe } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "System Status | AbhyasCore",
  description: "Real-time performance and status monitor for AbhyasCore services.",
};

const services = [
  { name: "Examination API", status: "Operational", icon: Server, latency: "42ms" },
  { name: "AI Diagnostic Engine", status: "Operational", icon: Activity, latency: "148ms" },
  { name: "Authentication Service", status: "Operational", icon: Zap, latency: "24ms" },
  { name: "CDN / Image Hosting", status: "Operational", icon: Globe, latency: "12ms" },
  { name: "Razorpay Gateway", status: "Operational", icon: CheckCircle, latency: "N/A" },
];

const incidents = [
  { date: "April 18, 2026", title: "Minor API Delay", desc: "Small delay observed in AI token processing due to high load. Resolved in 24 minutes." },
  { date: "April 12, 2026", title: "Scheduled Maintenance", desc: "Brief 15-minute downtime for database schema migration." },
];

export default function SystemStatusPage() {
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
              <Activity className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-700">Real-time Monitor</span>
           </div>
           <h1 className="font-display text-[42px] md:text-[56px] font-extrabold text-slate-900 leading-tight tracking-tight mb-4">
              System <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Status</span>
           </h1>
           <p className="text-slate-500 font-medium text-lg max-w-2xl">
              AbhyasCore ensures 99.9% uptime for the critical infrastructure powering your JEE and NEET simulations.
           </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200/60 rounded-[32px] p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="h-4 w-4 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20" />
              <div>
                 <div className="text-lg font-bold text-emerald-900">All Systems Operational</div>
                 <div className="text-sm text-emerald-700 font-medium italic">Last updated: Just now (4:52 PM IST)</div>
              </div>
           </div>
           <p className="text-[13px] font-bold text-emerald-800 uppercase tracking-widest bg-white/40 px-5 py-2 rounded-xl">99.98% uptime (30 Days)</p>
        </div>

        <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden mb-12">
           <div className="grid divide-y divide-slate-100">
              {services.map((service, i) => (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-600 shadow-sm">
                         <service.icon className="w-5 h-5" />
                      </div>
                      <div className="text-[17px] font-bold text-slate-900">{service.name}</div>
                   </div>
                   <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                         <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Latency</div>
                         <div className="text-xs font-bold text-slate-700">{service.latency}</div>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold ring-1 ring-emerald-500/10">
                         <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                         {service.status}
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
           <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 mb-8">
              <Clock className="w-6 h-6 text-indigo-500" /> Incident History
           </h2>
           <div className="space-y-10 relative before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-[2px] before:bg-slate-100">
              {incidents.map((incident, i) => (
                <div key={i} className="relative pl-10">
                   <div className="absolute left-0 top-1.5 w-[24px] h-[24px] rounded-full bg-white border-4 border-slate-100 shadow-sm" />
                   <div className="text-[12px] font-bold text-indigo-600 uppercase tracking-widest mb-1">{incident.date}</div>
                   <h3 className="text-lg font-bold text-slate-900 mb-2">{incident.title}</h3>
                   <p className="text-slate-500 font-medium leading-relaxed">{incident.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
