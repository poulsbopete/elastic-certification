export type CertStatus = "not_started" | "in_progress" | "ready" | "passed";
export type Difficulty = "easy" | "medium" | "hard";
export type QuestionType = "multiple_choice" | "multiple_select" | "true_false" | "scenario";
export type FlashcardRating = "again" | "hard" | "good" | "easy";
export type QuizMode = "practice" | "timed" | "domain" | "weak_areas" | "mixed";
export type NoteType = "note" | "mistake" | "snippet" | "command" | "investigation";
export type StudyMode = "balanced" | "quiz_heavy" | "flashcard_heavy" | "lab_heavy";

export interface CertificationTrack {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  color: string;
  examDuration: number;
  passingScore: number;
  questionCount: number;
  officialUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface Domain {
  id: string;
  certId: string;
  name: string;
  description: string;
  weightPercent: number;
  sortOrder: number;
  isEditable: boolean;
  disclaimer: string;
}

export interface Topic {
  id: string;
  domainId: string;
  name: string;
  description: string;
  isEditable: boolean;
}

export interface Question {
  id: string;
  topicId: string;
  type: QuestionType;
  stem: string;
  explanation: string;
  difficulty: Difficulty;
  answerOptions: AnswerOption[];
}

export interface AnswerOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  sortOrder: number;
}

export interface Flashcard {
  id: string;
  topicId: string;
  front: string;
  back: string;
  hint?: string | null;
  tags: string;
  createdAt: Date;
}

export interface LabExercise {
  id: string;
  topicId: string;
  title: string;
  goal: string;
  steps: string;
  prerequisites: string;
  estimatedMins: number;
  difficulty: string;
  notes: string;
  isCompleted: boolean;
  completedAt?: Date | null;
  isEditable: boolean;
}

export interface StudyPlan {
  id: string;
  userId: string;
  certId: string;
  targetDate: Date;
  hoursPerWeek: number;
  experienceLevel: string;
  preferredModes: string;
  isActive: boolean;
  tasks: StudyTask[];
}

export interface StudyTask {
  id: string;
  planId: string;
  title: string;
  description: string;
  taskType: string;
  dueDate: Date;
  duration: number;
  isCompleted: boolean;
  completedAt?: Date | null;
  sortOrder: number;
  domainId?: string | null;
}

export interface CertProgress {
  id: string;
  userId: string;
  certId: string;
  status: CertStatus;
  progressPercent: number;
  readinessScore: number;
  examDate?: Date | null;
  passedAt?: Date | null;
  hoursStudied: number;
  updatedAt: Date;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  noteType: NoteType;
  certId?: string | null;
  domainId?: string | null;
  topicId?: string | null;
  tags: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeakArea {
  id: string;
  userId: string;
  domainId: string;
  domain: Domain;
  incorrectCount: number;
  totalAttempts: number;
  lastAttempt?: Date | null;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  certId?: string | null;
  domainId?: string | null;
  mode: QuizMode;
  score: number;
  timeTakenMins: number;
  startedAt: Date;
  completedAt?: Date | null;
  items: QuizAttemptItem[];
}

export interface QuizAttemptItem {
  id: string;
  attemptId: string;
  questionId: string;
  question: Question;
  selectedOptions: string;
  isCorrect: boolean;
  confidence: number;
  timeTakenSecs: number;
}

export interface PracticeExamAttempt {
  id: string;
  userId: string;
  examId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTakenMins: number;
  passed: boolean;
  answers: string;
  domainScores: string;
  startedAt: Date;
  completedAt?: Date | null;
}

export interface DashboardStats {
  totalStudyHours: number;
  studyStreak: number;
  quizAccuracy: number;
  flashcardsReviewed: number;
  certProgresses: (CertProgress & { cert: CertificationTrack })[];
  recentActivity: StudySession[];
  weakAreas: (WeakArea & { domain: Domain & { cert: CertificationTrack } })[];
}

export interface StudySession {
  id: string;
  userId: string;
  certId?: string | null;
  domainId?: string | null;
  sessionType: string;
  durationMins: number;
  startedAt: Date;
  endedAt?: Date | null;
  notes: string;
}
