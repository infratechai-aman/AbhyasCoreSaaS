import { Footer } from "@/components/layout/footer";
import { BookOpen, Calendar, User, Clock } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Blog | AbhyasCore",
  description: "Exam strategy, AI tech updates, and study tips from the AbhyasCore team.",
};

const posts = [
  {
    title: "Mastering Inorganic Chemistry with AI Drills",
    excerpt: "How our new endurance drills help students memorize complex periodic table trends 3x faster than traditional reading.",
    category: "Strategy",
    author: "Dr. Ananya P.",
    date: "April 18, 2026",
    readTime: "6 min read"
  },
  {
    title: "The NTA Factor: Why Simulator Layout Matters",
    excerpt: "Analyzing how familiarity with the exam interface can reduce 'd-day anxiety' and save you up to 15 minutes of time.",
    category: "Insights",
    author: "Rahul Verma",
    date: "April 14, 2026",
    readTime: "4 min read"
  },
  {
    title: "Behind the Scenes: How our AI Predicts AIR",
    excerpt: "Deep dive into our statistical models that map mock scores to historical JEE and NEET rank distributions.",
    category: "Tech",
    author: "Siddharth K.",
    date: "April 10, 2026",
    readTime: "10 min read"
  }
];

export default function BlogPage() {
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
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-700">Learning Lab</span>
           </div>
           <h1 className="font-display text-[42px] md:text-[56px] font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
              Insights & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Updates</span>
           </h1>
           <p className="text-slate-500 font-medium text-xl leading-relaxed max-w-3xl">
              Stay updated with the latest in AI-edtech, exam strategies, and platform features designed to boost your percentile.
           </p>
        </div>

        <div className="grid gap-8">
           {posts.map((post, i) => (
             <article key={i} className="group bg-white rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col md:flex-row hover:border-indigo-200 transition-colors">
                <div className="md:w-1/3 bg-slate-100 flex items-center justify-center p-8 group-hover:bg-indigo-50 transition-colors">
                   <div className="w-20 h-20 rounded-full border-4 border-white bg-white shadow-xl flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-indigo-600" />
                   </div>
                </div>
                <div className="md:w-2/3 p-8 md:p-10 flex flex-col justify-center">
                   <div className="flex items-center gap-4 mb-4">
                      <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-widest">{post.category}</span>
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                         <Calendar className="w-3 h-3" />
                         {post.date}
                      </div>
                   </div>
                   <h2 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">{post.title}</h2>
                   <p className="text-slate-500 font-medium leading-relaxed mb-6">
                      {post.excerpt}
                   </p>
                   <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white">
                            {post.author[0]}
                         </div>
                         <span className="text-sm font-bold text-slate-700">{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                         <Clock className="w-3 h-3" />
                         {post.readTime}
                      </div>
                   </div>
                </div>
             </article>
           ))}
        </div>

        <div className="mt-16 text-center">
           <button className="px-8 py-4 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-white hover:border-indigo-600 hover:text-indigo-600 transition-all">
              Load More Articles
           </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
