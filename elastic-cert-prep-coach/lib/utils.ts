import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "passed": return "text-emerald-400 bg-emerald-400/10";
    case "ready": return "text-blue-400 bg-blue-400/10";
    case "in_progress": return "text-amber-400 bg-amber-400/10";
    default: return "text-slate-400 bg-slate-400/10";
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "not_started": return "Not Started";
    case "in_progress": return "In Progress";
    case "ready": return "Ready for Exam";
    case "passed": return "Passed";
    default: return status;
  }
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "easy": return "text-emerald-400 bg-emerald-400/10";
    case "medium": return "text-amber-400 bg-amber-400/10";
    case "hard": return "text-rose-400 bg-rose-400/10";
    default: return "text-slate-400 bg-slate-400/10";
  }
}

export function getReadinessLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Exam Ready", color: "text-emerald-400" };
  if (score >= 60) return { label: "Almost Ready", color: "text-blue-400" };
  if (score >= 40) return { label: "Making Progress", color: "text-amber-400" };
  if (score >= 20) return { label: "Early Stage", color: "text-orange-400" };
  return { label: "Just Starting", color: "text-slate-400" };
}

export function calculateReadiness(params: {
  quizAccuracy: number;
  flashcardRetention: number;
  labCompletion: number;
  practiceExamScore: number;
  domainCoverage: number;
}): number {
  const weights = {
    quizAccuracy: 0.3,
    flashcardRetention: 0.2,
    labCompletion: 0.15,
    practiceExamScore: 0.25,
    domainCoverage: 0.1,
  };
  return Math.round(
    params.quizAccuracy * weights.quizAccuracy +
    params.flashcardRetention * weights.flashcardRetention +
    params.labCompletion * weights.labCompletion +
    params.practiceExamScore * weights.practiceExamScore +
    params.domainCoverage * weights.domainCoverage
  );
}

export function getNextReviewDate(interval: number, easeFactor: number, rating: string): Date {
  let newInterval = interval;
  let newEase = easeFactor;

  switch (rating) {
    case "again":
      newInterval = 1;
      newEase = Math.max(1.3, easeFactor - 0.2);
      break;
    case "hard":
      newInterval = Math.max(1, Math.round(interval * 1.2));
      newEase = Math.max(1.3, easeFactor - 0.15);
      break;
    case "good":
      newInterval = Math.round(interval * easeFactor);
      break;
    case "easy":
      newInterval = Math.round(interval * easeFactor * 1.3);
      newEase = easeFactor + 0.15;
      break;
  }

  const next = new Date();
  next.setDate(next.getDate() + newInterval);
  return next;
}

export function parseTags(tags: string): string[] {
  try {
    return JSON.parse(tags);
  } catch {
    return [];
  }
}

export function certColor(color: string): string {
  return color || "#0077CC";
}
