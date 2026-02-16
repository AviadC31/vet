
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface FlashcardData {
  id: string;
  question: string;
  answer: string;
  nextReview?: number;
}

interface FlashcardProps {
  data: FlashcardData;
  onRate: (rating: "hard" | "good" | "easy") => void;
}

export function Flashcard({ data, onRate }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // We rely on the parent changing the `key` prop to reset this state
  // when moving to the next card.
  
  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  return (
    <div className="w-full max-w-md mx-auto aspect-[3/4] perspective-1000">
      <div
        className={cn(
          "relative w-full h-full transition-all duration-500 transform-style-3d cursor-pointer",
          isFlipped ? "rotate-y-180" : ""
        )}
        onClick={handleFlip}
      >
        {/* Front */}
        <div className="absolute inset-0 w-full h-full bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center p-8 backface-hidden border border-gray-100">
          <span className="absolute top-6 right-6 text-xs font-semibold text-blue-500 uppercase tracking-wider">
            שאלה
          </span>
          <p className="text-2xl font-medium text-gray-900 text-center leading-relaxed">
            {data.question}
          </p>
          <p className="absolute bottom-6 text-sm text-gray-400 animate-pulse">
            לחץ לחשיפת התשובה
          </p>
        </div>

        {/* Back */}
        <div className="absolute inset-0 w-full h-full bg-slate-900 rounded-2xl shadow-xl flex flex-col items-center justify-center p-8 backface-hidden rotate-y-180 border border-slate-800">
          <span className="absolute top-6 right-6 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            תשובה
          </span>
          <div className="flex-1 flex items-center justify-center w-full">
            <p className="text-xl text-white text-center leading-relaxed">
              {data.answer}
            </p>
          </div>

          {/* User Controls */}
          <div className="w-full grid grid-cols-3 gap-3 mt-auto pt-6 border-t border-slate-800">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRate("hard");
              }}
              className="px-4 py-2 text-sm font-medium text-red-400 bg-red-400/10 rounded-lg hover:bg-red-400/20 transition-colors"
            >
              קשה
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRate("good");
              }}
              className="px-4 py-2 text-sm font-medium text-blue-400 bg-blue-400/10 rounded-lg hover:bg-blue-400/20 transition-colors"
            >
              טוב
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRate("easy");
              }}
              className="px-4 py-2 text-sm font-medium text-green-400 bg-green-400/10 rounded-lg hover:bg-green-400/20 transition-colors"
            >
              קל
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
