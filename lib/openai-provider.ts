import OpenAI from "openai";
import type { AiProvider, StudyContext, MockQuestion } from "@/lib/mock-ai";

const model = "gpt-4o-mini";

function getClient(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

export class OpenAiProvider implements AiProvider {
  private client = getClient();

  private async chat(userContent: string, systemContent?: string): Promise<string> {
    if (!this.client) throw new Error("OPENAI_API_KEY is not set");
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (systemContent) messages.push({ role: "system", content: systemContent });
    messages.push({ role: "user", content: userContent });
    const res = await this.client.chat.completions.create({
      model,
      messages,
      max_tokens: 1024,
    });
    return res.choices[0]?.message?.content?.trim() ?? "";
  }

  async generateStudySuggestion(context: StudyContext): Promise<string> {
    const prompt = `You are a study coach for Elastic certifications. The student is studying: ${context.certName}.
Weak areas: ${context.weakDomains.join(", ") || "none noted"}.
Study streak: ${context.studyStreak} days. Hours this week: ${context.hoursThisWeek}. Readiness score: ${context.readinessScore}%.
Give a short, motivating study suggestion (2–4 sentences). Be specific and actionable. Use markdown for bold if needed.`;
    return this.chat(prompt);
  }

  async explainQuestion(question: string, answer: string, explanation: string): Promise<string> {
    const prompt = `You are an Elastic certification tutor. A student just answered a practice question.

Question: ${question.slice(0, 500)}
Their answer: ${answer}
Correct explanation: ${explanation}

In 2–4 sentences, explain why this answer is correct and how to remember it. Use markdown.`;
    return this.chat(prompt);
  }

  async generateQuizQuestions(topic: string, difficulty: string, count: number): Promise<MockQuestion[]> {
    const prompt = `Generate exactly ${Math.min(count, 5)} multiple-choice practice questions about "${topic}" for Elastic certification study. Difficulty: ${difficulty}.
For each question return:
- stem: the question text
- options: array of { "text": "...", "isCorrect": true/false } (exactly one true)
- explanation: short explanation of the correct answer
Use difficulty "${difficulty}" and type "multiple_choice".
Return valid JSON only, in this shape: [{ "stem": "...", "options": [...], "explanation": "...", "difficulty": "${difficulty}", "type": "multiple_choice" }]`;
    const raw = await this.chat(prompt);
    try {
      const parsed = JSON.parse(raw) as MockQuestion[];
      return Array.isArray(parsed) ? parsed.slice(0, count) : [];
    } catch {
      return [];
    }
  }

  async suggestNextAction(weakDomains: string[], recentActivity: string): Promise<string> {
    const prompt = `You are a study coach. The student's weak domains: ${weakDomains.join(", ") || "none"}. Recent activity: ${recentActivity}.
Suggest one specific next action (1–2 sentences). Be actionable. Use markdown for bold.`;
    return this.chat(prompt);
  }

  async generateMiniQuiz(topic: string): Promise<MockQuestion[]> {
    return this.generateQuizQuestions(topic, "medium", 3);
  }
}

export function isOpenAiConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY?.trim();
}
