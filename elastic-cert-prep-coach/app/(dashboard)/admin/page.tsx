import { prisma } from "@/lib/db";
import { AdminClient } from "./admin-client";

async function getData() {
  const certs = await prisma.certificationTrack.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      domains: {
        orderBy: { sortOrder: "asc" },
        include: {
          topics: {
            include: {
              _count: { select: { questions: true, flashcards: true, labExercises: true } },
            },
          },
        },
      },
    },
  });
  return { certs };
}

export default async function AdminPage() {
  const { certs } = await getData();
  return <AdminClient certs={certs} />;
}
