import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const user = await prisma.user.findFirst({ where: { email: "student@elastic-cert.local" } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const note = await prisma.note.create({
      data: {
        userId: user.id,
        title: body.title,
        content: body.content,
        noteType: body.noteType ?? "note",
        certId: body.certId || null,
        tags: JSON.stringify(body.tags ?? []),
        isPinned: body.isPinned ?? false,
      },
    });
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("POST /api/notes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();
    const note = await prisma.note.update({
      where: { id },
      data: {
        ...updates,
        tags: updates.tags ? JSON.stringify(updates.tags) : undefined,
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(note);
  } catch (error) {
    console.error("PATCH /api/notes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await prisma.note.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/notes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
