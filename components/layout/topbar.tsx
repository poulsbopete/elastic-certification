"use client";

import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { Bell, Command, Focus, Moon, Sun, Timer } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { PomodoroWidget } from "@/components/shared/pomodoro-widget";

const pageLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/study-plan": "Study Plan",
  "/quiz": "Quiz Engine",
  "/practice-exam": "Practice Exam",
  "/flashcards": "Flashcards",
  "/labs": "Lab Planner",
  "/notes": "Notes & Journal",
  "/analytics": "Analytics",
  "/coach": "AI Study Coach",
  "/admin": "Content Editor",
  "/settings": "Settings",
};

export function Topbar() {
  const { isFocusMode, toggleFocusMode, setCommandPaletteOpen } = useAppStore();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const pageLabel = Object.entries(pageLabels).find(([key]) =>
    pathname === key || pathname.startsWith(key + "/")
  )?.[1] ?? "Elastic Cert Coach";

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm flex items-center justify-between px-6 gap-4 flex-shrink-0">
      <h1 className="text-lg font-semibold text-slate-100">{pageLabel}</h1>

      <div className="flex items-center gap-2">
        <PomodoroWidget />

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setCommandPaletteOpen(true)}
          title="Command Palette (⌘K)"
        >
          <Command className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleFocusMode}
          title={isFocusMode ? "Exit Focus Mode" : "Focus Mode"}
          className={isFocusMode ? "text-blue-400" : ""}
        >
          <Focus className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title="Toggle theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </div>
    </header>
  );
}
