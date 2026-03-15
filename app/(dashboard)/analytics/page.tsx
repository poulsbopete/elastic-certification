import { prisma } from "@/lib/db";
import { AnalyticsClient } from "./analytics-client";
import { subDays, startOfDay } from "date-fns";

async function getAnalyticsData() {
  const user = await prisma.user.findFirst({ where: { email: "student@elastic-cert.local" } });
  if (!user) return null;

  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);

  const [sessions, quizAttempts, flashcardReviews, certProgresses, weakAreas, practiceExamAttempts] =
    await Promise.all([
      prisma.studySession.findMany({
        where: { userId: user.id, startedAt: { gte: thirtyDaysAgo } },
        orderBy: { startedAt: "desc" },
      }),
      prisma.quizAttempt.findMany({
        where: { userId: user.id },
        include: { items: { include: { question: { include: { topic: { include: { domain: true } } } } } } },
        orderBy: { startedAt: "desc" },
        take: 50,
      }),
      prisma.flashcardReview.findMany({
        where: { userId: user.id, reviewedAt: { gte: thirtyDaysAgo } },
      }),
      prisma.certProgress.findMany({ where: { userId: user.id }, include: { cert: true } }),
      prisma.weakArea.findMany({
        where: { userId: user.id },
        include: { domain: { include: { cert: true } } },
        orderBy: { incorrectCount: "desc" },
        take: 10,
      }),
      prisma.practiceExamAttempt.findMany({
        where: { userId: user.id },
        orderBy: { startedAt: "desc" },
        take: 10,
      }),
    ]);

  // Study streak
  const sessionsByDay = new Map<string, number>();
  sessions.forEach((s) => {
    const day = startOfDay(s.startedAt).toISOString().split("T")[0];
    sessionsByDay.set(day, (sessionsByDay.get(day) ?? 0) + s.durationMins);
  });

  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const day = startOfDay(subDays(now, i)).toISOString().split("T")[0];
    if (sessionsByDay.has(day)) streak++;
    else if (i > 0) break;
  }

  // Daily study heatmap (last 30 days)
  const heatmapData = Array.from({ length: 30 }, (_, i) => {
    const day = startOfDay(subDays(now, 29 - i)).toISOString().split("T")[0];
    return { date: day, minutes: sessionsByDay.get(day) ?? 0 };
  });

  // Weekly chart (last 8 weeks)
  const weeklyData = Array.from({ length: 8 }, (_, i) => {
    const weekStart = subDays(now, (8 - i) * 7);
    const weekEnd = subDays(now, (7 - i) * 7);
    const weekSessions = sessions.filter(
      (s) => s.startedAt >= weekStart && s.startedAt < weekEnd
    );
    const label = weekStart.toLocaleDateString("en", { month: "short", day: "numeric" });
    return {
      week: label,
      hours: Math.round((weekSessions.reduce((acc, s) => acc + s.durationMins, 0) / 60) * 10) / 10,
    };
  });

  // Domain scores
  const domainScores: Record<string, { correct: number; total: number; name: string; certName: string }> = {};
  quizAttempts.forEach((attempt) => {
    attempt.items.forEach((item) => {
      const domain = item.question.topic.domain;
      if (!domainScores[domain.id]) {
        domainScores[domain.id] = { correct: 0, total: 0, name: domain.name, certName: "" };
      }
      domainScores[domain.id].total++;
      if (item.isCorrect) domainScores[domain.id].correct++;
    });
  });
  const domainScoreArray = Object.values(domainScores)
    .map((d) => ({ name: d.name.length > 25 ? d.name.slice(0, 25) + "…" : d.name, accuracy: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0 }))
    .sort((a, b) => b.accuracy - a.accuracy);

  // Quiz score over time
  const quizTrend = quizAttempts.slice(0, 20).reverse().map((a, i) => ({
    attempt: i + 1,
    score: Math.round(a.score),
    date: new Date(a.startedAt).toLocaleDateString("en", { month: "short", day: "numeric" }),
  }));

  const totalStudyHours = Math.round((sessions.reduce((acc, s) => acc + s.durationMins, 0) / 60) * 10) / 10;
  const quizAccuracy = quizAttempts.length > 0
    ? Math.round(quizAttempts.reduce((acc, a) => acc + a.score, 0) / quizAttempts.length)
    : 0;
  const flashcardRetention = flashcardReviews.length > 0
    ? Math.round((flashcardReviews.filter((r) => r.rating === "good" || r.rating === "easy").length / flashcardReviews.length) * 100)
    : 0;

  return {
    streak,
    totalStudyHours,
    quizAccuracy,
    flashcardsReviewed: flashcardReviews.length,
    flashcardRetention,
    certProgresses,
    weakAreas,
    heatmapData,
    weeklyData,
    domainScores: domainScoreArray.slice(0, 8),
    quizTrend,
    practiceExamAttempts,
  };
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();
  if (!data) return <p className="text-slate-400">Setup required.</p>;
  return <AnalyticsClient data={data} />;
}
