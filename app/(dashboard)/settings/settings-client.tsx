"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Database, Download, Settings, Upload, User } from "lucide-react";

interface Props {
  user: { id: string; name: string; email: string | null };
  settings: {
    dailyGoalMinutes: number;
    pomodoroMinutes: number;
    pomodoroBreak: number;
    preferredStudyMode: string;
    reminderTime: string;
  } | null;
}

export function SettingsClient({ user, settings }: Props) {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    dailyGoalMinutes: settings?.dailyGoalMinutes ?? 60,
    pomodoroMinutes: settings?.pomodoroMinutes ?? 25,
    pomodoroBreak: settings?.pomodoroBreak ?? 5,
    preferredStudyMode: settings?.preferredStudyMode ?? "balanced",
    reminderTime: settings?.reminderTime ?? "09:00",
  });

  const handleSave = async () => {
    // In a real app, POST to /api/settings
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      user: { name: form.name, email: user.email },
      settings: form,
      note: "Import this file to restore your settings",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "elastic-cert-coach-settings.json";
    a.click();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
        <p className="text-sm text-slate-400">Configure your study preferences</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Display Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Email</label>
            <Input value={user.email ?? ""} disabled className="opacity-50" />
            <p className="text-xs text-slate-600 mt-1">Email is fixed in single-user mode</p>
          </div>
        </CardContent>
      </Card>

      {/* Study preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Study Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Daily Study Goal: <span className="text-slate-300 font-medium">{form.dailyGoalMinutes} minutes</span>
            </label>
            <input
              type="range"
              min="15"
              max="240"
              step="15"
              value={form.dailyGoalMinutes}
              onChange={(e) => setForm({ ...form, dailyGoalMinutes: Number(e.target.value) })}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>15m</span>
              <span>4h</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Preferred Study Mode</label>
            <Select
              value={form.preferredStudyMode}
              onValueChange={(v) => setForm({ ...form, preferredStudyMode: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="balanced">Balanced (quiz + flashcard + lab)</SelectItem>
                <SelectItem value="quiz_heavy">Quiz Heavy</SelectItem>
                <SelectItem value="flashcard_heavy">Flashcard Heavy</SelectItem>
                <SelectItem value="lab_heavy">Lab Heavy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-2">Daily Reminder</label>
            <Input
              type="time"
              value={form.reminderTime}
              onChange={(e) => setForm({ ...form, reminderTime: e.target.value })}
              className="w-40"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pomodoro */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Pomodoro Timer</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Focus: <span className="text-slate-300 font-medium">{form.pomodoroMinutes}m</span>
            </label>
            <input
              type="range"
              min="15"
              max="60"
              step="5"
              value={form.pomodoroMinutes}
              onChange={(e) => setForm({ ...form, pomodoroMinutes: Number(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Break: <span className="text-slate-300 font-medium">{form.pomodoroBreak}m</span>
            </label>
            <input
              type="range"
              min="3"
              max="15"
              step="1"
              value={form.pomodoroBreak}
              onChange={(e) => setForm({ ...form, pomodoroBreak: Number(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="w-4 h-4" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="gap-2 w-full" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Export Settings as JSON
          </Button>
          <Button variant="outline" className="gap-2 w-full" disabled>
            <Upload className="w-4 h-4" />
            Import from JSON (coming soon)
          </Button>
          <p className="text-xs text-slate-600">
            Export your notes, flashcard history, and quiz results from the Notes and Analytics pages.
          </p>
        </CardContent>
      </Card>

      {/* Save */}
      <Button onClick={handleSave} size="lg" className="w-full gap-2">
        {saved ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Saved!
          </>
        ) : (
          "Save Settings"
        )}
      </Button>
    </div>
  );
}
