import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { DashboardClient } from "./dashboard-client";
import { subDays, startOfDay } from "date-fns";

async function getDashboardData() {
  const user = await getSessionUser();
  if (!user) return null;

  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);
  const thirtyDaysAgo = subDays(now, 30);

  const [certs, certProgresses, sessions, quizAttempts, weakAreas, notes] =
    await Promise.all([
      prisma.certificationTrack.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.certProgress.findMany({
        where: { userId: user.id },
        include: { cert: true },
      }),
      prisma.studySession.findMany({
        where: { userId: user.id, startedAt: { gte: thirtyDaysAgo } },
        orderBy: { startedAt: "desc" },
        take: 20,
      }),
      prisma.quizAttempt.findMany({
        where: { userId: user.id, completedAt: { gte: sevenDaysAgo } },
      }),
      prisma.weakArea.findMany({
        where: { userId: user.id },
        include: { domain: { include: { cert: true } } },
        orderBy: { incorrectCount: "desc" },
        take: 5,
      }),
      prisma.note.findMany({
        where: { userId: user.id, isPinned: true },
        orderBy: { updatedAt: "desc" },
        take: 3,
      }),
    ]);

  const totalMins = sessions.reduce((acc, s) => acc + s.durationMins, 0);
  const sessionsByDay = new Map<string, boolean>();
  sessions.forEach((s) => sessionsByDay.set(startOfDay(s.startedAt).toISOString(), true));
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const day = startOfDay(subDays(now, i)).toISOString();
    if (sessionsByDay.has(day)) streak++;
    else if (i > 0) break;
  }

  const avgAccuracy =
    quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((acc, a) => acc + a.score, 0) / quizAttempts.length)
      : 0;

  const progressMap = Object.fromEntries(certProgresses.map((p) => [p.certId, p]));
  const certsWithProgress = certs.map((cert) => ({
    ...cert,
    progress: progressMap[cert.id] ?? null,
  }));

  return {
    userName: user.name,
    certsWithProgress,
    stats: {
      totalStudyHours: Math.round((totalMins / 60) * 10) / 10,
      studyStreak: streak,
      quizAccuracy: avgAccuracy,
      sessionsThisWeek: sessions.filter((s) => s.startedAt >= sevenDaysAgo).length,
    },
    weakAreas,
    pinnedNotes: notes,
    recentSessions: sessions.slice(0, 5),
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">No user found. Please run the database seed.</p>
      </div>
    );
  }
  return <DashboardClient data={data} />;
}
