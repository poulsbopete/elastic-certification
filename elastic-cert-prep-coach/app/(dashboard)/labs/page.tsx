import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { LabsClient } from "./labs-client";

async function getLabsData() {
  const user = await getSessionUser();
  if (!user) return null;

  const labs = await prisma.labExercise.findMany({
    include: {
      topic: {
        include: { domain: { include: { cert: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const certs = await prisma.certificationTrack.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const completed = labs.filter((l) => l.isCompleted).length;
  const totalMins = labs.filter((l) => l.isCompleted).reduce((acc, l) => acc + l.estimatedMins, 0);

  return { labs, certs, completed, totalMins };
}

export default async function LabsPage() {
  const data = await getLabsData();
  if (!data) return <p className="text-slate-400">Setup required.</p>;
  return <LabsClient data={data} />;
}
