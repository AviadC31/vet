/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { FileUpload } from "@/components/ui/FileUpload";
import { Flashcard, type FlashcardData } from "@/components/ui/Flashcard";
import { calculateNextReview, type ReviewItem } from "@/lib/srs";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, Sparkles, AlertCircle } from "lucide-react";

// Extend FlashcardData to include SRS info
interface StudyCard extends FlashcardData {
  srs?: ReviewItem;
}

export default function Home() {
  const [appState, setAppState] = useState<"upload" | "processing" | "studying">("upload");
  const [deck, setDeck] = useState<StudyCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const savedDeck = localStorage.getItem("vet-flashcards-deck");
    const savedIndex = localStorage.getItem("vet-flashcards-index");
    
    if (savedDeck) {
      try {
        const parsedDeck = JSON.parse(savedDeck);
        if (Array.isArray(parsedDeck) && parsedDeck.length > 0) {
          setDeck(parsedDeck);
          setAppState("studying");
          
          if (savedIndex) {
             const idx = parseInt(savedIndex, 10);
             if (!isNaN(idx) && idx >= 0 && idx < parsedDeck.length) {
                setCurrentCardIndex(idx);
             }
          }
        }
      } catch (e) {
        console.error("Failed to parse saved deck", e);
      }
    }
  }, []);

  // Save to local storage whenever deck changes
  useEffect(() => {
    if (deck.length > 0) {
      localStorage.setItem("vet-flashcards-deck", JSON.stringify(deck));
    }
  }, [deck]);

  // Save index whenever it changes
  useEffect(() => {
     localStorage.setItem("vet-flashcards-index", currentCardIndex.toString());
  }, [currentCardIndex]);

  const handleFileSelect = async (file: File) => {
    setAppState("processing");
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/upload?t=${Date.now()}`, {
        method: "POST",
        body: formData,
        cache: "no-store",
      });

      if (!res.ok) throw new Error("נכשל עיבוד הקובץ");

      const data = await res.json();
      if (data.flashcards && data.flashcards.length > 0) {
        setDeck(data.flashcards);
        setAppState("studying");
        setCurrentCardIndex(0);
      } else {
        throw new Error("לא ניתן היה לייצר כרטיסיות מהקובץ הזה.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "משהו השתבש.");
      setAppState("upload");
    }
  };

  const handleRate = (rating: "hard" | "good" | "easy") => {
    console.log("Card rated:", rating);
    
    // 1. Calculate next review
    const currentCard = deck[currentCardIndex];
    if (!currentCard) return;

    const nextReview = calculateNextReview(rating, currentCard.srs as any); 

    // 2. Update card with new SRS data
    // We do this immutably
    const updatedDeck = deck.map((card, idx) => 
        idx === currentCardIndex ? { ...card, srs: nextReview } : card
    );
    
    setDeck(updatedDeck);

    // 3. Move to next card
    if (currentCardIndex < deck.length - 1) {
      console.log("Advancing to next card:", currentCardIndex + 1);
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      // End of deck
      alert("סיימת לעבור על כל הכרטיסיות! עבודה מעולה.");
      setCurrentCardIndex(0); 
    }
  };

  const resetDeck = () => {
    if (window.confirm("האם אתה בטוח שברצונך לאפס את ההתקדמות ולהתחיל מחדש?")) {
      localStorage.removeItem("vet-flashcards-deck");
      localStorage.removeItem("vet-flashcards-index");
      setDeck([]);
      setAppState("upload");
      setCurrentCardIndex(0);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans text-right" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 space-x-reverse cursor-pointer" onClick={() => setAppState("upload")}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Brain className="w-5 h-5" />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">
              VetMind AI
            </span>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            {appState === "studying" && (
              <div className="flex items-center space-x-4 space-x-reverse">
                 <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  כרטיסייה {currentCardIndex + 1} מתוך {deck.length}
                </div>
                <button 
                  onClick={resetDeck}
                  className="text-sm text-red-500 hover:text-red-600 transition-colors"
                >
                  אפס
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Background blobs for aesthetic */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[100px]" />
        </div>

        <AnimatePresence mode="wait">
          {appState === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-2xl mx-auto text-center space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight sm:text-6xl leading-tight">
                  ללמוד חכם יותר, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    לא קשה יותר.
                  </span>
                </h1>
                <p className="text-xl text-gray-600 max-w-xl mx-auto leading-relaxed">
                  העלה את הסיכומים שלך בווטרינריה ותן לבינה המלאכותית להפוך אותם לכרטיסיות זיכרון באופן מיידי.
                </p>
              </div>

              <div className="bg-white p-2 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                <FileUpload
                  onFileSelect={handleFileSelect}
                  isProcessing={false}
                />
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center space-x-2 space-x-reverse text-red-500 bg-red-50 px-4 py-3 rounded-xl border border-red-100"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{error}</span>
                </motion.div>
              )}
            </motion.div>
          )}

          {appState === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-6"
            >
              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-blue-600 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">
                  מנתח מסמך...
                </h3>
                <p className="text-gray-500 text-lg">
                  מחלץ מושגים ווטרינריים מרכזיים...
                </p>
              </div>
            </motion.div>
          )}

          {appState === "studying" && deck.length > 0 && (
            <motion.div
              key="studying"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-full max-w-lg mx-auto"
            >
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900">סשן לימוד</h2>
                    <p className="text-gray-500">נסה להיזכר בתשובה לפני ההיפוך</p>
                </div>
              <Flashcard
                key={deck[currentCardIndex].id} // Key ensures remount on card change for fresh state
                data={deck[currentCardIndex]}
                onRate={handleRate}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-400 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
        <p>&copy; 2026 VetMind AI. מעצימים את דור העתיד של הווטרינרים.</p>
      </footer>
    </main>
  );
}
