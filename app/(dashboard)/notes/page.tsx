import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { NotesClient } from "./notes-client";

async function getNotesData() {
  const user = await getSessionUser();
  if (!user) return null;
  const [notes, certs] = await Promise.all([
    prisma.note.findMany({
      where: { userId: user.id },
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
    }),
    prisma.certificationTrack.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  return { notes, certs, userId: user.id };
}

export default async function NotesPage() {
  const data = await getNotesData();
  if (!data) return <p className="text-slate-400">Setup required.</p>;
  return <NotesClient data={data} />;
}
