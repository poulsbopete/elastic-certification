import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const { labId, isCompleted } = await req.json();
    const lab = await prisma.labExercise.update({
      where: { id: labId },
      data: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });
    return NextResponse.json(lab);
  } catch (error) {
    console.error("PATCH /api/labs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { labId, notes } = await req.json();
    const lab = await prisma.labExercise.update({
      where: { id: labId },
      data: { notes },
    });
    return NextResponse.json(lab);
  } catch (error) {
    console.error("PUT /api/labs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
