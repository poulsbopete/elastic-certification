import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const certs = await prisma.certificationTrack.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        domains: {
          orderBy: { sortOrder: "asc" },
          include: { topics: true },
        },
      },
    });

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
