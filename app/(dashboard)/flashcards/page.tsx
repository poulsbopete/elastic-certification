import { prisma } from "@/lib/db";
import { FlashcardsClient } from "./flashcards-client";

async function getFlashcardsData() {
  const user = await prisma.user.findFirst({
    where: { email: "student@elastic-cert.local" },
  });
  if (!user) return null;

  const certs = await prisma.certificationTrack.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const flashcards = await prisma.flashcard.findMany({
    include: {
      topic: {
        include: { domain: { include: { cert: true } } },
      },
      reviews: {
        where: { userId: user.id },
        orderBy: { reviewedAt: "desc" },
        take: 1,
      },
    },
  });

  const dueCards = flashcards.filter((card) => {
    const lastReview = card.reviews[0];
    if (!lastReview) return true;
    return new Date(lastReview.nextReview) <= new Date();
  });

  return { certs, flashcards, dueCards, userId: user.id };
}

export default async function FlashcardsPage() {
  const data = await getFlashcardsData();
  if (!data) return <p className="text-slate-400">Setup required. Run db:seed first.</p>;
  return <FlashcardsClient data={data} />;
}
