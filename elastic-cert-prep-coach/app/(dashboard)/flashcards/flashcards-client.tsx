"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BookOpen,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  RefreshCw,
  RotateCcw,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FlashcardData {
  id: string;
  front: string;
  back: string;
  hint?: string | null;
  topic: {
    name: string;
    domain: { name: string; cert: { name: string; icon: string; color: string } };
  };
  reviews: Array<{ rating: string; nextReview: Date }>;
}

interface Props {
  data: {
    certs: Array<{ id: string; name: string; icon: string; slug: string }>;
    flashcards: FlashcardData[];
    dueCards: FlashcardData[];
    userId: string;
  };
}

const ratingConfig = [
  { value: "again", label: "Again", desc: "< 1 day", color: "bg-rose-600 hover:bg-rose-500", textColor: "text-rose-400" },
  { value: "hard", label: "Hard", desc: "< 3 days", color: "bg-orange-600 hover:bg-orange-500", textColor: "text-orange-400" },
  { value: "good", label: "Good", desc: "~5 days", color: "bg-blue-600 hover:bg-blue-500", textColor: "text-blue-400" },
  { value: "easy", label: "Easy", desc: "> 7 days", color: "bg-emerald-600 hover:bg-emerald-500", textColor: "text-emerald-400" },
];

export function FlashcardsClient({ data }: Props) {
  const { flashcards, dueCards } = data;
  const [mode, setMode] = useState<"browse" | "review" | "cram">("browse");
  const [deckCards, setDeckCards] = useState<FlashcardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [filterCertId, setFilterCertId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const startReview = (cards: FlashcardData[]) => {
    setDeckCards(cards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setCompleted([]);
    setMode("review");
  };

  const currentCard = deckCards[currentIndex];
  const progress = deckCards.length > 0 ? Math.round((completed.length / deckCards.length) * 100) : 0;

  const handleRating = async (rating: string) => {
    if (!currentCard || submitting) return;
    setSubmitting(true);

    await fetch("/api/flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: currentCard.id, rating }),
    });

    setCompleted([...completed, currentCard.id]);
    setSubmitting(false);

    if (currentIndex < deckCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setShowHint(false);
    } else {
      setMode("browse");
    }
  };

  const filteredCards = filterCertId
    ? flashcards.filter((c) => {
        const cert = data.certs.find((cert) => cert.id === filterCertId);
        return cert && c.topic.domain.cert.name === cert.name;
      })
    : flashcards;

  // Group by cert/domain for browse mode
  const groupedByCert: Record<string, { cert: FlashcardData["topic"]["domain"]["cert"]; cards: FlashcardData[] }> = {};
  filteredCards.forEach((card) => {
    const certName = card.topic.domain.cert.name;
    if (!groupedByCert[certName]) {
      groupedByCert[certName] = { cert: card.topic.domain.cert, cards: [] };
    }
    groupedByCert[certName].cards.push(card);
  });

  if (mode === "review" && currentCard) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Progress */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setMode("browse")}>
            <ChevronLeft className="w-4 h-4" />
            Exit
          </Button>
          <Progress value={progress} className="flex-1 h-1.5" />
          <span className="text-xs text-slate-500 tabular-nums">
            {currentIndex + 1} / {deckCards.length}
          </span>
        </div>

        {/* Card */}
        <div className="perspective-1000">
          <motion.div
            className="relative cursor-pointer"
            onClick={() => { if (!isFlipped) setIsFlipped(true); }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isFlipped ? "back" : "front"}
                initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Card className={`min-h-64 flex flex-col ${
                  isFlipped
                    ? "border-blue-500/40 bg-gradient-to-br from-blue-500/5 to-transparent"
                    : "hover:border-slate-700"
                }`}>
                  <CardContent className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <span className="text-xs text-slate-500 uppercase tracking-wider mb-4">
                      {isFlipped ? "Answer" : "Question"}
                    </span>
                    <p className="text-lg text-slate-100 leading-relaxed whitespace-pre-line">
                      {isFlipped ? currentCard.back : currentCard.front}
                    </p>
                    {!isFlipped && (
                      <p className="text-xs text-slate-600 mt-6">Click to reveal answer</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>{currentCard.topic.domain.cert.name}</span>
          <span>{currentCard.topic.domain.name}</span>
          {currentCard.hint && !isFlipped && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowHint(!showHint); }}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300"
            >
              <Lightbulb className="w-3 h-3" />
              {showHint ? currentCard.hint : "Show hint"}
            </button>
          )}
        </div>

        {/* Rating buttons */}
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-4 gap-2"
          >
            {ratingConfig.map((r) => (
              <button
                key={r.value}
                onClick={() => handleRating(r.value)}
                disabled={submitting}
                className={`${r.color} text-white rounded-xl p-3 text-center transition-all disabled:opacity-50`}
              >
                <div className="font-semibold text-sm">{r.label}</div>
                <div className="text-xs opacity-80">{r.desc}</div>
              </button>
            ))}
          </motion.div>
        )}

        {!isFlipped && (
          <div className="text-center">
            <Button onClick={() => setIsFlipped(true)} variant="outline">
              Show Answer
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Flashcards</h1>
          <p className="text-sm text-slate-400">
            {dueCards.length > 0
              ? `${dueCards.length} cards due for review`
              : "All cards up to date 🎉"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {dueCards.length > 0 && (
            <Button onClick={() => startReview(dueCards)} className="gap-2">
              <Zap className="w-4 h-4" />
              Review Due ({dueCards.length})
            </Button>
          )}
          <Button onClick={() => startReview([...flashcards].sort(() => Math.random() - 0.5))} variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Cram All
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={filterCertId} onValueChange={setFilterCertId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="All certifications" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All certifications</SelectItem>
            {data.certs.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="decks">
        <TabsList>
          <TabsTrigger value="decks">By Certification</TabsTrigger>
          <TabsTrigger value="due">Due Now ({dueCards.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="decks" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(groupedByCert).map(([certName, { cert, cards }]) => (
            <Card key={certName} className="hover:border-slate-700 transition-all">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: `${cert.color}18` }}
                  >
                    {cert.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-200">{certName}</p>
                    <p className="text-xs text-slate-500">{cards.length} flashcards</p>
                  </div>
                </div>
                <Button
                  onClick={() => startReview(cards)}
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Study Deck
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="due">
          {dueCards.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCheck className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <p className="text-slate-400">No cards due right now — great work!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {dueCards.slice(0, 20).map((card) => (
                <Card key={card.id} className="hover:border-slate-700 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-slate-300 line-clamp-2">{card.front}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-600">
                          <span>{card.topic.domain.cert.name.split(" ").slice(-1)}</span>
                          <span>·</span>
                          <span>{card.topic.domain.name}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {dueCards.length > 20 && (
                <p className="text-xs text-slate-500 text-center">+{dueCards.length - 20} more cards due</p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
