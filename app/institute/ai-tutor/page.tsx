"use client";

import { BrainCircuit, MessageSquare, BookOpen, Send, Sparkles, Zap, ShieldAlert, Fingerprint, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAITutorHistory, saveAITutorChat } from "@/lib/firebase-service";
import { useAuth } from "@/lib/auth-context";
import { authenticatedFetch } from "@/lib/api";

export default function InstituteAITutorPage() {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [query, setQuery] = useState("");
  const [generating, setGenerating] = useState(false);
  const endOfChatRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  useEffect(() => {
     if (user?.uid) {
       getAITutorHistory(user.uid).then(res => setChatHistory(res));
     }
  }, [user?.uid]);

  useEffect(() => {
     endOfChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, generating]);

  const handleSend = async (text: string) => {
     if (!text.trim() || generating) return;
     const userMsg = { role: "user", content: text };
     const history = [...messages];
     setMessages(prev => [...prev, userMsg]);
     setQuery("");
     setGenerating(true);

     let accumulated = "";
     try {
       const res = await authenticatedFetch("/api/ai/tutor", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           question: text,
           history: history.slice(-10),
         })
       });

       if (!res.ok) {
         setMessages(prev => [...prev, { role: "assistant", content: "Error: Could not reach AI server. Did you set OPENAI_API_KEY?" }]);
         setGenerating(false);
         return;
       }

       setMessages(prev => [...prev, { role: "assistant", content: "" }]);

       const reader = res.body?.getReader();
       const decoder = new TextDecoder();
       accumulated = "";

       if (reader) {
         while (true) {
           const { done, value } = await reader.read();
           if (done) break;

           const text = decoder.decode(value, { stream: true });
           const lines = text.split("\n").filter(line => line.startsWith("data: "));

           for (const line of lines) {
             const payload = line.slice(6);
             if (payload === "[DONE]") break;

             try {
               const token = JSON.parse(payload);
               accumulated += token;
               const snapshot = accumulated;
               setMessages(prev => {
                 const updated = [...prev];
                 updated[updated.length - 1] = { role: "assistant", content: snapshot };
                 return updated;
               });
             } catch {
               // Skip malformed chunks
             }
           }
         }
       }
     } catch (e) {
       setMessages(prev => [...prev, { role: "assistant", content: "Network error occurred." }]);
     } finally {
       setGenerating(false);
       if (user?.uid && accumulated.trim()) {
          saveAITutorChat(user.uid, text.substring(0, 30) + "...", [...history, userMsg, { role: "assistant", content: accumulated }])
            .then(() => {
               getAITutorHistory(user.uid).then(res => setChatHistory(res));
            });
       }
     }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-70px)] md:h-[calc(100vh-72px)] bg-[#fafafc] p-3 md:p-8 overflow-hidden">
      
      <div className="mb-4 md:mb-8 max-w-2xl shrink-0 hidden sm:block">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-[10px] font-bold tracking-[0.2em] uppercase mb-4 shadow-sm">
           <Fingerprint className="w-3.5 h-3.5" /> Institute AI Copilot
        </div>
        <h2 className="text-[24px] md:text-[32px] font-display font-bold text-slate-900 tracking-tight leading-none mb-3">AI Tutor</h2>
        <p className="text-slate-500 text-[13px] md:text-[14px]">
          Your personal 24/7 teaching assistant. Generate custom questions, ask for lesson plans, or get detailed explanations for doubts to share with your students.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4 md:gap-8 flex-1 min-h-0">
        
        {/* Main Chat Area */}
        <div className="bg-white rounded-[24px] md:rounded-[32px] border border-slate-200/60 p-1.5 md:p-2 shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-col h-full overflow-hidden">
           
           {/* Chat Header */}
           <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/50 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                 <div className="relative">
                   <div className="absolute inset-0 bg-indigo-500 rounded-full blur-[8px] opacity-40 animate-pulse" />
                   <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center relative shadow-md">
                      <BrainCircuit className="w-5 h-5" />
                   </div>
                 </div>
                 <div>
                    <h3 className="font-bold text-slate-900 leading-tight">AbhyasCore Engine</h3>
                    <span className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                       <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Online
                    </span>
                 </div>
              </div>
              <div className="hidden sm:flex gap-2">
                 <span className="px-3 py-1 bg-slate-50 border border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider rounded-lg">Model: OpenAI</span>
              </div>
           </div>
           
           {/* Chat Canvas */}
           <div className="flex-1 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-50 via-white to-white p-6 flex flex-col relative overflow-y-auto custom-scrollbar">
               <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
               
               {messages.length === 0 ? (
                 <div className="flex flex-col items-center justify-center text-center h-full my-auto z-10 w-full relative">
                     <div className="w-16 h-16 bg-white border border-slate-200 shadow-xl shadow-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 transform -rotate-6 hover:rotate-0 transition-transform">
                        <MessageSquare className="w-8 h-8" />
                     </div>
                     <h4 className="font-display text-[18px] font-bold text-slate-900 mb-2">How can I assist your teaching today?</h4>
                     <p className="text-[13px] text-slate-500 font-medium max-w-sm mb-8">
                        Generate questions, get step-by-step solutions for your students, or analyze study patterns.
                     </p>
                     
                      <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto px-4">
                        {[
                          "🧬 Generate 5 advanced Biology questions on Genetics",
                          "🧠 Create a 4-week study plan for JEE Mains",
                          "🚀 Explain the nuances of Quantum Mechanics for 12th graders",
                          "🔥 How do I explain Organic Chemistry mechanisms simply?"
                        ].map(pill => (
                           <button key={pill} onClick={() => handleSend(pill)} className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-[12px] font-semibold hover:border-indigo-400 hover:text-indigo-600 shadow-sm transition-all hover:-translate-y-0.5">
                              {pill}
                           </button>
                        ))}
                      </div>
                 </div>
               ) : (
                 <div className="z-10 w-full max-w-3xl mx-auto flex flex-col gap-6 py-4">
                    {messages.map((m, i) => (
                      <div key={i} className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                         <div className={`p-4 rounded-2xl max-w-[85%] text-[13px] leading-relaxed shadow-sm ${
                           m.role === "user" 
                             ? "bg-indigo-600 text-white rounded-br-none" 
                             : "bg-white border border-slate-200 text-slate-700 rounded-bl-none prose prose-sm max-w-none"
                         }`}>
                           {m.role === "user" ? (
                             m.content
                           ) : m.content === "" ? (
                             <div className="flex items-center gap-2">
                               <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                               <span className="text-slate-400">Thinking...</span>
                             </div>
                           ) : (
                             <div className="relative">
                               <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                 {m.content}
                               </ReactMarkdown>
                               {generating && i === messages.length - 1 && (
                                 <span className="inline-block w-2 h-4 bg-indigo-500 rounded-sm ml-0.5 animate-pulse align-middle" />
                               )}
                             </div>
                           )}
                         </div>
                      </div>
                    ))}
                    <div ref={endOfChatRef} />
                 </div>
               )}
           </div>
           
           {/* Input Area */}
           <div className="p-4 bg-white border-t border-slate-100 relative z-10">
              <div className="relative flex items-center">
                 <div className="absolute left-4 text-slate-400"><Sparkles className="w-4 h-4" /></div>
                 <input 
                   type="text" 
                   value={query}
                   onChange={(e) => setQuery(e.target.value)}
                   onKeyDown={(e) => e.key === "Enter" && handleSend(query)}
                   placeholder="Ask your AI Teaching Assistant..." 
                   className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-16 text-[14px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 shadow-inner disabled:opacity-50" 
                   disabled={generating}
                 />
                 <button 
                    onClick={() => handleSend(query)}
                    disabled={generating} 
                    className="absolute right-2 w-10 h-10 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl flex items-center justify-center transition-colors shadow-md disabled:opacity-50">
                    <Send className="w-4 h-4 ml-0.5" />
                 </button>
              </div>
           </div>
        </div>
        
        {/* Right Sidebar Data Panel */}
        <div className="hidden lg:flex flex-col gap-6">
        
          <div className="relative bg-slate-900 rounded-[28px] p-6 text-white overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 p-8 opacity-20">
                <Zap className="w-32 h-32 text-indigo-500" />
             </div>
             
             <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-300 mb-6 backdrop-blur-md">
                   Recommended Actions
                </div>
                <h3 className="font-display text-[24px] font-bold mb-3 leading-tight">Batch Analysis <br/> <span className="text-indigo-400">Insights</span></h3>
                <p className="text-[13px] text-slate-300 leading-relaxed mb-6">
                   Your students have been struggling with rotational mechanics. Use the AI tutor to generate a custom worksheet with simplified concepts and increasing difficulty.
                </p>
             </div>
          </div>
          
          <div className="bg-white rounded-[28px] border border-slate-200/60 p-6 shadow-sm flex-1 flex flex-col min-h-0">
             <h3 className="text-[14px] font-bold text-slate-900 mb-5 flex items-center justify-between shrink-0">
               Chat History <span onClick={() => { setMessages([]); setChatHistory([]); }} className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hover:text-red-500 cursor-pointer transition-colors">Clear All</span>
             </h3>
             
             <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {chatHistory.length > 0 ? chatHistory.map((t, i) => (
                  <div key={i} className="group flex gap-3.5 items-center p-3.5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-sm cursor-pointer transition-all shrink-0">
                     <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors shrink-0">
                        <BookOpen className="w-4 h-4 text-indigo-500" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-bold text-slate-700 group-hover:text-slate-900 leading-tight mb-1 truncate">{t.title}</div>
                        <div className="text-[10px] font-medium text-slate-400">
                           {t.timestamp?.seconds ? new Date(t.timestamp.seconds * 1000).toLocaleDateString() : "Just now"}
                        </div>
                     </div>
                  </div>
                )) : (
                   <div className="text-center py-6 text-slate-400 text-[12px] font-medium">No chat history yet.</div>
                )}
             </div>
             
          </div>
          
        </div>
      </div>
    </div>
  );
}
