import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { addDays, addWeeks } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { certId, targetDate, hoursPerWeek, experienceLevel, preferredModes } = body;

    const { getSessionUser } = await import("@/lib/auth");
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const cert = await prisma.certificationTrack.findUnique({
      where: { id: certId },
      include: { domains: { include: { topics: true } } },
    });
    if (!cert) return NextResponse.json({ error: "Cert not found" }, { status: 404 });

    const plan = await prisma.studyPlan.create({
      data: {
        userId: user.id,
        certId,
        targetDate: new Date(targetDate),
        hoursPerWeek,
        experienceLevel,
        preferredModes: JSON.stringify(preferredModes),
      },
    });

    // Generate tasks
    const now = new Date();
    const tasks = [];
    let dayOffset = 1;

    for (const domain of cert.domains) {
      // Quiz task per domain
      tasks.push({
        planId: plan.id,
        title: `Quiz: ${domain.name}`,
        description: `Practice questions for ${domain.name}`,
        taskType: "quiz",
        dueDate: addDays(now, dayOffset),
        duration: 30,
        domainId: domain.id,
        sortOrder: tasks.length,
      });
      dayOffset += 2;

      // Flashcard review
      tasks.push({
        planId: plan.id,
        title: `Flashcards: ${domain.name}`,
        description: `Spaced repetition review for ${domain.name}`,
        taskType: "flashcard",
        dueDate: addDays(now, dayOffset),
        duration: 20,
        domainId: domain.id,
        sortOrder: tasks.length,
      });
      dayOffset += 1;
    }

    // Practice exam
    tasks.push({
      planId: plan.id,
      title: `Practice Exam: ${cert.shortName}`,
      description: "Full-length practice exam simulation",
      taskType: "practice_exam",
      dueDate: addWeeks(now, 2),
      duration: cert.examDuration,
      sortOrder: tasks.length,
    });

    // Review session
    tasks.push({
      planId: plan.id,
      title: "Weak Area Review",
      description: "Focus on domains with lowest accuracy",
      taskType: "review",
      dueDate: addWeeks(now, 3),
      duration: 45,
      sortOrder: tasks.length,
    });

    await prisma.studyTask.createMany({ data: tasks });

    const fullPlan = await prisma.studyPlan.findUnique({
      where: { id: plan.id },
      include: { cert: true, tasks: { orderBy: { dueDate: "asc" } } },
    });

    return NextResponse.json(fullPlan, { status: 201 });
  } catch (error) {
    console.error("POST /api/study-plan:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { taskId, isCompleted } = await req.json();
    const task = await prisma.studyTask.update({
      where: { id: taskId },
      data: { isCompleted, completedAt: isCompleted ? new Date() : null },
    });
    return NextResponse.json(task);
  } catch (error) {
    console.error("PATCH /api/study-plan:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
