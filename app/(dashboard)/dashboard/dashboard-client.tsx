"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDuration, getReadinessLabel, getStatusColor, getStatusLabel } from "@/lib/utils";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Brain,
  Clock,
  Flame,
  FlaskConical,
  Shield,
  Sparkles,
  StickyNote,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Props {
  data: {
    userName?: string;
    certsWithProgress: Array<{
      id: string;
      slug: string;
      name: string;
      shortName: string;
      icon: string;
      color: string;
      progress: {
        status: string;
        progressPercent: number;
        readinessScore: number;
        hoursStudied: number;
        examDate?: Date | null;
      } | null;
    }>;
    stats: {
      totalStudyHours: number;
      studyStreak: number;
      quizAccuracy: number;
      sessionsThisWeek: number;
    };
    weakAreas: Array<{
      id: string;
      incorrectCount: number;
      totalAttempts: number;
      domain: { name: string; cert: { name: string; color: string } };
    }>;
    pinnedNotes: Array<{
      id: string;
      title: string;
      content: string;
      noteType: string;
    }>;
    recentSessions: Array<{
      id: string;
      sessionType: string;
      durationMins: number;
      startedAt: Date;
    }>;
  };
}

const statCards = [
  {
    key: "studyStreak",
    label: "Study Streak",
    icon: Flame,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    suffix: " days",
  },
  {
    key: "totalStudyHours",
    label: "Hours Studied",
    icon: Clock,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    suffix: "h",
  },
  {
    key: "quizAccuracy",
    label: "Quiz Accuracy",
    icon: Target,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    suffix: "%",
  },
  {
    key: "sessionsThisWeek",
    label: "Sessions This Week",
    icon: Activity,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    suffix: "",
  },
];

const noteTypeColors: Record<string, string> = {
  mistake: "text-rose-400",
  snippet: "text-blue-400",
  command: "text-amber-400",
  investigation: "text-purple-400",
  note: "text-slate-400",
};

export function DashboardClient({ data }: Props) {
  const { userName, certsWithProgress, stats, weakAreas, pinnedNotes, recentSessions } = data;

  const inProgressCerts = certsWithProgress.filter(
    (c) => c.progress?.status === "in_progress"
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-blue-600/5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 mb-1">
              Welcome back, {userName ?? "Elastic Student"} 👋
            </h2>
            <p className="text-sm text-slate-400">
              {inProgressCerts.length > 0
                ? `You're actively studying ${inProgressCerts.map((c) => c.shortName).join(", ")}. Keep the momentum going.`
                : "Pick a certification track to start your study journey."}
            </p>
          </div>
          <Link href="/coach">
            <Button variant="outline" size="sm" className="gap-2 whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              AI Coach
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          const value = stats[card.key as keyof typeof stats];
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-500 font-medium">{card.label}</span>
                    <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-100">
                    {value}
                    <span className="text-sm font-normal text-slate-500 ml-0.5">{card.suffix}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Certification Tracks — takes 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Certification Tracks
            </h2>
            <Link href="/quiz" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              Quick Quiz <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {certsWithProgress.map((cert, i) => {
              const progress = cert.progress;
              const status = progress?.status ?? "not_started";
              const readiness = progress?.readinessScore ?? 0;
              const readinessInfo = getReadinessLabel(readiness);

              return (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link href={`/certifications/${cert.slug}`}>
                    <Card className="hover:border-slate-700 transition-all cursor-pointer group">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                            style={{ backgroundColor: `${cert.color}18` }}
                          >
                            {cert.icon}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                                {cert.name}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {cert.shortName}
                              </Badge>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(status)}`}>
                                {getStatusLabel(status)}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 mb-2">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-slate-500">Progress</span>
                                  <span className="text-xs text-slate-400">
                                    {progress?.progressPercent ?? 0}%
                                  </span>
                                </div>
                                <Progress
                                  value={progress?.progressPercent ?? 0}
                                  className="h-1.5"
                                  indicatorClassName="bg-blue-500"
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-slate-500">Readiness</span>
                                  <span className={`text-xs font-medium ${readinessInfo.color}`}>
                                    {readiness}%
                                  </span>
                                </div>
                                <Progress
                                  value={readiness}
                                  className="h-1.5"
                                  indicatorClassName={
                                    readiness >= 70 ? "bg-emerald-500" : readiness >= 40 ? "bg-amber-500" : "bg-rose-500"
                                  }
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {progress?.hoursStudied ?? 0}h studied
                              </span>
                              <span className={readinessInfo.color}>
                                {readinessInfo.label}
                              </span>
                            </div>
                          </div>

                          <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0 mt-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { href: "/quiz", icon: Brain, label: "Start Quiz", desc: "Practice questions", color: "text-blue-400" },
                { href: "/flashcards", icon: Zap, label: "Review Flashcards", desc: "Daily queue", color: "text-amber-400" },
                { href: "/practice-exam", icon: Shield, label: "Practice Exam", desc: "Full simulation", color: "text-rose-400" },
                { href: "/labs", icon: FlaskConical, label: "Lab Exercise", desc: "Hands-on practice", color: "text-emerald-400" },
                { href: "/notes", icon: StickyNote, label: "Add a Note", desc: "Capture insights", color: "text-purple-400" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.href} href={action.href}>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/60 transition-colors group cursor-pointer">
                      <div className="w-7 h-7 rounded-md bg-slate-800 flex items-center justify-center flex-shrink-0">
                        <Icon className={`w-3.5 h-3.5 ${action.color}`} />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-300 group-hover:text-slate-100">
                          {action.label}
                        </div>
                        <div className="text-xs text-slate-600">{action.desc}</div>
                      </div>
                      <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400 ml-auto" />
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          {/* Weak Areas */}
          {weakAreas.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-rose-400" />
                  Weak Areas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {weakAreas.map((area) => {
                  const accuracy =
                    area.totalAttempts > 0
                      ? Math.round(((area.totalAttempts - area.incorrectCount) / area.totalAttempts) * 100)
                      : 0;
                  return (
                    <div key={area.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 truncate max-w-[140px]">
                          {area.domain.name}
                        </span>
                        <span className="text-xs text-rose-400">{accuracy}%</span>
                      </div>
                      <Progress
                        value={accuracy}
                        className="h-1"
                        indicatorClassName="bg-rose-500"
                      />
                    </div>
                  );
                })}
                <Link href="/quiz?mode=weak_areas">
                  <Button variant="outline" size="sm" className="w-full mt-2 text-xs">
                    Practice Weak Areas
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Pinned Notes */}
          {pinnedNotes.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  Pinned Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pinnedNotes.map((note) => (
                  <Link key={note.id} href="/notes">
                    <div className="p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/70 transition-colors cursor-pointer">
                      <div className="flex items-start gap-2">
                        <span className={`text-xs font-medium mt-0.5 ${noteTypeColors[note.noteType] ?? "text-slate-400"}`}>
                          {note.noteType}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-300 mb-1">{note.title}</p>
                      <p className="text-xs text-slate-500 line-clamp-2">{note.content}</p>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
