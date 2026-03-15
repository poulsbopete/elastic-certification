import { prisma } from "@/lib/db";
import { PracticeExamClient } from "./practice-exam-client";

async function getData() {
  const user = await prisma.user.findFirst({ where: { email: "student@elastic-cert.local" } });
  if (!user) return null;

  const certs = await prisma.certificationTrack.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { domains: true } },
    },
  });

  const recentAttempts = await prisma.practiceExamAttempt.findMany({
    where: { userId: user.id },
    include: { exam: { include: { cert: true } } },
    orderBy: { startedAt: "desc" },
    take: 10,
  });

  // Count questions per cert
  const certQuestionCounts: Record<string, number> = {};
  for (const cert of certs) {
    const count = await prisma.question.count({
      where: { topic: { domain: { certId: cert.id } } },
    });
    certQuestionCounts[cert.id] = count;
  }

  return { certs, recentAttempts, certQuestionCounts, userId: user.id };
}

export default async function PracticeExamPage() {
  const data = await getData();
  if (!data) return <p className="text-slate-400">Setup required.</p>;
  return <PracticeExamClient data={data} />;
}
