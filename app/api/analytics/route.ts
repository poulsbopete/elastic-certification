import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { subDays, startOfDay } from "date-fns";

export async function GET() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: "student@elastic-cert.local" },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);
    const thirtyDaysAgo = subDays(now, 30);

    // Study sessions last 30 days
    const sessions = await prisma.studySession.findMany({
      where: { userId: user.id, startedAt: { gte: thirtyDaysAgo } },
      orderBy: { startedAt: "desc" },
    });

    // Total study hours
    const totalMins = sessions.reduce((acc, s) => acc + s.durationMins, 0);

    // Study streak (consecutive days)
    const sessionsByDay = new Map<string, boolean>();
    sessions.forEach((s) => {
      sessionsByDay.set(startOfDay(s.startedAt).toISOString(), true);
    });

    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const day = startOfDay(subDays(now, i)).toISOString();
      if (sessionsByDay.has(day)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // Quiz accuracy
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { userId: user.id, completedAt: { gte: sevenDaysAgo } },
    });
    const avgAccuracy =
      quizAttempts.length > 0
        ? Math.round(
            quizAttempts.reduce((acc, a) => acc + a.score, 0) / quizAttempts.length
          )
        : 0;

    // Flashcard reviews this week
    const flashcardReviews = await prisma.flashcardReview.count({
      where: { userId: user.id, reviewedAt: { gte: sevenDaysAgo } },
    });

    // Cert progresses
    const certProgresses = await prisma.certProgress.findMany({
      where: { userId: user.id },
      include: { cert: true },
    });

    // Weak areas
    const weakAreas = await prisma.weakArea.findMany({
      where: { userId: user.id },
      include: { domain: { include: { cert: true } } },
      orderBy: { incorrectCount: "desc" },
      take: 5,
    });

    // Daily study hours for heatmap (last 30 days)
    const dailyStudy: Record<string, number> = {};
    sessions.forEach((s) => {
      const day = startOfDay(s.startedAt).toISOString().split("T")[0];
      dailyStudy[day] = (dailyStudy[day] ?? 0) + s.durationMins;
    });

    // Weekly study hours (last 8 weeks)
    const weeklyStudy = Array.from({ length: 8 }, (_, i) => {
      const weekStart = subDays(now, (7 - i + 1) * 7);
      const weekEnd = subDays(now, (7 - i) * 7);
      const weekSessions = sessions.filter(
        (s) => s.startedAt >= weekStart && s.startedAt < weekEnd
      );
      return {
        week: `W${i + 1}`,
        hours: Math.round((weekSessions.reduce((acc, s) => acc + s.durationMins, 0) / 60) * 10) / 10,
      };
    });

    // Quiz scores by domain (last 30 attempts)
    const recentAttempts = await prisma.quizAttempt.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: { question: { include: { topic: { include: { domain: true } } } } },
        },
      },
      orderBy: { startedAt: "desc" },
      take: 30,
    });

    const domainScores: Record<string, { correct: number; total: number; name: string }> = {};
    recentAttempts.forEach((attempt) => {
      attempt.items.forEach((item) => {
        const domainName = item.question.topic.domain.name;
        const domainId = item.question.topic.domain.id;
        if (!domainScores[domainId]) {
          domainScores[domainId] = { correct: 0, total: 0, name: domainName };
        }
        domainScores[domainId].total++;
        if (item.isCorrect) domainScores[domainId].correct++;
      });
    });

    const domainScoreArray = Object.values(domainScores)
      .map((d) => ({
        name: d.name,
        accuracy: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0,
      }))
      .sort((a, b) => b.accuracy - a.accuracy);

    return NextResponse.json({
      totalStudyHours: Math.round((totalMins / 60) * 10) / 10,
      studyStreak: streak,
      quizAccuracy: avgAccuracy,
      flashcardsReviewed: flashcardReviews,
      certProgresses,
      weakAreas,
      dailyStudy,
      weeklyStudy,
      domainScores: domainScoreArray,
      recentSessions: sessions.slice(0, 10),
    });
  } catch (error) {
    console.error("GET /api/analytics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
