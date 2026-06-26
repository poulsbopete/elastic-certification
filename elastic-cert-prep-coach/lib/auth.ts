import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

/**
 * Get the current session user. Use in API routes and server components.
 * Returns null if not logged in.
 */
export async function getSessionUser(): Promise<AuthUser | null> {
  const session = await getServerSession(authOptions);
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id || !session?.user?.email) return null;
  return {
    id,
    email: session.user.email,
    name: session.user.name ?? "Student",
  };
}

/**
 * Require auth: returns user or throws. Use in server components that must have a user.
 */
export async function requireUser(): Promise<AuthUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
