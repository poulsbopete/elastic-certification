"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { Pause, Play, RotateCcw, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

export function PomodoroWidget() {
  const { pomodoro, setPomodoro } = useAppStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (pomodoro.isActive) {
      intervalRef.current = setInterval(() => {
        const current = useAppStore.getState().pomodoro;
        if (current.seconds > 0) {
          setPomodoro({ seconds: current.seconds - 1 });
        } else if (current.minutes > 0) {
          setPomodoro({ minutes: current.minutes - 1, seconds: 59 });
        } else {
          setPomodoro({
            isActive: false,
            isBreak: !current.isBreak,
            minutes: current.isBreak ? 25 : 5,
            seconds: 0,
            sessionsCompleted: current.isBreak ? current.sessionsCompleted : current.sessionsCompleted + 1,
          });
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pomodoro.isActive]);

  const toggle = () => setPomodoro({ isActive: !pomodoro.isActive });
  const reset = () =>
    setPomodoro({ isActive: false, minutes: 25, seconds: 0, isBreak: false });

  const timeStr = `${String(pomodoro.minutes).padStart(2, "0")}:${String(pomodoro.seconds).padStart(2, "0")}`;

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-1.5">
      <Timer
        className={cn(
          "w-3.5 h-3.5",
          pomodoro.isActive ? "text-blue-400 animate-pulse" : "text-slate-500"
        )}
      />
      <span
        className={cn(
          "text-xs font-mono font-medium tabular-nums",
          pomodoro.isBreak ? "text-emerald-400" : "text-slate-300"
        )}
      >
        {timeStr}
      </span>
      {pomodoro.sessionsCompleted > 0 && (
        <span className="text-xs text-slate-500">×{pomodoro.sessionsCompleted}</span>
      )}
      <Button variant="ghost" size="icon-sm" className="h-5 w-5" onClick={toggle}>
        {pomodoro.isActive ? (
          <Pause className="w-3 h-3" />
        ) : (
          <Play className="w-3 h-3" />
        )}
      </Button>
      <Button variant="ghost" size="icon-sm" className="h-5 w-5" onClick={reset}>
        <RotateCcw className="w-3 h-3" />
      </Button>
    </div>
  );
}
