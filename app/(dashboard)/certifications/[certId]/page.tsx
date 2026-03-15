import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { CertDetailClient } from "./cert-detail-client";

async function getCertData(slug: string) {
  const user = await prisma.user.findFirst({
    where: { email: "student@elastic-cert.local" },
  });
  if (!user) return null;

  const cert = await prisma.certificationTrack.findUnique({
    where: { slug },
    include: {
      domains: {
        orderBy: { sortOrder: "asc" },
        include: {
          topics: {
            include: {
              _count: {
                select: { questions: true, flashcards: true, labExercises: true },
              },
            },
          },
          _count: { select: { topics: true } },
        },
      },
    },
  });

  if (!cert) return null;

  const progress = await prisma.certProgress.findUnique({
    where: { userId_certId: { userId: user.id, certId: cert.id } },
  });

  const weakAreas = await prisma.weakArea.findMany({
    where: {
      userId: user.id,
      domain: { certId: cert.id },
    },
    include: { domain: true },
  });

  const recentQuizAttempts = await prisma.quizAttempt.findMany({
    where: { userId: user.id, certId: cert.id },
    orderBy: { startedAt: "desc" },
    take: 5,
  });

  const studyPlan = await prisma.studyPlan.findFirst({
    where: { userId: user.id, certId: cert.id, isActive: true },
    include: {
      tasks: {
        where: { isCompleted: false },
        orderBy: { dueDate: "asc" },
        take: 5,
      },
    },
  });

  return { cert, progress, weakAreas, recentQuizAttempts, studyPlan };
}

export default async function CertDetailPage({ params }: { params: Promise<{ certId: string }> }) {
  const { certId } = await params;
  const data = await getCertData(certId);
  if (!data) notFound();
  return <CertDetailClient data={data} />;
}
