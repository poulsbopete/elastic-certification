import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { StudyPlanClient } from "./study-plan-client";

async function getData() {
  const user = await getSessionUser();
  if (!user) return null;

  const [certs, plans] = await Promise.all([
    prisma.certificationTrack.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.studyPlan.findMany({
      where: { userId: user.id, isActive: true },
      include: {
        cert: true,
        tasks: { orderBy: { dueDate: "asc" } },
      },
    }),
  ]);

  return { certs, plans, userId: user.id };
}

export default async function StudyPlanPage() {
  const data = await getData();
  if (!data) return <p className="text-slate-400">Setup required.</p>;
  return <StudyPlanClient data={data} />;
}
