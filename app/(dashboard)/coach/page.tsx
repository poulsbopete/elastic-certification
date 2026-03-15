import { prisma } from "@/lib/db";
import { CoachClient } from "./coach-client";

async function getCoachData() {
  const user = await prisma.user.findFirst({ where: { email: "student@elastic-cert.local" } });
  if (!user) return null;

  const [certProgresses, weakAreas, recentSessions] = await Promise.all([
    prisma.certProgress.findMany({ where: { userId: user.id }, include: { cert: true } }),
    prisma.weakArea.findMany({
      where: { userId: user.id },
      include: { domain: true },
      orderBy: { incorrectCount: "desc" },
      take: 5,
    }),
    prisma.studySession.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: "desc" },
      take: 5,
    }),
  ]);

  const studyStreak = 3; // simplified
  const hoursThisWeek = Math.round(recentSessions.reduce((acc, s) => acc + s.durationMins, 0) / 60 * 10) / 10;

  const activeCert = certProgresses.find((cp) => cp.status === "in_progress") ?? null;

  return {
    certProgresses,
    weakAreas,
    studyStreak,
    hoursThisWeek,
    activeCert,
  };
}

export default async function CoachPage() {
  const data = await getCoachData();
  if (!data) return <p className="text-slate-400">Setup required.</p>;
  return <CoachClient data={data} />;
}
