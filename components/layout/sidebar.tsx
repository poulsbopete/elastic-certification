"use client";

import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import {
  Activity,
  BookOpen,
  Brain,
  ChevronLeft,
  ClipboardList,
  FlaskConical,
  Gauge,
  LayoutDashboard,
  NotebookPen,
  Settings,
  Shield,
  Sparkles,
  StickyNote,
  Timer,
  Trophy,
} from "lucide-react";
import { SignOutButton } from "@/components/shared/sign-out-button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/study-plan", icon: ClipboardList, label: "Study Plan" },
  { href: "/quiz", icon: Brain, label: "Quiz Engine" },
  { href: "/practice-exam", icon: Shield, label: "Practice Exam" },
  { href: "/flashcards", icon: BookOpen, label: "Flashcards" },
  { href: "/labs", icon: FlaskConical, label: "Labs" },
  { href: "/notes", icon: StickyNote, label: "Notes" },
  { href: "/analytics", icon: Activity, label: "Analytics" },
  { href: "/coach", icon: Sparkles, label: "AI Coach" },
];

const bottomItems = [
  { href: "/admin", icon: NotebookPen, label: "Content Editor" },
  { href: "/settings", icon: Settings, label: "Settings" },
];


export function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useAppStore();
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex flex-col h-screen border-r border-slate-800 bg-slate-950 transition-all duration-300 flex-shrink-0",
          isSidebarOpen ? "w-56" : "w-16"
        )}
      >
        {/* Logo */}
        <div className={cn("flex items-center h-16 border-b border-slate-800 px-4 gap-3", !isSidebarOpen && "justify-center px-0")}>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex-shrink-0">
            <Gauge className="w-4 h-4 text-white" />
          </div>
          {isSidebarOpen && (
            <span className="text-sm font-semibold text-slate-100 leading-tight">
              Elastic Cert<br />
              <span className="text-xs text-blue-400 font-normal">Prep Coach</span>
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            if (!isSidebarOpen) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-center h-9 w-9 mx-auto rounded-lg transition-colors",
                        isActive
                          ? "bg-blue-600/20 text-blue-400"
                          : "text-slate-500 hover:text-slate-200 hover:bg-slate-800"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 h-9 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-blue-600/20 text-blue-400 font-medium"
                    : "text-slate-500 hover:text-slate-200 hover:bg-slate-800"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom items */}
        <div className="px-2 pb-4 space-y-1 border-t border-slate-800 pt-4">
          {bottomItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            if (!isSidebarOpen) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-center h-9 w-9 mx-auto rounded-lg transition-colors",
                        isActive
                          ? "bg-blue-600/20 text-blue-400"
                          : "text-slate-500 hover:text-slate-200 hover:bg-slate-800"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 h-9 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-blue-600/20 text-blue-400 font-medium"
                    : "text-slate-500 hover:text-slate-200 hover:bg-slate-800"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <SignOutButton />

          {/* Collapse button */}
          <button
            onClick={toggleSidebar}
            className={cn(
              "flex items-center gap-3 px-3 h-9 w-full rounded-lg text-sm transition-colors text-slate-500 hover:text-slate-200 hover:bg-slate-800",
              !isSidebarOpen && "justify-center px-0 w-9 mx-auto"
            )}
          >
            <ChevronLeft
              className={cn("w-4 h-4 flex-shrink-0 transition-transform", !isSidebarOpen && "rotate-180")}
            />
            {isSidebarOpen && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
