import { aiProvider } from "@/lib/ai-provider";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    let result: string | object;

    switch (action) {
      case "study_suggestion":
        result = await aiProvider.generateStudySuggestion(payload);
        break;
      case "explain_question":
        result = await aiProvider.explainQuestion(
          payload.question,
          payload.answer,
          payload.explanation
        );
        break;
      case "generate_questions":
        result = await aiProvider.generateQuizQuestions(
          payload.topic,
          payload.difficulty ?? "medium",
          payload.count ?? 3
        );
        break;
      case "next_action":
        result = await aiProvider.suggestNextAction(
          payload.weakDomains ?? [],
          payload.recentActivity ?? ""
        );
        break;
      case "mini_quiz":
        result = await aiProvider.generateMiniQuiz(payload.topic);
        break;
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("POST /api/coach:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
