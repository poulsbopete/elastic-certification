"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getDifficultyColor } from "@/lib/utils";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Flag,
  RotateCcw,
  Settings2,
  Star,
  Target,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QuizOption {
  id: string;
  text: string;
  sortOrder: number;
}

interface QuizQuestion {
  id: string;
  type: string;
  stem: string;
  difficulty: string;
  explanation: string;
  answerOptions: QuizOption[];
  topic: {
    name: string;
    domain: { name: string; cert: { name: string; color: string } };
  };
}

interface Props {
  certs: Array<{
    id: string;
    name: string;
    slug: string;
    icon: string;
    color: string;
    domains: Array<{ id: string; name: string }>;
  }>;
}

type QuizPhase = "config" | "active" | "review" | "results";

interface AnswerResult {
  isCorrect: boolean;
  correctOptionIds: string[];
  explanation: string;
}

const modeOptions = [
  { value: "practice", label: "Practice Mode", desc: "Untimed, see explanation after each question" },
  { value: "timed", label: "Timed Mode", desc: "Race the clock — 90 seconds per question" },
  { value: "domain", label: "Domain-Specific", desc: "Focus on one domain at a time" },
  { value: "weak_areas", label: "Weak Areas Only", desc: "Questions from your weakest domains" },
  { value: "mixed", label: "Mixed Mode", desc: "Random questions across all certifications" },
];

export function QuizClient({ certs }: Props) {
  const [phase, setPhase] = useState<QuizPhase>("config");
  const [mode, setMode] = useState("practice");
  const [selectedCertId, setSelectedCertId] = useState("");
  const [selectedDomainId, setSelectedDomainId] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
  const [results, setResults] = useState<Record<string, AnswerResult>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedCert = certs.find((c) => c.id === selectedCertId);
  const currentQuestion = questions[currentIndex];
  const currentResult = currentQuestion ? results[currentQuestion.id] : null;
  const isMultiSelect = currentQuestion?.type === "multiple_select";
  const showExplanation = !!currentResult;

  useEffect(() => {
    if (phase === "active" && mode === "timed" && timeLeft === null) {
      setTimeLeft(90);
    }
  }, [phase, mode]);

  useEffect(() => {
    if (phase === "active" && mode === "timed" && timeLeft !== null) {
      if (timeLeft <= 0) {
        handleSubmitAnswer();
        return;
      }
      timerRef.current = setInterval(() => setTimeLeft((t) => (t ?? 0) - 1), 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [timeLeft, phase, mode]);

  const startQuiz = async () => {
    const params = new URLSearchParams({
      mode,
      count: questionCount.toString(),
    });
    if (selectedCertId && mode !== "mixed" && mode !== "weak_areas") params.set("certId", selectedCertId);
    if (selectedDomainId && mode === "domain") params.set("domainId", selectedDomainId);

    const res = await fetch(`/api/quiz?${params}`);
    const data = await res.json();
    setQuestions(data.questions ?? []);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setResults({});
    setFlagged(new Set());
    setScore(0);
    setPhase("active");
    if (mode === "timed") setTimeLeft(90);
  };

  const toggleOption = (optionId: string) => {
    if (showExplanation) return;
    const qId = currentQuestion.id;
    const current = selectedAnswers[qId] ?? [];
    if (isMultiSelect) {
      setSelectedAnswers({
        ...selectedAnswers,
        [qId]: current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId],
      });
    } else {
      setSelectedAnswers({ ...selectedAnswers, [qId]: [optionId] });
    }
  };

  const handleSubmitAnswer = useCallback(async () => {
    if (!currentQuestion || isSubmitting) return;
    const selected = selectedAnswers[currentQuestion.id] ?? [];
    if (selected.length === 0 && mode !== "timed") return;

    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: currentQuestion.id,
        selectedOptionIds: selected,
      }),
    });
    const result = await res.json();
    setResults((prev) => ({ ...prev, [currentQuestion.id]: result }));
    if (result.isCorrect) setScore((s) => s + 1);
    setIsSubmitting(false);
  }, [currentQuestion, selectedAnswers, isSubmitting, mode]);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      if (mode === "timed") setTimeLeft(90);
    } else {
      setPhase("results");
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const selectedForCurrent = selectedAnswers[currentQuestion?.id ?? ""] ?? [];
  const domains = selectedCert?.domains ?? [];

  // Config screen
  if (phase === "config") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1">Quiz Engine</h1>
          <p className="text-slate-400 text-sm">Configure your study session</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              Quiz Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Mode */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Quiz Mode
              </label>
              <div className="grid grid-cols-1 gap-2">
                {modeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setMode(opt.value)}
                    className={`text-left p-3 rounded-lg border transition-all ${
                      mode === opt.value
                        ? "border-blue-500 bg-blue-500/10 text-blue-400"
                        : "border-slate-700 bg-slate-800/30 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    <div className="font-medium text-sm">{opt.label}</div>
                    <div className="text-xs opacity-70 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cert filter */}
            {mode !== "weak_areas" && mode !== "mixed" && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Certification (optional)
                </label>
                <Select value={selectedCertId} onValueChange={setSelectedCertId}>
                  <SelectTrigger>
                    <SelectValue placeholder="All certifications" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All certifications</SelectItem>
                    {certs.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Domain filter */}
            {mode === "domain" && selectedCert && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Domain
                </label>
                <Select value={selectedDomainId} onValueChange={setSelectedDomainId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {domains.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Question count */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Question Count
              </label>
              <div className="flex gap-2">
                {[5, 10, 15, 20, 30].map((n) => (
                  <button
                    key={n}
                    onClick={() => setQuestionCount(n)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      questionCount === n
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={startQuiz} size="lg" className="w-full">
              Start Quiz <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results screen
  if (phase === "results") {
    const accuracy = Math.round((score / questions.length) * 100);
    const passed = accuracy >= 70;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className={`border-2 ${passed ? "border-emerald-500/40" : "border-rose-500/40"}`}>
          <CardContent className="p-8 text-center">
            <div className={`text-6xl font-bold mb-2 ${passed ? "text-emerald-400" : "text-rose-400"}`}>
              {accuracy}%
            </div>
            <div className="text-lg font-semibold text-slate-200 mb-1">
              {score} / {questions.length} correct
            </div>
            <p className="text-slate-400 text-sm mb-6">
              {passed
                ? "Great job! You passed this quiz set."
                : "Keep practicing — focus on the missed questions."}
            </p>

            <div className="flex justify-center gap-3">
              <Button onClick={() => setPhase("review")} variant="outline">
                Review Answers
              </Button>
              <Button onClick={() => setPhase("config")}>
                <RotateCcw className="w-4 h-4" />
                New Quiz
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Per-question summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Question Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {questions.map((q, i) => {
                const r = results[q.id];
                return (
                  <button
                    key={q.id}
                    onClick={() => { setCurrentIndex(i); setPhase("review"); }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-800/50 text-left transition-colors"
                  >
                    <span className="text-xs text-slate-500 w-5">{i + 1}.</span>
                    {r?.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    )}
                    <span className="text-xs text-slate-400 flex-1 truncate">{q.stem.slice(0, 80)}...</span>
                    <Badge className={`text-xs ${getDifficultyColor(q.difficulty)}`}>
                      {q.difficulty}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active / Review quiz screen
  if (!currentQuestion) return null;

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-4">
        <span className="text-xs text-slate-500 tabular-nums">
          {currentIndex + 1} / {questions.length}
        </span>
        <Progress value={progress} className="flex-1 h-1.5" />
        {mode === "timed" && timeLeft !== null && (
          <span className={`text-sm font-mono font-medium tabular-nums flex items-center gap-1 ${timeLeft < 20 ? "text-rose-400" : "text-slate-400"}`}>
            <Clock className="w-3.5 h-3.5" />
            {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}
          </span>
        )}
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs text-slate-400">{score}</span>
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              {/* Meta */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {currentQuestion.topic.domain.cert.name.split(" ").slice(-1)[0]}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {currentQuestion.topic.domain.name}
                </Badge>
                <Badge className={`text-xs ${getDifficultyColor(currentQuestion.difficulty)}`}>
                  {currentQuestion.difficulty}
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">
                  {currentQuestion.type.replace("_", " ")}
                </Badge>
                {isMultiSelect && (
                  <Badge variant="warning" className="text-xs">Select all that apply</Badge>
                )}
                <button
                  onClick={() => setFlagged((f) => {
                    const next = new Set(f);
                    next.has(currentQuestion.id) ? next.delete(currentQuestion.id) : next.add(currentQuestion.id);
                    return next;
                  })}
                  className="ml-auto"
                >
                  <Flag className={`w-4 h-4 ${flagged.has(currentQuestion.id) ? "text-amber-400 fill-amber-400" : "text-slate-600"}`} />
                </button>
              </div>

              {/* Stem */}
              <p className="text-base text-slate-100 leading-relaxed mb-6">{currentQuestion.stem}</p>

              {/* Options */}
              <div className="space-y-2">
                {currentQuestion.answerOptions.map((option) => {
                  const isSelected = selectedForCurrent.includes(option.id);
                  const isCorrect = currentResult?.correctOptionIds.includes(option.id);
                  const isWrong = showExplanation && isSelected && !isCorrect;
                  const isMissed = showExplanation && !isSelected && isCorrect;

                  let optClass = "border-slate-700 bg-slate-800/30 text-slate-300 hover:border-slate-600 hover:bg-slate-800/60";
                  if (isSelected && !showExplanation) optClass = "border-blue-500 bg-blue-500/10 text-blue-300";
                  if (showExplanation && isCorrect) optClass = "border-emerald-500 bg-emerald-500/10 text-emerald-300";
                  if (isWrong) optClass = "border-rose-500 bg-rose-500/10 text-rose-300";
                  if (isMissed) optClass = "border-emerald-500/50 bg-emerald-500/5 text-emerald-400/70";

                  return (
                    <button
                      key={option.id}
                      onClick={() => toggleOption(option.id)}
                      disabled={showExplanation}
                      className={`w-full text-left flex items-start gap-3 p-3.5 rounded-xl border transition-all ${optClass}`}
                    >
                      <span className="w-6 h-6 rounded-lg border border-current flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                        {String.fromCharCode(65 + option.sortOrder)}
                      </span>
                      <span className="text-sm leading-relaxed">{option.text}</span>
                      {showExplanation && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 ml-auto flex-shrink-0 mt-0.5" />
                      )}
                      {isWrong && <XCircle className="w-4 h-4 ml-auto flex-shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-4 rounded-xl border ${
                    currentResult.isCorrect
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-rose-500/30 bg-rose-500/5"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {currentResult.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`text-xs font-semibold mb-1 ${currentResult.isCorrect ? "text-emerald-400" : "text-rose-400"}`}>
                        {currentResult.isCorrect ? "Correct!" : "Incorrect"}
                      </p>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {currentResult.explanation}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handlePrev} disabled={currentIndex === 0}>
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {!showExplanation ? (
            <Button
              onClick={handleSubmitAnswer}
              disabled={selectedForCurrent.length === 0 || isSubmitting}
            >
              {isSubmitting ? "Checking..." : "Submit Answer"}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              {currentIndex < questions.length - 1 ? "Next Question" : "See Results"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Question map */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {questions.map((q, i) => {
          const r = results[q.id];
          let cls = "w-7 h-7 rounded text-xs font-medium transition-all ";
          if (i === currentIndex) cls += "bg-blue-600 text-white";
          else if (r?.isCorrect) cls += "bg-emerald-600/30 text-emerald-400";
          else if (r && !r.isCorrect) cls += "bg-rose-600/30 text-rose-400";
          else if (flagged.has(q.id)) cls += "bg-amber-600/20 text-amber-400";
          else cls += "bg-slate-800 text-slate-500";

          return (
            <button key={q.id} onClick={() => setCurrentIndex(i)} className={cls}>
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
