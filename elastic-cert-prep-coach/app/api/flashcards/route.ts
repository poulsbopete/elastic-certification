import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getNextReviewDate } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { cardId, rating } = await req.json();
    const { getSessionUser } = await import("@/lib/auth");
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const lastReview = await prisma.flashcardReview.findFirst({
      where: { userId: user.id, cardId },
      orderBy: { reviewedAt: "desc" },
    });

    const interval = lastReview?.interval ?? 1;
    const easeFactor = lastReview?.easeFactor ?? 2.5;
    const nextReview = getNextReviewDate(interval, easeFactor, rating);

    // Calculate new interval
    let newInterval = interval;
    let newEase = easeFactor;
    switch (rating) {
      case "again": newInterval = 1; newEase = Math.max(1.3, easeFactor - 0.2); break;
      case "hard": newInterval = Math.max(1, Math.round(interval * 1.2)); newEase = Math.max(1.3, easeFactor - 0.15); break;
      case "good": newInterval = Math.round(interval * easeFactor); break;
      case "easy": newInterval = Math.round(interval * easeFactor * 1.3); newEase = easeFactor + 0.15; break;
    }

    await prisma.flashcardReview.create({
      data: {
        userId: user.id,
        cardId,
        rating,
        nextReview,
        interval: newInterval,
        easeFactor: newEase,
      },
    });

    return NextResponse.json({ nextReview, interval: newInterval });
  } catch (error) {
    console.error("POST /api/flashcards:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
