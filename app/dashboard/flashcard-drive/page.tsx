"use client";

import { useState, useCallback } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { flashcardDecks, allDecks } from "@/lib/flashcard-data";
import { Zap, RotateCcw, ChevronLeft, ChevronRight, Check, X, Layers, Sparkles } from "lucide-react";

export default function FlashcardDrivePage() {
  const [selectedDeck, setSelectedDeck] = useState(allDecks[0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [review, setReview] = useState<Set<string>>(new Set());

  const cards = flashcardDecks[selectedDeck] || [];
  const card = cards[currentIndex];
  const progress = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

  const handleFlip = useCallback(() => setIsFlipped(f => !f), []);

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex(i => Math.min(i + 1, cards.length - 1));
  }, [cards.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex(i => Math.max(i - 1, 0));
  }, []);

  const markKnown = useCallback(() => {
    if (!card) return;
    const next = new Set(known);
    next.add(card.id);
    review.delete(card.id);
    setKnown(next);
    setReview(new Set(review));
    handleNext();
  }, [card, known, review, handleNext]);

  const markReview = useCallback(() => {
    if (!card) return;
    const next = new Set(review);
    next.add(card.id);
    known.delete(card.id);
    setReview(next);
    setKnown(new Set(known));
    handleNext();
  }, [card, known, review, handleNext]);

  const resetDeck = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnown(new Set());
    setReview(new Set());
  };

  const changeDeck = (deck: string) => {
    setSelectedDeck(deck);
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnown(new Set());
    setReview(new Set());
  };

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
            <p className="text-slate-500">Rapid-fire recall for essential formulas, laws &amp; exceptions.</p>
          </div>
        </div>

        {/* Deck Selector */}
        <div className="flex gap-2 flex-wrap">
          {allDecks.map(deck => (
            <button
              key={deck}
              onClick={() => changeDeck(deck)}
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
        <div className="flex items-center gap-4">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[13px] font-bold text-slate-500 shrink-0">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-center">
            <div className="text-[20px] font-bold text-emerald-700">{known.size}</div>
            <div className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Known</div>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 text-center">
            <div className="text-[20px] font-bold text-amber-700">{review.size}</div>
            <div className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">Review</div>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
            <div className="text-[20px] font-bold text-slate-700">{cards.length - known.size - review.size}</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Unseen</div>
          </div>
        </div>

        {/* Flashcard */}
        {card ? (
          <div className="perspective-1000">
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
                } ${
                  known.has(card.id)
                    ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-white"
                    : review.has(card.id)
                    ? "border-amber-300 bg-gradient-to-br from-amber-50 to-white"
                    : "border-violet-200 bg-gradient-to-br from-violet-50 to-white"
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
                  {card.topic} • {card.subject}
                </div>
                <div className="text-[22px] md:text-[26px] font-bold text-slate-900 leading-tight mb-6">
                  {card.front}
                </div>
                <div className="flex items-center gap-2 text-[12px] font-bold text-violet-400">
                  <Sparkles className="w-3.5 h-3.5" /> Tap to reveal
                </div>
              </div>

              {/* Back */}
              <div
                className={`absolute inset-0 rounded-[28px] border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-8 flex flex-col justify-center items-center text-center transition-all duration-500 backface-hidden ${
                  isFlipped
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 pointer-events-none"
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 mb-4">
                  Answer
                </div>
                <pre className="text-[18px] md:text-[20px] font-mono font-bold text-slate-800 leading-relaxed whitespace-pre-wrap max-w-md">
                  {card.back}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-400 py-20">No cards in this deck.</div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={markReview}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-100 text-amber-700 font-bold text-[13px] hover:bg-amber-200 transition-all"
          >
            <X className="w-4 h-4" /> Need Review
          </button>

          <button
            onClick={markKnown}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-[13px] hover:bg-emerald-200 transition-all"
          >
            <Check className="w-4 h-4" /> Got It!
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === cards.length - 1}
            className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Reset */}
        <div className="flex justify-center">
          <button
            onClick={resetDeck}
            className="flex items-center gap-2 text-[12px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Deck
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}
