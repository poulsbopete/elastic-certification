import { prisma } from "@/lib/db";
import { QuizClient } from "./quiz-client";

async function getQuizConfig() {
  const certs = await prisma.certificationTrack.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      domains: { orderBy: { sortOrder: "asc" } },
    },
  });
  return { certs };
}

export default async function QuizPage() {
  const { certs } = await getQuizConfig();
  return <QuizClient certs={certs} />;
}
