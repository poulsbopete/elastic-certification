"use client";

import { signOut } from "next-auth/react";
import { useAppStore } from "@/store/useAppStore";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function SignOutButton() {
  const isSidebarOpen = useAppStore((s) => s.isSidebarOpen);
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className={cn(
        "flex items-center gap-3 px-3 h-9 w-full rounded-lg text-sm transition-colors text-slate-500 hover:text-slate-200 hover:bg-slate-800",
        !isSidebarOpen && "justify-center px-0 w-9 mx-auto"
      )}
    >
      <LogOut className="w-4 h-4 flex-shrink-0" />
      {isSidebarOpen && <span>Sign out</span>}
    </button>
  );
}
