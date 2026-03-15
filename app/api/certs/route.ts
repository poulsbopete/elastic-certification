import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [certs, user] = await Promise.all([
      prisma.certificationTrack.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          domains: {
            orderBy: { sortOrder: "asc" },
            include: { topics: true },
          },
        },
      }),
      prisma.user.findFirst({ where: { email: "student@elastic-cert.local" } }),
    ]);

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const certProgresses = await prisma.certProgress.findMany({
      where: { userId: user.id },
    });

    const progressMap = Object.fromEntries(certProgresses.map((p) => [p.certId, p]));

    const result = certs.map((cert) => ({
      ...cert,
      progress: progressMap[cert.id] ?? null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/certs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
