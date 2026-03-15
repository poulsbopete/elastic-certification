"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDuration } from "@/lib/utils";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  Circle,
  ClipboardList,
  FlaskConical,
  Plus,
  Shield,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StudyTask {
  id: string;
  title: string;
  description: string;
  taskType: string;
  dueDate: Date;
  duration: number;
  isCompleted: boolean;
  domainId?: string | null;
}

interface StudyPlan {
  id: string;
  certId: string;
  targetDate: Date;
  hoursPerWeek: number;
  experienceLevel: string;
  tasks: StudyTask[];
  cert: { name: string; shortName: string; icon: string; color: string };
}

interface Props {
  data: {
    certs: Array<{ id: string; name: string; shortName: string; icon: string; color: string }>;
    plans: StudyPlan[];
    userId: string;
  };
}

const taskTypeIcons: Record<string, typeof Brain> = {
  quiz: Brain,
  flashcard: Zap,
  lab: FlaskConical,
  reading: BookOpen,
  practice_exam: Shield,
  review: BookOpen,
};

const taskTypeColors: Record<string, string> = {
  quiz: "text-blue-400",
  flashcard: "text-amber-400",
  lab: "text-emerald-400",
  reading: "text-purple-400",
  practice_exam: "text-rose-400",
  review: "text-cyan-400",
};

function TaskItem({ task, onToggle }: { task: StudyTask; onToggle: (id: string) => void }) {
  const Icon = taskTypeIcons[task.taskType] ?? BookOpen;
  const color = taskTypeColors[task.taskType] ?? "text-slate-400";
  const isOverdue = !task.isCompleted && new Date(task.dueDate) < new Date();

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg transition-all ${task.isCompleted ? "opacity-50" : "hover:bg-slate-800/40"}`}>
      <button onClick={() => onToggle(task.id)} className="mt-0.5 flex-shrink-0">
        {task.isCompleted ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        ) : (
          <Circle className="w-4 h-4 text-slate-600 hover:text-slate-400" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Icon className={`w-3.5 h-3.5 ${color} flex-shrink-0`} />
          <span className={`text-sm font-medium ${task.isCompleted ? "line-through text-slate-500" : "text-slate-200"}`}>
            {task.title}
          </span>
          {isOverdue && !task.isCompleted && (
            <Badge variant="destructive" className="text-xs">Overdue</Badge>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-600">
          <span className="flex items-center gap-1">
            <CalendarDays className="w-3 h-3" />
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
          <span>{formatDuration(task.duration)}</span>
        </div>
      </div>
    </div>
  );
}

export function StudyPlanClient({ data }: Props) {
  const { certs } = data;
  const [plans, setPlans] = useState<StudyPlan[]>(data.plans);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    certId: "",
    targetDate: "",
    hoursPerWeek: 10,
    experienceLevel: "intermediate",
    preferredModes: [] as string[],
  });

  const togglePreferredMode = (mode: string) => {
    setForm((f) => ({
      ...f,
      preferredModes: f.preferredModes.includes(mode)
        ? f.preferredModes.filter((m) => m !== mode)
        : [...f.preferredModes, mode],
    }));
  };

  const createPlan = async () => {
    if (!form.certId || !form.targetDate) return;
    setLoading(true);
    const res = await fetch("/api/study-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const plan = await res.json();
    setPlans([...plans, plan]);
    setIsCreating(false);
    setLoading(false);
  };

  const toggleTask = async (taskId: string) => {
    const task = plans.flatMap((p) => p.tasks).find((t) => t.id === taskId);
    if (!task) return;

    const next = !task.isCompleted;
    await fetch("/api/study-plan", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, isCompleted: next }),
    });

    setPlans(plans.map((p) => ({
      ...p,
      tasks: p.tasks.map((t) => t.id === taskId ? { ...t, isCompleted: next } : t),
    })));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Study Plan</h1>
          <p className="text-sm text-slate-400">Your personalized certification study roadmap</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Plan
        </Button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-sm">Generate Study Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Certification</label>
                    <Select value={form.certId} onValueChange={(v) => setForm({ ...form, certId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select certification" />
                      </SelectTrigger>
                      <SelectContent>
                        {certs.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Target Exam Date</label>
                    <Input
                      type="date"
                      value={form.targetDate}
                      onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Hours/Week</label>
                    <div className="flex gap-2">
                      {[5, 10, 15, 20].map((h) => (
                        <button
                          key={h}
                          onClick={() => setForm({ ...form, hoursPerWeek: h })}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${form.hoursPerWeek === h ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"}`}
                        >
                          {h}h
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Experience Level</label>
                    <Select value={form.experienceLevel} onValueChange={(v) => setForm({ ...form, experienceLevel: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-2">Preferred Study Methods</label>
                  <div className="flex flex-wrap gap-2">
                    {["quiz", "flashcard", "lab", "reading"].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => togglePreferredMode(mode)}
                        className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-all ${
                          form.preferredModes.includes(mode)
                            ? "bg-blue-600/30 border border-blue-500 text-blue-400"
                            : "border border-slate-700 text-slate-500 hover:border-slate-600"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                  <Button onClick={createPlan} disabled={loading || !form.certId || !form.targetDate}>
                    {loading ? "Generating..." : "Generate Plan"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {plans.length === 0 && !isCreating ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-300 mb-2">No study plans yet</h2>
            <p className="text-slate-500 text-sm mb-6">
              Create a personalized plan with tasks, milestones, and spaced repetition review.
            </p>
            <Button onClick={() => setIsCreating(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {plans.map((plan) => {
            const completed = plan.tasks.filter((t) => t.isCompleted).length;
            const progress = plan.tasks.length > 0 ? Math.round((completed / plan.tasks.length) * 100) : 0;
            const overdue = plan.tasks.filter((t) => !t.isCompleted && new Date(t.dueDate) < new Date());
            const upcoming = plan.tasks.filter((t) => !t.isCompleted && new Date(t.dueDate) >= new Date());
            const daysUntilExam = Math.max(0, Math.round((new Date(plan.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

            return (
              <Card key={plan.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{plan.cert.icon}</span>
                      <div>
                        <CardTitle className="text-base">{plan.cert.name}</CardTitle>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Target: {new Date(plan.targetDate).toLocaleDateString()} · {daysUntilExam} days away
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-300">{progress}%</span>
                      <p className="text-xs text-slate-500">{completed}/{plan.tasks.length} tasks</p>
                    </div>
                  </div>
                  <Progress value={progress} className="mt-2 h-1.5" />
                </CardHeader>

                <CardContent>
                  <Tabs defaultValue="upcoming">
                    <TabsList>
                      <TabsTrigger value="upcoming">
                        Upcoming ({upcoming.length})
                      </TabsTrigger>
                      {overdue.length > 0 && (
                        <TabsTrigger value="overdue" className="text-rose-400">
                          Overdue ({overdue.length})
                        </TabsTrigger>
                      )}
                      <TabsTrigger value="all">All Tasks</TabsTrigger>
                    </TabsList>

                    <TabsContent value="upcoming" className="space-y-1">
                      {upcoming.slice(0, 8).map((task) => (
                        <TaskItem key={task.id} task={task} onToggle={toggleTask} />
                      ))}
                      {upcoming.length === 0 && (
                        <p className="text-sm text-slate-500 py-4 text-center">No upcoming tasks! 🎉</p>
                      )}
                    </TabsContent>

                    <TabsContent value="overdue" className="space-y-1">
                      {overdue.map((task) => (
                        <TaskItem key={task.id} task={task} onToggle={toggleTask} />
                      ))}
                    </TabsContent>

                    <TabsContent value="all" className="space-y-1">
                      {plan.tasks.map((task) => (
                        <TaskItem key={task.id} task={task} onToggle={toggleTask} />
                      ))}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
