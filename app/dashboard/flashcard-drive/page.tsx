"use client";

import { useState, useCallback, useEffect } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { flashcardDecks, allDecks, Flashcard } from "@/lib/flashcard-data";
import { Zap, RotateCcw, Check, X, Sparkles, Trophy, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

// Helper to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function FlashcardDrivePage() {
  const { userData } = useAuth();
  const targetExam = userData?.targetExam || "JEE";
  
  const visibleDecks = allDecks.filter(deck => {
    if (targetExam === "JEE" && deck.includes("Biology")) return false;
    if (targetExam === "NEET" && deck.includes("Mathematics")) return false;
    return true;
  });

  const [selectedDeck, setSelectedDeck] = useState(visibleDecks[0] || allDecks[0]);
  
  useEffect(() => {
    if (!visibleDecks.includes(selectedDeck) && visibleDecks.length > 0) {
      setSelectedDeck(visibleDecks[0]);
    }
  }, [visibleDecks, selectedDeck]);
  
  // Game State
  const [activeQueue, setActiveQueue] = useState<Flashcard[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [totalInitial, setTotalInitial] = useState(0);

  // Initialize or reset deck
  const initDeck = useCallback((deckName: string) => {
    const cards = flashcardDecks[deckName] || [];
    const shuffled = shuffleArray(cards).slice(0, 20);
    setActiveQueue(shuffled);
    setTotalInitial(shuffled.length);
    setKnownCount(0);
    setReviewCount(0);
    setIsFlipped(false);
  }, []);

  useEffect(() => {
    initDeck(selectedDeck);
  }, [selectedDeck, initDeck]);

  const card = activeQueue[0];
  const isComplete = activeQueue.length === 0 && totalInitial > 0;
  const progress = totalInitial > 0 ? (knownCount / totalInitial) * 100 : 0;

  const handleFlip = useCallback(() => setIsFlipped(f => !f), []);

  const markKnown = useCallback(() => {
    setIsFlipped(false);
    // Remove the current card from the front of the queue
    setActiveQueue(prev => prev.slice(1));
    setKnownCount(k => k + 1);
  }, []);

  const markReview = useCallback(() => {
    setIsFlipped(false);
    // Moving the missed card to the back of the line so it repeats later!
    setActiveQueue(prev => {
      if (prev.length <= 1) return prev; // If it's the last card, just keep it there to repeat
      const current = prev[0];
      const rest = prev.slice(1);
      return [...rest, current];
    });
    setReviewCount(r => r + 1);
  }, []);

  return (
    <DashboardShell>
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
            <Zap className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <h1 className="text-[28px] font-display font-bold text-slate-900">Flashcard Formula Drive</h1>
            <p className="text-slate-500">Spaced Mastery Loop: Missed cards will repeat until you learn them.</p>
          </div>
        </div>

        {/* Deck Selector */}
        <div className="flex gap-2 flex-wrap">
          {visibleDecks.map(deck => (
            <button
              key={deck}
              onClick={() => setSelectedDeck(deck)}
              className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${
                selectedDeck === deck
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {deck}
            </button>
          ))}
        </div>

        {/* Progress Bar */}
        {!isComplete && (
          <div className="flex items-center gap-4">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[13px] font-bold text-slate-500 shrink-0">
              {knownCount} / {totalInitial} Mastered
            </span>
          </div>
        )}

        {/* Stats Row */}
        {!isComplete && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-center">
              <div className="text-[20px] font-bold text-emerald-700">{knownCount}</div>
              <div className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Mastered</div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 text-center">
              <div className="text-[20px] font-bold text-amber-700">{reviewCount}</div>
              <div className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">Mistakes</div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
              <div className="text-[20px] font-bold text-slate-700">{activeQueue.length}</div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">In Queue</div>
            </div>
          </div>
        )}

        {/* Game Area */}
        {isComplete ? (
          <div className="py-20 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full mx-auto flex items-center justify-center shadow-2xl shadow-emerald-500/30 mb-8">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-[32px] font-display font-bold text-slate-900 mb-2">Deck Mastered!</h2>
            <p className="text-slate-500 max-w-sm mx-auto mb-8">
              Incredible work. You successfully mapped all {totalInitial} formulas to your long-term memory.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => initDeck(selectedDeck)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-[14px] hover:bg-slate-200 transition-all"
              >
                <RotateCcw className="w-4 h-4" /> Go Again
              </button>
            </div>
          </div>
        ) : card ? (
          <div className="perspective-1000">
            {/* The Flashcard */}
            <div
              onClick={handleFlip}
              className="relative w-full min-h-[320px] cursor-pointer group"
            >
              {/* Front */}
              <div
                className={`absolute inset-0 rounded-[28px] border-2 p-8 flex flex-col justify-center items-center text-center transition-all duration-500 backface-hidden ${
                  isFlipped
                    ? "opacity-0 scale-95 pointer-events-none"
                    : "opacity-100 scale-100"
                } border-violet-200 bg-gradient-to-br from-violet-50 to-white hover:border-violet-300 hover:shadow-xl hover:shadow-violet-500/10`}
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-500 mb-4 bg-violet-100 px-3 py-1 rounded-full">
                  {card.topic}
                </div>
                <div className="text-[22px] md:text-[28px] font-display font-bold text-slate-900 leading-tight mb-6">
                  {card.front}
                </div>
                <div className="flex items-center gap-2 text-[12px] font-bold text-violet-400">
                  <Sparkles className="w-3.5 h-3.5" /> Tap to reveal answer
                </div>
              </div>

              {/* Back */}
              <div
                className={`absolute inset-0 rounded-[28px] border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-8 flex flex-col justify-center items-center text-center transition-all duration-500 backface-hidden shadow-xl shadow-indigo-500/10 ${
                  isFlipped
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 pointer-events-none"
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 mb-4">
                  Correct Answer
                </div>
                <pre className="text-[18px] md:text-[22px] font-mono font-bold text-slate-800 leading-relaxed whitespace-pre-wrap max-w-md">
                  {card.back}
                </pre>
              </div>
            </div>
            
            {/* Action Buttons (Only show when flipped) */}
            <div className={`flex items-center justify-center gap-4 mt-8 transition-all duration-300 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              <button
                onClick={(e) => { e.stopPropagation(); markReview(); }}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-amber-100 text-amber-700 font-bold text-[15px] hover:bg-amber-200 hover:-translate-y-1 transition-all"
              >
                <X className="w-5 h-5" /> Need Review
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); markKnown(); }}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 text-white font-bold text-[15px] hover:bg-emerald-600 hover:-translate-y-1 shadow-lg shadow-emerald-500/30 transition-all"
              >
                <Check className="w-5 h-5" /> Got It!
              </button>
            </div>

            {/* Tap instruction fallback */}
            <div className={`text-center mt-8 text-[13px] font-bold text-slate-400 transition-all duration-300 ${isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              Tap the card to view the formula
            </div>
          </div>
        ) : null}

        {/* Global Reset */}
        {!isComplete && (
          <div className="flex justify-center pt-8 border-t border-slate-100">
            <button
              onClick={() => initDeck(selectedDeck)}
              className="flex items-center gap-2 text-[12px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Restart Deck From Beginning
            </button>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
