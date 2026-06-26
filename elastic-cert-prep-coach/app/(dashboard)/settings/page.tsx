import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { SettingsClient } from "./settings-client";

async function getData() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { user: null };
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: { settings: true },
  });
  return { user };
}

export default async function SettingsPage() {
  const { user } = await getData();
  if (!user) return <p className="text-slate-400">Setup required.</p>;
  return <SettingsClient user={user} settings={user.settings} />;
}
