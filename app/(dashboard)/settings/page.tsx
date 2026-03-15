import { prisma } from "@/lib/db";
import { SettingsClient } from "./settings-client";

async function getData() {
  const user = await prisma.user.findFirst({
    where: { email: "student@elastic-cert.local" },
    include: { settings: true },
  });
  return { user };
}

export default async function SettingsPage() {
  const { user } = await getData();
  if (!user) return <p className="text-slate-400">Setup required.</p>;
  return <SettingsClient user={user} settings={user.settings} />;
}
