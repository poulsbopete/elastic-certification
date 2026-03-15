"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { QuizMode } from "@/types";

interface QuizState {
  currentQuestion: number;
  selectedAnswers: Record<string, string[]>;
  flaggedQuestions: string[];
  timeRemaining: number | null;
  isComplete: boolean;
  sessionId: string | null;
}

interface PomodoroState {
  isActive: boolean;
  minutes: number;
  seconds: number;
  isBreak: boolean;
  sessionsCompleted: number;
}

interface AppStore {
  // Active certification filter
  activeCertId: string | null;
  setActiveCertId: (id: string | null) => void;

  // Quiz state
  quizState: QuizState;
  setQuizState: (state: Partial<QuizState>) => void;
  resetQuizState: () => void;
  selectAnswer: (questionId: string, optionId: string, isMultiSelect: boolean) => void;
  toggleFlag: (questionId: string) => void;

  // Active quiz config
  quizConfig: {
    mode: QuizMode;
    certId: string | null;
    domainId: string | null;
    questionCount: number;
    timeLimitMins: number | null;
  } | null;
  setQuizConfig: (config: AppStore["quizConfig"]) => void;

  // Pomodoro
  pomodoro: PomodoroState;
  setPomodoro: (state: Partial<PomodoroState>) => void;

  // UI state
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isFocusMode: boolean;
  toggleFocusMode: () => void;
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Flashcard session
  flashcardSession: {
    deckId: string | null;
    currentIndex: number;
    isFlipped: boolean;
    completed: string[];
  };
  setFlashcardSession: (state: Partial<AppStore["flashcardSession"]>) => void;
  resetFlashcardSession: () => void;
}

const defaultQuizState: QuizState = {
  currentQuestion: 0,
  selectedAnswers: {},
  flaggedQuestions: [],
  timeRemaining: null,
  isComplete: false,
  sessionId: null,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      activeCertId: null,
      setActiveCertId: (id) => set({ activeCertId: id }),

      quizState: defaultQuizState,
      setQuizState: (state) =>
        set((s) => ({ quizState: { ...s.quizState, ...state } })),
      resetQuizState: () => set({ quizState: defaultQuizState }),
      selectAnswer: (questionId, optionId, isMultiSelect) =>
        set((s) => {
          const current = s.quizState.selectedAnswers[questionId] ?? [];
          let updated: string[];
          if (isMultiSelect) {
            updated = current.includes(optionId)
              ? current.filter((id) => id !== optionId)
              : [...current, optionId];
          } else {
            updated = [optionId];
          }
          return {
            quizState: {
              ...s.quizState,
              selectedAnswers: {
                ...s.quizState.selectedAnswers,
                [questionId]: updated,
              },
            },
          };
        }),
      toggleFlag: (questionId) =>
        set((s) => {
          const flagged = s.quizState.flaggedQuestions;
          return {
            quizState: {
              ...s.quizState,
              flaggedQuestions: flagged.includes(questionId)
                ? flagged.filter((id) => id !== questionId)
                : [...flagged, questionId],
            },
          };
        }),

      quizConfig: null,
      setQuizConfig: (config) => set({ quizConfig: config }),

      pomodoro: {
        isActive: false,
        minutes: 25,
        seconds: 0,
        isBreak: false,
        sessionsCompleted: 0,
      },
      setPomodoro: (state) =>
        set((s) => ({ pomodoro: { ...s.pomodoro, ...state } })),

      isSidebarOpen: true,
      toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
      isFocusMode: false,
      toggleFocusMode: () => set((s) => ({ isFocusMode: !s.isFocusMode })),
      isCommandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),

      flashcardSession: {
        deckId: null,
        currentIndex: 0,
        isFlipped: false,
        completed: [],
      },
      setFlashcardSession: (state) =>
        set((s) => ({
          flashcardSession: { ...s.flashcardSession, ...state },
        })),
      resetFlashcardSession: () =>
        set({
          flashcardSession: {
            deckId: null,
            currentIndex: 0,
            isFlipped: false,
            completed: [],
          },
        }),
    }),
    {
      name: "elastic-cert-coach",
      partialize: (state) => ({
        activeCertId: state.activeCertId,
        isSidebarOpen: state.isSidebarOpen,
      }),
    }
  )
);
