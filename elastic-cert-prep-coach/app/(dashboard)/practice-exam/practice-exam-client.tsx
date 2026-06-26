"use client";

import { useState, useEffect, useRef } from "react";
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
  Shield,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  data: {
    certs: Array<{
      id: string;
      name: string;
      shortName: string;
      icon: string;
      color: string;
      examDuration: number;
      passingScore: number;
      questionCount: number;
    }>;
    recentAttempts: Array<{
      id: string;
      score: number;
      passed: boolean;
      timeTakenMins: number;
      totalQuestions: number;
      correctAnswers: number;
      startedAt: Date;
      exam: { cert: { name: string; shortName: string } };
    }>;
    certQuestionCounts: Record<string, number>;
  };
}

interface Question {
  id: string;
  type: string;
  stem: string;
  difficulty: string;
  explanation: string;
  answerOptions: Array<{ id: string; text: string; sortOrder: number }>;
  topic: { name: string; domain: { name: string; cert: { name: string } } };
}

type ExamPhase = "config" | "active" | "results";

interface AnswerResult {
  isCorrect: boolean;
  correctOptionIds: string[];
  explanation: string;
}

export function PracticeExamClient({ data }: Props) {
  const { certs, recentAttempts } = data;
  const [phase, setPhase] = useState<ExamPhase>("config");
  const [selectedCertId, setSelectedCertId] = useState("");
  const [questionCount, setQuestionCount] = useState(30);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Record<string, AnswerResult>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedCert = certs.find((c) => c.id === selectedCertId);
  const currentQuestion = questions[currentIndex];
  const isMultiSelect = currentQuestion?.type === "multiple_select";
  const selectedForCurrent = selectedAnswers[currentQuestion?.id ?? ""] ?? [];
  const currentResult = currentQuestion && reviewMode ? results[currentQuestion.id] : null;

  useEffect(() => {
    if (phase === "active") {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            submitExam();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const startExam = async () => {
    const params = new URLSearchParams({
      mode: "practice",
      count: questionCount.toString(),
      ...(selectedCertId && { certId: selectedCertId }),
    });
    const res = await fetch(`/api/quiz?${params}`);
    const d = await res.json();
    setQuestions(d.questions ?? []);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setFlagged(new Set());
    setResults({});
    setScore(0);
    setReviewMode(false);
    const duration = selectedCert?.examDuration ?? questionCount * 2;
    setTimeLeft(duration * 60);
    setPhase("active");
  };

  const submitExam = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsSubmitting(true);

    let correct = 0;
    const allResults: Record<string, AnswerResult> = {};

    for (const q of questions) {
      const selected = selectedAnswers[q.id] ?? [];
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: q.id, selectedOptionIds: selected }),
      });
      const result = await res.json();
      allResults[q.id] = result;
      if (result.isCorrect) correct++;
    }

    const finalScore = Math.round((correct / questions.length) * 100);
    setScore(finalScore);
    setResults(allResults);
    setIsSubmitting(false);
    setPhase("results");
  };

  const toggleOption = (optionId: string) => {
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

  const toggleFlag = () => {
    setFlagged((f) => {
      const next = new Set(f);
      next.has(currentQuestion.id) ? next.delete(currentQuestion.id) : next.add(currentQuestion.id);
      return next;
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const correctCount = Object.values(results).filter((r) => r.isCorrect).length;
  const passThreshold = selectedCert?.passingScore ?? 70;

  // Config
  if (phase === "config") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Practice Exam Simulator</h1>
          <p className="text-sm text-slate-400">Full exam experience with timer and scoring</p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Certification
              </label>
              <Select value={selectedCertId} onValueChange={setSelectedCertId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select certification" />
                </SelectTrigger>
                <SelectContent>
                  {certs.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCert && (
              <div className="p-4 rounded-xl bg-slate-800/30 space-y-2">
                <p className="text-xs text-slate-500 font-medium">Exam Parameters</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-base font-bold text-slate-200">{selectedCert.examDuration}m</div>
                    <div className="text-xs text-slate-500">Duration</div>
                  </div>
                  <div>
                    <div className="text-base font-bold text-slate-200">{selectedCert.questionCount}</div>
                    <div className="text-xs text-slate-500">Questions (official)</div>
                  </div>
                  <div>
                    <div className="text-base font-bold text-slate-200">{selectedCert.passingScore}%</div>
                    <div className="text-xs text-slate-500">Passing score</div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Question Count (custom)
              </label>
              <div className="flex gap-2">
                {[10, 20, 30, 40, 60].map((n) => (
                  <button
                    key={n}
                    onClick={() => setQuestionCount(n)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex-1 ${
                      questionCount === n ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={startExam} size="lg" className="w-full" disabled={!selectedCertId}>
              <Shield className="w-4 h-4" />
              Start Exam Simulation
            </Button>
          </CardContent>
        </Card>

        {recentAttempts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Attempts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentAttempts.slice(0, 5).map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                  <div>
                    <p className="text-xs font-medium text-slate-300">
                      {attempt.exam.cert.shortName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(attempt.startedAt).toLocaleDateString()} · {attempt.timeTakenMins}m · {attempt.correctAnswers}/{attempt.totalQuestions}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-base font-bold ${attempt.passed ? "text-emerald-400" : "text-rose-400"}`}>
                      {Math.round(attempt.score)}%
                    </span>
                    <Badge variant={attempt.passed ? "success" : "destructive"} className="block text-xs mt-0.5">
                      {attempt.passed ? "PASS" : "FAIL"}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Results
  if (phase === "results") {
    const passed = score >= passThreshold;
    const domainBreakdown: Record<string, { correct: number; total: number }> = {};
    questions.forEach((q) => {
      const domain = q.topic.domain.name;
      if (!domainBreakdown[domain]) domainBreakdown[domain] = { correct: 0, total: 0 };
      domainBreakdown[domain].total++;
      if (results[q.id]?.isCorrect) domainBreakdown[domain].correct++;
    });

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className={`border-2 ${passed ? "border-emerald-500/40" : "border-rose-500/40"}`}>
          <CardContent className="p-8 text-center">
            <div className={`text-6xl font-bold mb-2 ${passed ? "text-emerald-400" : "text-rose-400"}`}>
              {score}%
            </div>
            <Badge variant={passed ? "success" : "destructive"} className="text-sm px-4 py-1 mb-3">
              {passed ? "PASSED" : "FAILED"}
            </Badge>
            <p className="text-slate-400 text-sm mb-2">
              {correctCount} / {questions.length} correct · Pass threshold: {passThreshold}%
            </p>
            <p className="text-slate-500 text-xs">
              {passed
                ? "Excellent! You're on track for exam day."
                : `You need ${passThreshold - score}% more to pass. Focus on weak domains below.`}
            </p>

            <div className="flex justify-center gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => { setReviewMode(true); setCurrentIndex(0); setPhase("active"); }}
              >
                Review Answers
              </Button>
              <Button onClick={() => setPhase("config")}>
                <RotateCcw className="w-4 h-4" />
                New Exam
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Domain Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(domainBreakdown).map(([domain, { correct, total }]) => {
              const pct = Math.round((correct / total) * 100);
              return (
                <div key={domain}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{domain}</span>
                    <span className={pct < passThreshold ? "text-rose-400" : "text-emerald-400"}>
                      {correct}/{total} ({pct}%)
                    </span>
                  </div>
                  <Progress
                    value={pct}
                    className="h-1.5"
                    indicatorClassName={pct < passThreshold ? "bg-rose-500" : "bg-emerald-500"}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Incorrect Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {questions
                .filter((q) => !results[q.id]?.isCorrect)
                .map((q, i) => (
                  <div key={q.id} className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20">
                    <p className="text-xs font-medium text-rose-400 mb-1">{q.topic.domain.name}</p>
                    <p className="text-sm text-slate-300 mb-2">{q.stem}</p>
                    <p className="text-xs text-slate-400">{results[q.id]?.explanation}</p>
                  </div>
                ))}
              {questions.filter((q) => !results[q.id]?.isCorrect).length === 0 && (
                <p className="text-sm text-emerald-400 text-center py-4">Perfect score — no incorrect answers! 🎉</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active exam
  if (!currentQuestion) return null;
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(selectedAnswers).filter((id) => selectedAnswers[id].length > 0).length;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Exam header */}
      <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${timeLeft < 300 ? "text-rose-400" : "text-slate-400"}`} />
          <span className={`text-sm font-mono font-bold tabular-nums ${timeLeft < 300 ? "text-rose-400" : "text-slate-300"}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
        <Progress value={progress} className="flex-1 h-1.5" />
        <span className="text-xs text-slate-500">
          {answeredCount}/{questions.length} answered
        </span>
        {!reviewMode && (
          <Button
            size="sm"
            variant="outline"
            onClick={submitExam}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Scoring..." : "Submit Exam"}
          </Button>
        )}
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.15 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Badge variant="secondary" className="text-xs">{currentQuestion.topic.domain.name}</Badge>
                <Badge className={`text-xs ${getDifficultyColor(currentQuestion.difficulty)}`}>
                  {currentQuestion.difficulty}
                </Badge>
                {isMultiSelect && <Badge variant="warning" className="text-xs">Select all that apply</Badge>}
                <button onClick={toggleFlag} className="ml-auto">
                  <Flag className={`w-4 h-4 ${flagged.has(currentQuestion.id) ? "text-amber-400 fill-amber-400" : "text-slate-600"}`} />
                </button>
              </div>

              <p className="text-base text-slate-100 leading-relaxed mb-6">{currentQuestion.stem}</p>

              <div className="space-y-2">
                {currentQuestion.answerOptions.map((option) => {
                  const isSelected = selectedForCurrent.includes(option.id);
                  const isCorrect = currentResult?.correctOptionIds.includes(option.id);
                  const isWrong = reviewMode && isSelected && !isCorrect;

                  let cls = "border-slate-700 bg-slate-800/30 text-slate-300 hover:border-slate-600 hover:bg-slate-800/60";
                  if (isSelected && !reviewMode) cls = "border-blue-500 bg-blue-500/10 text-blue-300";
                  if (reviewMode && isCorrect) cls = "border-emerald-500 bg-emerald-500/10 text-emerald-300";
                  if (isWrong) cls = "border-rose-500 bg-rose-500/10 text-rose-300";

                  return (
                    <button
                      key={option.id}
                      onClick={() => !reviewMode && toggleOption(option.id)}
                      disabled={reviewMode}
                      className={`w-full text-left flex items-start gap-3 p-3.5 rounded-xl border transition-all ${cls}`}
                    >
                      <span className="w-6 h-6 rounded-lg border border-current flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                        {String.fromCharCode(65 + option.sortOrder)}
                      </span>
                      <span className="text-sm leading-relaxed">{option.text}</span>
                    </button>
                  );
                })}
              </div>

              {reviewMode && currentResult && (
                <div className={`mt-4 p-4 rounded-xl border ${currentResult.isCorrect ? "border-emerald-500/30 bg-emerald-500/5" : "border-rose-500/30 bg-rose-500/5"}`}>
                  <p className="text-sm text-slate-300">{currentResult.explanation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Nav */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}>
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
        <Button
          variant={currentIndex < questions.length - 1 ? "outline" : "default"}
          onClick={() => {
            if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
            else if (reviewMode) setPhase("results");
          }}
        >
          {currentIndex < questions.length - 1 ? "Next" : reviewMode ? "Back to Results" : "Finish"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Question grid */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {questions.map((q, i) => {
          const answered = (selectedAnswers[q.id] ?? []).length > 0;
          let cls = "w-7 h-7 rounded text-xs font-medium transition-all ";
          if (i === currentIndex) cls += "bg-blue-600 text-white";
          else if (reviewMode && results[q.id]?.isCorrect) cls += "bg-emerald-600/30 text-emerald-400";
          else if (reviewMode && !results[q.id]?.isCorrect) cls += "bg-rose-600/30 text-rose-400";
          else if (flagged.has(q.id)) cls += "bg-amber-600/20 text-amber-400";
          else if (answered) cls += "bg-slate-700 text-slate-300";
          else cls += "bg-slate-800 text-slate-600";

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
