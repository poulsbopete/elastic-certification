import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode") ?? "practice";
  const certId = searchParams.get("certId");
  const domainId = searchParams.get("domainId");
  const count = parseInt(searchParams.get("count") ?? "10");

  try {
    const { getSessionUser } = await import("@/lib/auth");
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let questions;

    if (mode === "weak_areas") {
      const weakAreas = await prisma.weakArea.findMany({
        where: { userId: user.id },
        include: { domain: { include: { topics: true } } },
        orderBy: { incorrectCount: "desc" },
        take: 5,
      });
      const topicIds = weakAreas.flatMap((w) => w.domain.topics.map((t) => t.id));
      questions = await prisma.question.findMany({
        where: { topicId: { in: topicIds } },
        include: {
          answerOptions: { orderBy: { sortOrder: "asc" } },
          topic: { include: { domain: { include: { cert: true } } } },
        },
        take: count,
      });
    } else {
      const where: Record<string, unknown> = {};
      if (domainId) {
        where.topic = { domainId };
      } else if (certId) {
        where.topic = { domain: { certId } };
      }

      questions = await prisma.question.findMany({
        where,
        include: {
          answerOptions: { orderBy: { sortOrder: "asc" } },
          topic: { include: { domain: { include: { cert: true } } } },
        },
        take: count * 3,
      });

      // Shuffle
      questions = questions.sort(() => Math.random() - 0.5).slice(0, count);
    }

    // Don't send isCorrect in initial load — send it after submission
    const sanitized = questions.map((q) => ({
      ...q,
      answerOptions: q.answerOptions.map((opt) => ({
        id: opt.id,
        text: opt.text,
        sortOrder: opt.sortOrder,
        questionId: opt.questionId,
      })),
    }));

    return NextResponse.json({ questions: sanitized, total: sanitized.length });
  } catch (error) {
    console.error("GET /api/quiz:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { questionId, selectedOptionIds } = body;

    const { getSessionUser } = await import("@/lib/auth");
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        answerOptions: true,
        topic: { include: { domain: true } },
      },
    });
    if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 });

    const correctIds = question.answerOptions
      .filter((o) => o.isCorrect)
      .map((o) => o.id);

    const isCorrect =
      selectedOptionIds.length === correctIds.length &&
      selectedOptionIds.every((id: string) => correctIds.includes(id));

    if (!isCorrect) {
      const existingWeak = await prisma.weakArea.findFirst({
        where: { userId: user.id, domainId: question.topic.domainId },
      });
      if (existingWeak) {
        await prisma.weakArea.update({
          where: { id: existingWeak.id },
          data: { incorrectCount: { increment: 1 }, totalAttempts: { increment: 1 }, lastAttempt: new Date() },
        });
      } else {
        await prisma.weakArea.create({
          data: { userId: user.id, domainId: question.topic.domainId, incorrectCount: 1, totalAttempts: 1, lastAttempt: new Date() },
        });
      }
    } else {
      const existingWeak = await prisma.weakArea.findFirst({
        where: { userId: user.id, domainId: question.topic.domainId },
      });
      if (existingWeak) {
        await prisma.weakArea.update({
          where: { id: existingWeak.id },
          data: { totalAttempts: { increment: 1 }, lastAttempt: new Date() },
        });
      } else {
        await prisma.weakArea.create({
          data: { userId: user.id, domainId: question.topic.domainId, incorrectCount: 0, totalAttempts: 1, lastAttempt: new Date() },
        });
      }
    }

    return NextResponse.json({
      isCorrect,
      correctOptionIds: correctIds,
      explanation: question.explanation,
    });
  } catch (error) {
    console.error("POST /api/quiz:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
