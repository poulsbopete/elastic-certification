/**
 * Mock AI Provider
 * ─────────────────────────────────────────────────────────────────────────────
 * This module provides a deterministic mock AI service.
 * To plug in a real LLM (OpenAI, Anthropic, Bedrock, etc.):
 *   1. Create a new provider class implementing AiProvider interface
 *   2. Replace mockAiProvider with your implementation
 *   3. Set your API key in .env (e.g., OPENAI_API_KEY)
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface AiProvider {
  generateStudySuggestion(context: StudyContext): Promise<string>;
  explainQuestion(question: string, answer: string, explanation: string): Promise<string>;
  generateQuizQuestions(topic: string, difficulty: string, count: number): Promise<MockQuestion[]>;
  suggestNextAction(weakDomains: string[], recentActivity: string): Promise<string>;
  generateMiniQuiz(topic: string): Promise<MockQuestion[]>;
}

export interface StudyContext {
  certName: string;
  weakDomains: string[];
  studyStreak: number;
  hoursThisWeek: number;
  readinessScore: number;
}

export interface MockQuestion {
  stem: string;
  options: { text: string; isCorrect: boolean }[];
  explanation: string;
  difficulty: string;
  type: string;
}

const studySuggestions = [
  "Focus on your weakest domain first — you'll get the most readiness ROI by shoring up gaps before polishing strengths.",
  "Try a 25-minute Pomodoro session on flashcards before moving to quiz practice. Spaced repetition locks in concepts.",
  "You're in the middle of a streak — keep momentum by doing at least one practice question before bed.",
  "Schedule a full practice exam this weekend. Nothing reveals gaps like timed, end-to-end simulation.",
  "Review your 'stupid mistakes' notes before your next quiz session — pattern recognition is key.",
  "Mix domain-specific quizzing with a few cross-domain questions to simulate real exam context switching.",
  "Consider a lab exercise today — hands-on practice builds the kind of confidence that translates to exam day.",
];

const nextActionSuggestions = [
  (domain: string) => `Deep-dive into **${domain}** with a targeted 20-question quiz. Your accuracy there is below 60%.`,
  (domain: string) => `Create 5 flashcards summarizing the key concepts in **${domain}** that keep tripping you up.`,
  (domain: string) => `Complete the hands-on lab for **${domain}** — reading about it and doing it are very different.`,
  (domain: string) => `Schedule a review session for **${domain}** and take notes on the 3 hardest concepts.`,
];

class MockAiProvider implements AiProvider {
  async generateStudySuggestion(context: StudyContext): Promise<string> {
    await this.delay(400);
    const idx = Math.floor(Math.random() * studySuggestions.length);
    let suggestion = studySuggestions[idx];

    if (context.weakDomains.length > 0) {
      suggestion += `\n\nYour weakest area right now is **${context.weakDomains[0]}** — consider spending 30 minutes there today.`;
    }

    if (context.readinessScore >= 70) {
      suggestion += "\n\n🎯 You're above 70% readiness — start scheduling practice exams to build exam-day confidence.";
    } else if (context.readinessScore < 30) {
      suggestion += "\n\n💪 You're in the building phase — consistency beats intensity. 45 minutes daily beats 5 hours on weekends.";
    }

    return suggestion;
  }

  async explainQuestion(question: string, answer: string, explanation: string): Promise<string> {
    await this.delay(500);
    return `**Why this answer?**\n\n${explanation}\n\n**How to remember it:**\nThink of this as a "first principles" question — when you see "${question.split(" ").slice(0, 5).join(" ")}...", ask yourself what the core purpose of that component is in the Elastic Stack architecture.\n\n**Related concepts to review:** Check the official Elasticsearch documentation for this topic and try re-explaining it in your own words.`;
  }

  async generateQuizQuestions(topic: string, difficulty: string, count: number): Promise<MockQuestion[]> {
    await this.delay(600);
    return Array.from({ length: Math.min(count, 3) }, (_, i) => ({
      stem: `[AI-generated] Sample question ${i + 1} about ${topic} (${difficulty} difficulty) — replace with real content via a live AI provider.`,
      options: [
        { text: "Option A — AI-generated placeholder", isCorrect: i === 0 },
        { text: "Option B — AI-generated placeholder", isCorrect: false },
        { text: "Option C — AI-generated placeholder", isCorrect: false },
        { text: "Option D — AI-generated placeholder", isCorrect: false },
      ],
      explanation: `This is a mock explanation for a ${difficulty} question about ${topic}. Connect a real AI provider to generate genuine explanations.`,
      difficulty,
      type: "multiple_choice",
    }));
  }

  async suggestNextAction(weakDomains: string[], _recentActivity: string): Promise<string> {
    await this.delay(300);
    if (weakDomains.length === 0) {
      return "Great work — no obvious weak areas! Keep your quiz accuracy above 80% across all domains and schedule a practice exam.";
    }
    const domain = weakDomains[0];
    const suggestionFn = nextActionSuggestions[Math.floor(Math.random() * nextActionSuggestions.length)];
    return suggestionFn(domain);
  }

  async generateMiniQuiz(topic: string): Promise<MockQuestion[]> {
    await this.delay(500);
    return [
      {
        stem: `[AI mini-quiz] Which of the following best describes the key principle behind ${topic}?`,
        options: [
          { text: "Mock answer A — configure a real AI provider for genuine questions", isCorrect: true },
          { text: "Mock answer B", isCorrect: false },
          { text: "Mock answer C", isCorrect: false },
        ],
        explanation: `Mock explanation for ${topic}. A real AI provider will generate accurate, detailed explanations.`,
        difficulty: "medium",
        type: "multiple_choice",
      },
    ];
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const aiProvider: AiProvider = new MockAiProvider();

/**
 * To replace with OpenAI:
 *
 * import OpenAI from "openai";
 * class OpenAiProvider implements AiProvider {
 *   private client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
 *   async generateStudySuggestion(ctx: StudyContext) {
 *     const res = await this.client.chat.completions.create({
 *       model: "gpt-4o",
 *       messages: [{ role: "user", content: `...build prompt from ctx...` }],
 *     });
 *     return res.choices[0].message.content ?? "";
 *   }
 *   // ... implement other methods
 * }
 * export const aiProvider: AiProvider = new OpenAiProvider();
 */
