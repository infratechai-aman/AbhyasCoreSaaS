"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  BarChart3,
  Clock3,
  Sparkles,
  Target,
  Trophy,
  Zap,
  BookOpen,
  Shield,
  Star,
  CheckCircle2,
  Check,
  Play,
} from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { pricing } from "@/lib/data";

/* ─── theme tokens ─── */
const homeTheme = {
  "--bg": "#fafafc",
  "--text": "#0f172a",
} as CSSProperties;

/* ─── data ─── */
const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Exams", href: "#exams" },
  { label: "Pricing", href: "#pricing" },
];

const stats = [
  { value: "50K+", label: "Active Students" },
  { value: "2M+", label: "Tests Taken" },
  { value: "98%", label: "Satisfaction" },
  { value: "4.9★", label: "App Rating" },
];

const howItWorks = [
  {
    step: "01",
    title: "Choose Your Exam",
    description: "Select from JEE Mains, Advanced, or NEET patterns. Each template mirrors the official format precisely.",
    icon: Target,
  },
  {
    step: "02",
    title: "Take AI-Powered Mocks",
    description: "Full-length tests with real exam timing, negative marking, and difficulty scaling.",
    icon: BrainCircuit,
  },
  {
    step: "03",
    title: "Instant AI Analysis",
    description: "Speed drops, chapter weakness, and personalized drills surfaced immediately.",
    icon: BarChart3,
  },
  {
    step: "04",
    title: "Track & Improve",
    description: "Weekly trends, rank prediction, and revision loops to push your score higher.",
    icon: Trophy,
  },
];

const examBadges = [
  { label: "JEE Mains" },
  { label: "JEE Advanced" },
  { label: "NEET UG" },
  { label: "BITSAT" },
  { label: "State CET" },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "JEE Advanced — AIR 847",
    text: "AbhyasCore's AI analytics helped me identify weak chapters I didn't even know about. My physics score jumped 40 marks.",
    avatar: "PS",
  },
  {
    name: "Arjun Patel",
    role: "NEET UG — 680/720",
    text: "The exam simulations are incredibly realistic. When I sat for my actual exam, it felt familiar because of the exact UI pattern.",
    avatar: "AP",
  },
  {
    name: "Sneha Reddy",
    role: "JEE Mains — 99.4 percentile",
    text: "The revision mode and AI tutor changed my entire preparation strategy. Genuinely the best platform.",
    avatar: "SR",
  },
];

/* ─── framer animation variants ─── */
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

/* ─── header ─── */
function HomeHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 lg:px-6">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto flex max-w-[1400px] items-center justify-between rounded-2xl border border-white/60 bg-white/40 px-5 py-3 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]"
      >
        {/* logo */}
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="AbhyasCore Logo" className="h-28 w-auto object-contain" />
        </Link>

        {/* nav */}
        <nav className="hidden items-center gap-8 text-[13px] font-bold text-slate-500 lg:flex uppercase tracking-wider">
          {navLinks.map((l) => (
            <Link key={l.label} href={l.href} className="transition-all hover:text-indigo-600 hover:-translate-y-0.5">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* cta */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="hidden text-[13px] font-bold text-slate-500 transition-colors hover:text-indigo-600 uppercase tracking-wider sm:inline">
            Log In
          </Link>
          <Link href="/dashboard">
            <button className="rounded-xl bg-slate-900 px-5 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-indigo-600 hover:shadow-indigo-600/30 hover:scale-[1.03] uppercase tracking-wide">
              Premium Portal
            </button>
          </Link>
        </div>
      </motion.div>
    </header>
  );
}

/* ─── page ─── */
export default function HomePage() {
  return (
    <div style={homeTheme} className="min-h-screen bg-[var(--bg)] text-slate-900 selection:bg-indigo-100 font-sans">
      <HomeHeader />

      <main className="overflow-hidden">
        {/* ═══════════════════ HERO ═══════════════════ */}
        <section className="relative w-full pt-36 pb-16 lg:pt-40 lg:pb-24 mix-blend-multiply bg-[#fafafc]">
          {/* Subtle parallax grid pattern */}
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 1 }}
             className="absolute inset-0"
             style={{ 
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(99,102,241,0.05) 1px, transparent 0)',
                backgroundSize: '32px 32px' 
             }}
          />

          <div className="relative z-10 mx-auto flex max-w-[1400px] flex-col justify-center px-4 lg:flex-row lg:items-center lg:gap-16 lg:px-8">
            {/* left */}
            <motion.div 
               initial="hidden"
               animate="visible"
               variants={staggerContainer}
               className="max-w-[680px] flex-1 relative z-20"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2.5 rounded-full border border-indigo-200/50 bg-indigo-50/50 backdrop-blur-md px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-700">
                  AI Mock Testing Engine v3.0
                </span>
              </motion.div>

              <motion.h1 variants={fadeInUp} className="mt-8 font-display text-[46px] font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-[60px] lg:text-[76px]">
                Crack{" "}
                <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
                  JEE & NEET
                </span>
                <br />with AI-Powered{" "}
                <span className="text-slate-900">Mocks</span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="mt-6 max-w-xl text-[17px] leading-relaxed text-slate-500 font-medium">
                Exam-real simulations, intelligent AI analytics, rank prediction, and personalized revision loops — built meticulously for serious aspirants.
              </motion.p>

              <motion.div variants={fadeInUp} className="mt-8 md:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full">
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto flex justify-center items-center gap-2.5 rounded-[16px] bg-slate-900 px-6 sm:px-8 py-3.5 sm:py-4 text-[14px] sm:text-[15px] font-bold text-white shadow-xl shadow-slate-900/20 transition-all hover:bg-indigo-600 hover:shadow-indigo-600/30 hover:-translate-y-0.5">
                    Start Learning Free
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </Link>
                <Link href="#how-it-works" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto flex justify-center items-center gap-3 rounded-[16px] border border-slate-200/80 bg-white/60 backdrop-blur-md px-6 sm:px-8 py-3.5 sm:py-4 text-[14px] sm:text-[15px] font-bold text-slate-700 shadow-sm transition-all hover:bg-white hover:border-slate-300">
                    <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-indigo-50 text-indigo-600">
                        <Play className="h-3 sm:h-3.5 w-3 sm:w-3.5 fill-current" />
                    </div>
                    See Demo
                  </button>
                </Link>
              </motion.div>
            </motion.div>

            {/* right — floating product mockup with glassmorphism */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.8, delay: 0.2 }}
               className="relative mt-16 flex-1 lg:mt-0"
            >
              <div className="relative mx-auto w-full max-w-[540px]">
                {/* Glow behind */}
                <div className="absolute -inset-10 rounded-[40px] bg-[radial-gradient(circle,rgba(99,102,241,0.15),transparent_60%)] blur-3xl mix-blend-multiply" />

                <motion.div 
                   animate={{ y: [-8, 8, -8] }}
                   transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                   className="relative overflow-hidden rounded-[32px] border border-white/60 bg-white/40 backdrop-blur-2xl shadow-[0_30px_100px_rgba(31,38,135,0.12)] p-2"
                >
                  <div className="rounded-[28px] border border-slate-200/50 bg-white/90 overflow-hidden shadow-sm">
                    {/* Top bar */}
                    <div className="flex items-center gap-2 border-b border-slate-100/80 px-5 py-4 bg-slate-50/50 backdrop-blur-md">
                      <div className="flex gap-1.5">
                        <div className="h-3 w-3 rounded-full bg-red-400" />
                        <div className="h-3 w-3 rounded-full bg-amber-400" />
                        <div className="h-3 w-3 rounded-full bg-emerald-400" />
                      </div>
                      <div className="mx-auto flex rounded-md bg-white border border-slate-100 px-4 py-1 text-[10px] font-bold tracking-widest text-slate-400 shadow-sm">
                        APP.ABHYASCORE.AI
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-7">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500 mb-1">Live Test Instance</div>
                          <div className="font-display text-xl font-bold text-slate-900">JEE Advanced 2026 Mock</div>
                        </div>
                        <div className="animate-pulse rounded-full bg-red-50 text-red-600 px-3 py-1 flex items-center gap-1.5">
                           <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                           <span className="text-[10px] font-bold tracking-widest uppercase">Live</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
                         {[
                           { l: "Time", v: "02:34", accent: "text-slate-900" },
                           { l: "Questions", v: "54/90", accent: "text-indigo-600" },
                           { l: "Est. Rank", v: "2.4k", accent: "text-emerald-600" },
                         ].map(x => (
                           <div key={x.l} className="bg-slate-50 border border-slate-100/60 rounded-xl p-2 sm:p-3 text-center shadow-sm">
                             <div className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400 truncate">{x.l}</div>
                             <div className={`mt-1 font-display text-[13px] sm:text-[15px] font-bold ${x.accent} truncate`}>{x.v}</div>
                           </div>
                         ))}
                      </div>

                      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-[#fafafc] to-white p-5 shadow-inner">
                         <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-400 mb-3 flex items-center gap-1.5">
                           <Sparkles className="w-3 h-3" /> AI Insight Generated
                         </div>
                         <p className="text-[13px] font-medium leading-relaxed text-slate-600">
                           Noticeable accuracy drop observed after Q45. Your pacing suggests fatigue in physical chemistry. Recommend triggering an <span className="text-indigo-600 font-bold">Endurance Drill</span> before the next full mock.
                         </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating parallax elements */}
                <motion.div 
                   animate={{ y: [15, -15, 15] }}
                   transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                   className="absolute -right-12 bottom-20 z-30 w-[180px] rounded-2xl border border-white/60 bg-white/70 p-4 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] hidden lg:block"
                >
                   <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-100 flex items-center justify-center">
                         <Trophy className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                         <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Predicted</div>
                         <div className="text-[15px] font-bold text-slate-900 mt-0.5">AIR 1,120</div>
                      </div>
                   </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════ STATS REDESIGN ═══════════════════ */}
        <section className="relative z-20 -mt-8 px-4 lg:px-8 max-w-[1400px] mx-auto">
           <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-[24px] border border-white/80 bg-white/60 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] grid grid-cols-2 md:grid-cols-4 overflow-hidden"
           >
              {stats.map((stat, i) => (
                <div key={stat.label} className={`p-6 text-center hover:bg-white/40 transition-colors ${i % 2 !== 0 ? 'border-l border-slate-200/50' : ''} ${i >= 2 ? 'border-t border-slate-200/50' : ''} md:border-t-0 md:border-l ${i === 0 ? 'md:border-l-0' : ''}`}>
                  <div className="font-display text-[24px] md:text-[28px] font-bold text-slate-900">{stat.value}</div>
                  <div className="mt-1 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{stat.label}</div>
                </div>
              ))}
           </motion.div>
        </section>

        {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
        <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            id="how-it-works" 
            className="px-4 py-20 lg:px-8"
        >
          <div className="mx-auto max-w-[1400px]">
             {/* Header */}
             <motion.div variants={fadeInUp} className="mx-auto max-w-3xl text-center">
               <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
                 <Zap className="h-3 w-3" />
                 Workflow
               </div>
               <h2 className="mt-5 font-display text-[32px] font-bold leading-tight text-slate-900 lg:text-[48px]">
                 4 Steps to <span className="text-indigo-600">Mastery</span>
               </h2>
             </motion.div>

             <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {howItWorks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.div variants={fadeInUp} key={item.step} className="group h-full">
                      <div className="h-full rounded-3xl border border-slate-200/60 bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(79,70,229,0.08)] hover:border-indigo-100">
                         <div className="flex items-center justify-between mb-5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                               <Icon className="h-5 w-5" />
                            </div>
                            <span className="text-[24px] font-display font-bold text-slate-100 transition-colors group-hover:text-indigo-100">{item.step}</span>
                         </div>
                         <h3 className="font-display text-[18px] font-bold text-slate-900">{item.title}</h3>
                         <p className="mt-3 text-[14px] leading-relaxed text-slate-500 font-medium">{item.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
             </div>
          </div>
        </motion.section>

        {/* ═══════════════════ EXAMS PARALLAX BANNER ═══════════════════ */}
        <section id="exams" className="relative px-4 py-16 overflow-hidden">
           <div className="absolute inset-0 bg-slate-900">
               <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
           </div>
           
           <div className="relative z-10 mx-auto max-w-[1400px] text-center">
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400 mb-6">
                 Supporting All Major Formats
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                 {examBadges.map((badge, i) => (
                   <motion.div
                     initial={{ opacity: 0, scale: 0.9 }}
                     whileInView={{ opacity: 1, scale: 1 }}
                     viewport={{ once: true }}
                     transition={{ delay: i * 0.1 }}
                     key={badge.label}
                     className="rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3 text-[13px] font-bold text-slate-200 backdrop-blur-md hover:bg-slate-700 transition-colors cursor-default"
                   >
                     {badge.label}
                   </motion.div>
                 ))}
              </div>
           </div>
        </section>

        {/* ═══════════════════ FEATURES / UI MOCKUPS ═══════════════════ */}
        <motion.section 
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, margin: "-100px" }}
           variants={staggerContainer}
           id="features" 
           className="px-4 py-20 lg:py-28 lg:px-8 bg-[#fafafc]"
        >
           <div className="mx-auto max-w-[1400px]">
             <div className="grid gap-16 lg:grid-cols-[1fr_1fr] items-center">
                {/* Left Text */}
                <motion.div variants={fadeInUp}>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                    <Shield className="h-3 w-3" />
                    Premium Engine
                  </div>
                  <h2 className="mt-6 font-display text-[36px] font-bold leading-tight text-slate-900 lg:text-[52px]">
                    Serious tech for <br/>
                    <span className="text-indigo-600">serious students.</span>
                  </h2>
                  <p className="mt-6 text-[16px] leading-relaxed text-slate-600 font-medium max-w-[480px]">
                    Don't guess where you stand. Our engine accurately maps your mocks against historical percentiles and isolates granular weaknesses down to the chapter.
                  </p>

                  <div className="mt-8 grid gap-4">
                     {[
                       { title: "Exam-Real Interface", desc: "Identical NTA console layout so you never panic on D-Day." },
                       { title: "Granular Analytics", desc: "Time-per-question, accuracy by difficulty, and section flow maps." },
                       { title: "Adaptive Revisions", desc: "Auto-generated mini drills using questions you previously guessed or dropped." }
                     ].map((feat) => (
                        <div key={feat.title} className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-200/60 shadow-sm transition-all hover:border-indigo-200 group">
                           <div className="mt-1 h-2 w-2 rounded-full bg-indigo-400 group-hover:scale-150 transition-transform" />
                           <div>
                              <div className="text-[14px] font-bold text-slate-900 mb-1">{feat.title}</div>
                              <div className="text-[13px] text-slate-500 font-medium">{feat.desc}</div>
                           </div>
                        </div>
                     ))}
                  </div>
                </motion.div>

                {/* Right Glass Panels */}
                <motion.div variants={fadeInUp} className="relative h-[600px] w-full hidden md:block">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/20 blur-[80px] rounded-full mix-blend-multiply" />
                   
                   {/* Main big dashboard */}
                   <motion.div 
                      whileHover={{ y: -5 }}
                      className="absolute top-0 right-4 w-[480px] h-[340px] rounded-[24px] border border-white/80 bg-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-xl overflow-hidden z-20"
                   >
                     <img src="/assets/main_dashboard.png" alt="UI" className="w-full h-full object-cover object-top opacity-95" />
                   </motion.div>

                   {/* Secondary chart overlapping */}
                   <motion.div 
                      whileHover={{ y: -5 }}
                      initial={{ y: 20 }}
                      whileInView={{ y: 0 }}
                      viewport={{ once: true }}
                      className="absolute bottom-10 left-0 w-[340px] h-[300px] rounded-[24px] border border-white/80 bg-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-2xl overflow-hidden z-30"
                   >
                     <img src="/assets/analytics_chart.png" alt="Analytics" className="w-full h-full object-cover object-left opacity-95" />
                   </motion.div>
                </motion.div>
             </div>
           </div>
        </motion.section>

        {/* ═══════════════════ PRICING SECTION ═══════════════════ */}
        <section id="pricing" className="px-4 py-20 lg:py-28 bg-white">
           <div className="mx-auto max-w-[1400px]">
              <div className="text-center max-w-2xl mx-auto mb-16">
                 <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-700">
                    <Zap className="h-3 w-3" />
                    Premium plans
                 </div>
                 <h2 className="mt-5 font-display text-[36px] font-bold leading-tight text-slate-900 lg:text-[48px]">
                   Simple pricing for <span className="text-indigo-600">serious rankers.</span>
                 </h2>
              </div>

              <div className="grid gap-8 lg:grid-cols-3 max-w-[1200px] mx-auto">
                 {pricing.map((plan, index) => (
                    <motion.div 
                       key={plan.name}
                       initial={{ opacity: 0, y: 30 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       viewport={{ once: true }}
                       transition={{ delay: index * 0.1 }}
                       className={`relative overflow-hidden rounded-[32px] p-[1px] ${
                         index === 1
                           ? "bg-[linear-gradient(135deg,#7c3aed,#4f46e5,#22d3ee)] shadow-[0_20px_60px_rgba(99,102,241,0.15)]"
                           : index === 2
                           ? "bg-[linear-gradient(135deg,#f59e0b,#d97706,#f97316)] shadow-[0_20px_60px_rgba(245,158,11,0.15)]"
                           : "bg-[linear-gradient(180deg,#e2e8f0,#cbd5e1)] shadow-sm"
                       }`}
                    >
                       <div className={`flex flex-col h-full rounded-[31px] p-8 ${
                         index === 1
                           ? "bg-[linear-gradient(180deg,#0e1433,#171d42)] text-white"
                           : index === 2
                           ? "bg-[linear-gradient(180deg,#1c1008,#2d1a00)] text-white"
                           : "bg-white text-slate-950"
                       }`}>
                          <div>
                             {index === 2 && (
                               <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 text-amber-400 px-3 py-1 text-[10px] font-bold uppercase tracking-widest mb-3">
                                 ⚡ One-Time · No Auto-Renewal
                               </div>
                             )}
                             {index === 1 && (
                               <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 text-indigo-300 px-3 py-1 text-[10px] font-bold uppercase tracking-widest mb-3">
                                 ★ Most Popular
                               </div>
                             )}
                             <div className={`text-[12px] font-bold uppercase tracking-[0.2em] ${
                               index === 1 ? "text-indigo-300" : index === 2 ? "text-amber-400" : "text-indigo-600"
                             }`}>{plan.name}</div>
                             <div className="mt-4 font-display text-[46px] font-bold tracking-tight">{plan.price}</div>
                             <p className={`mt-4 text-[14px] leading-relaxed font-medium ${
                               index === 1 ? "text-indigo-100/78" : index === 2 ? "text-amber-100/70" : "text-slate-500"
                             }`}>{plan.description}</p>
                          </div>
                          
                          <div className="mt-8 space-y-4 mb-10 flex-1">
                             {plan.features.map((feature) => (
                               <div key={feature} className="flex items-start gap-3 text-[14px] font-medium leading-relaxed">
                                  <div className={`mt-0.5 rounded-full p-1 shrink-0 ${
                                    index === 1
                                      ? "bg-indigo-500/20 text-indigo-200"
                                      : index === 2
                                      ? "bg-amber-500/20 text-amber-300"
                                      : "bg-indigo-50 text-indigo-600"
                                  }`}>
                                    <Check className="h-3 w-3" />
                                  </div>
                                  <span>{feature}</span>
                               </div>
                             ))}
                          </div>

                          <div className="mt-auto">
                             <Link href="/dashboard" className="block w-full">
                                <button className={`w-full py-3.5 rounded-2xl text-[14px] font-bold transition-all ${
                                   index === 1
                                     ? "bg-white text-slate-900 hover:bg-indigo-50 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:scale-[1.02]"
                                     : index === 2
                                     ? "bg-amber-500 text-white hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:scale-[1.02]"
                                     : "bg-[linear-gradient(135deg,#7c3aed,#4f46e5)] text-white hover:shadow-[0_10px_20px_rgba(99,102,241,0.2)] hover:scale-[1.02]"
                                }`}>
                                   {plan.cta}
                                </button>
                             </Link>
                          </div>
                       </div>
                    </motion.div>
                 ))}
              </div>

           </div>
        </section>

        {/* ═══════════════════ TESTIMONIALS ═══════════════════ */}
        <section className="px-4 py-20 lg:py-24 bg-white border-y border-slate-200">
           <div className="mx-auto max-w-[1400px]">
              <div className="text-center max-w-2xl mx-auto mb-16">
                 <h2 className="font-display text-[32px] font-bold text-slate-900">Trusted by top rankers</h2>
                 <p className="mt-3 text-[15px] text-slate-500 font-medium">Don't take our word for it. Here's what actual crack aspirants have to say about AbhyasCore.</p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                 {testimonials.map((t, i) => (
                   <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="p-8 rounded-[24px] border border-slate-200/60 bg-slate-50/50 shadow-sm"
                   >
                      <div className="flex gap-1 mb-5">
                         {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                      </div>
                      <p className="text-[15px] leading-relaxed text-slate-700 font-medium mb-8">"{t.text}"</p>
                      <div className="flex items-center gap-3 border-t border-slate-200/80 pt-5">
                         <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-800 to-slate-900 flex items-center justify-center text-[12px] font-bold text-white shadow-md">
                           {t.avatar}
                         </div>
                         <div>
                           <div className="text-[13px] font-bold text-slate-900 leading-none mb-1">{t.name}</div>
                           <div className="text-[11px] font-bold tracking-wider uppercase text-slate-500">{t.role}</div>
                         </div>
                      </div>
                   </motion.div>
                 ))}
              </div>
           </div>
        </section>

        {/* ═══════════════════ FINAL CTA CTA ═══════════════════ */}
        <section className="px-4 py-20 lg:py-24 bg-[#fafafc]">
           <div className="mx-auto max-w-[1200px]">
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 className="relative overflow-hidden rounded-[40px] bg-slate-900 px-8 py-16 text-center text-white shadow-2xl"
              >
                 <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay"></div>
                 <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500 rounded-full blur-[100px] opacity-40 mix-blend-screen -z-10" />
                 <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500 rounded-full blur-[100px] opacity-20 mix-blend-screen -z-10" />

                 <div className="relative z-10 max-w-2xl mx-auto">
                    <h2 className="font-display text-[40px] font-bold leading-tight lg:text-[56px] tracking-tight">
                       Secure your <span className="text-indigo-400">target rank</span> today.
                    </h2>
                    <p className="mt-5 text-[16px] leading-relaxed text-slate-300 font-medium max-w-xl mx-auto">
                       Stop guessing. Let AI pinpoint exactly what's holding your score back and train you to fix it.
                    </p>
                    
                    <div className="mt-10 flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4">
                       <Link href="/dashboard" className="w-full sm:w-auto">
                          <button className="w-full justify-center rounded-2xl bg-white px-8 py-3.5 text-[14px] sm:text-[15px] font-bold text-slate-900 shadow-xl transition-all hover:scale-[1.03] hover:bg-slate-50">
                             Get Started for Free
                          </button>
                       </Link>
                       <Link href="#pricing" className="w-full sm:w-auto">
                          <button className="w-full justify-center rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md px-8 py-3.5 text-[14px] sm:text-[15px] font-bold text-white transition-all hover:bg-white/10 hover:border-white/30">
                             Compare Plans
                          </button>
                       </Link>
                    </div>
                 </div>
              </motion.div>
           </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
