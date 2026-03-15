"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getReadinessLabel } from "@/lib/utils";
import {
  Activity,
  Clock,
  Flame,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  data: {
    streak: number;
    totalStudyHours: number;
    quizAccuracy: number;
    flashcardsReviewed: number;
    flashcardRetention: number;
    certProgresses: Array<{
      status: string;
      readinessScore: number;
      progressPercent: number;
      hoursStudied: number;
      cert: { name: string; shortName: string; icon: string; color: string };
    }>;
    weakAreas: Array<{
      id: string;
      incorrectCount: number;
      totalAttempts: number;
      domain: { name: string; cert: { name: string; color: string } };
    }>;
    heatmapData: Array<{ date: string; minutes: number }>;
    weeklyData: Array<{ week: string; hours: number }>;
    domainScores: Array<{ name: string; accuracy: number }>;
    quizTrend: Array<{ attempt: number; score: number; date: string }>;
    practiceExamAttempts: Array<{
      id: string;
      score: number;
      passed: boolean;
      timeTakenMins: number;
      startedAt: Date;
    }>;
  };
}

const CustomTooltipStyle = {
  backgroundColor: "#1e293b",
  border: "1px solid #334155",
  borderRadius: "8px",
  color: "#e2e8f0",
  fontSize: "12px",
};

export function AnalyticsClient({ data }: Props) {
  const {
    streak,
    totalStudyHours,
    quizAccuracy,
    flashcardsReviewed,
    flashcardRetention,
    certProgresses,
    weakAreas,
    heatmapData,
    weeklyData,
    domainScores,
    quizTrend,
  } = data;

  const getHeatmapColor = (mins: number) => {
    if (mins === 0) return "bg-slate-800";
    if (mins < 30) return "bg-blue-900";
    if (mins < 60) return "bg-blue-700";
    if (mins < 120) return "bg-blue-500";
    return "bg-blue-400";
  };

  const statCards = [
    { label: "Study Streak", value: streak, suffix: " days", icon: Flame, color: "text-orange-400", bg: "bg-orange-400/10" },
    { label: "Total Hours", value: totalStudyHours, suffix: "h", icon: Clock, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Quiz Accuracy", value: quizAccuracy, suffix: "%", icon: Target, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Flashcard Retention", value: flashcardRetention, suffix: "%", icon: Zap, color: "text-amber-400", bg: "bg-amber-400/10" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Analytics</h1>
        <p className="text-sm text-slate-400">Your study performance at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-500">{card.label}</span>
                  <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-100">
                  {card.value}
                  <span className="text-sm font-normal text-slate-500 ml-0.5">{card.suffix}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            Study Activity — Last 30 Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-1.5 flex-wrap">
            {heatmapData.map((day) => (
              <div
                key={day.date}
                className={`heatmap-cell w-6 h-6 ${getHeatmapColor(day.minutes)} rounded`}
                title={`${day.date}: ${day.minutes}m`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-slate-600">
            <span>Less</span>
            {["bg-slate-800", "bg-blue-900", "bg-blue-700", "bg-blue-500", "bg-blue-400"].map((c) => (
              <div key={c} className={`w-4 h-4 rounded ${c}`} />
            ))}
            <span>More</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly study hours chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Study Hours by Week</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week" tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                <Tooltip contentStyle={CustomTooltipStyle} />
                <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quiz score trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quiz Score Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {quizTrend.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">
                No quiz data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={quizTrend} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Domain accuracy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Domain Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            {domainScores.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">No quiz data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={domainScores} layout="vertical" margin={{ top: 4, right: 30, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} width={120} />
                  <Tooltip contentStyle={CustomTooltipStyle} formatter={(v) => [`${v}%`, "Accuracy"]} />
                  <Bar
                    dataKey="accuracy"
                    radius={[0, 4, 4, 0]}
                    fill="#6366f1"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Cert readiness */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Certification Readiness
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {certProgresses.map((cp) => {
              const readinessInfo = getReadinessLabel(cp.readinessScore);
              return (
                <div key={cp.cert.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{cp.cert.icon}</span>
                      <span className="text-xs text-slate-400">{cp.cert.shortName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${readinessInfo.color}`}>{readinessInfo.label}</span>
                      <span className={`text-sm font-bold ${readinessInfo.color}`}>{cp.readinessScore}%</span>
                    </div>
                  </div>
                  <Progress
                    value={cp.readinessScore}
                    className="h-1.5"
                    indicatorClassName={cp.readinessScore >= 70 ? "bg-emerald-500" : cp.readinessScore >= 40 ? "bg-amber-500" : "bg-rose-500"}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Weak areas */}
      {weakAreas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Top Weak Areas (by incorrect answers)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {weakAreas.map((area) => {
                const accuracy = area.totalAttempts > 0
                  ? Math.round(((area.totalAttempts - area.incorrectCount) / area.totalAttempts) * 100)
                  : 0;
                return (
                  <div key={area.id} className="p-3 rounded-lg bg-slate-800/30">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="text-xs font-medium text-slate-300">{area.domain.name}</p>
                        <p className="text-xs text-slate-600">{area.domain.cert.name}</p>
                      </div>
                      <span className={`text-sm font-bold ${accuracy < 50 ? "text-rose-400" : accuracy < 70 ? "text-amber-400" : "text-emerald-400"}`}>
                        {accuracy}%
                      </span>
                    </div>
                    <Progress
                      value={accuracy}
                      className="h-1"
                      indicatorClassName={accuracy < 50 ? "bg-rose-500" : accuracy < 70 ? "bg-amber-500" : "bg-emerald-500"}
                    />
                    <p className="text-xs text-slate-600 mt-1">
                      {area.incorrectCount} incorrect / {area.totalAttempts} attempts
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
