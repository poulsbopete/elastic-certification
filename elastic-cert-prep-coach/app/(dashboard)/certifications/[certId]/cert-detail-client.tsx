"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDifficultyColor, getReadinessLabel, getStatusColor, getStatusLabel } from "@/lib/utils";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Brain,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FlaskConical,
  Info,
  Shield,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  data: {
    cert: {
      id: string;
      slug: string;
      name: string;
      shortName: string;
      icon: string;
      color: string;
      description: string;
      examDuration: number;
      passingScore: number;
      questionCount: number;
      officialUrl?: string | null;
      domains: Array<{
        id: string;
        name: string;
        description: string;
        weightPercent: number;
        disclaimer: string;
        isEditable: boolean;
        topics: Array<{
          id: string;
          name: string;
          description: string;
          _count: { questions: number; flashcards: number; labExercises: number };
        }>;
        _count: { topics: number };
      }>;
    };
    progress: {
      status: string;
      progressPercent: number;
      readinessScore: number;
      hoursStudied: number;
      examDate?: Date | null;
    } | null;
    weakAreas: Array<{
      id: string;
      incorrectCount: number;
      totalAttempts: number;
      domain: { id: string; name: string };
    }>;
    recentQuizAttempts: Array<{
      id: string;
      score: number;
      startedAt: Date;
      mode: string;
    }>;
    studyPlan: {
      id: string;
      tasks: Array<{
        id: string;
        title: string;
        taskType: string;
        dueDate: Date;
        duration: number;
      }>;
    } | null;
  };
}

function DomainAccordion({ domain, isWeak }: {
  domain: Props["data"]["cert"]["domains"][0];
  isWeak: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`rounded-xl border ${isWeak ? "border-rose-500/30" : "border-slate-800"} overflow-hidden`}>
      <button
        className="w-full flex items-center gap-4 p-4 hover:bg-slate-800/40 transition-colors text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-slate-200">{domain.name}</span>
            <Badge variant="outline" className="text-xs">{domain.weightPercent}%</Badge>
            {isWeak && (
              <Badge variant="destructive" className="text-xs">Weak Area</Badge>
            )}
          </div>
          <p className="text-xs text-slate-500">{domain._count.topics} topics</p>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-t border-slate-800"
        >
          <div className="p-4 bg-slate-900/30">
            <div className="flex items-start gap-2 mb-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-400/80">{domain.disclaimer}</p>
            </div>

            <div className="space-y-2">
              {domain.topics.map((topic) => (
                <div key={topic.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/30">
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <div className="flex-1">
                    <span className="text-xs font-medium text-slate-300">{topic.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    {topic._count.questions > 0 && (
                      <span className="flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        {topic._count.questions}
                      </span>
                    )}
                    {topic._count.flashcards > 0 && (
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {topic._count.flashcards}
                      </span>
                    )}
                    {topic._count.labExercises > 0 && (
                      <span className="flex items-center gap-1">
                        <FlaskConical className="w-3 h-3" />
                        {topic._count.labExercises}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export function CertDetailClient({ data }: Props) {
  const { cert, progress, weakAreas, recentQuizAttempts, studyPlan } = data;
  const status = progress?.status ?? "not_started";
  const readiness = progress?.readinessScore ?? 0;
  const readinessInfo = getReadinessLabel(readiness);
  const weakDomainIds = new Set(weakAreas.map((w) => w.domain.id));

  const totalQuestions = cert.domains.reduce(
    (acc, d) => acc + d.topics.reduce((ta, t) => ta + t._count.questions, 0),
    0
  );
  const totalFlashcards = cert.domains.reduce(
    (acc, d) => acc + d.topics.reduce((ta, t) => ta + t._count.flashcards, 0),
    0
  );
  const totalLabs = cert.domains.reduce(
    (acc, d) => acc + d.topics.reduce((ta, t) => ta + t._count.labExercises, 0),
    0
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-800 p-6" style={{ borderLeftColor: cert.color, borderLeftWidth: 4 }}>
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{ backgroundColor: `${cert.color}18` }}
          >
            {cert.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-xl font-bold text-slate-100">{cert.name}</h1>
              <Badge variant="secondary">{cert.shortName}</Badge>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(status)}`}>
                {getStatusLabel(status)}
              </span>
            </div>
            <p className="text-sm text-slate-400 mb-3">{cert.description}</p>
            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
              <span>{cert.examDuration} min exam</span>
              <span>{cert.questionCount} questions</span>
              <span>{cert.passingScore}% to pass</span>
              {cert.officialUrl && (
                <a
                  href={cert.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                >
                  Official page <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className={`text-2xl font-bold ${readinessInfo.color}`}>{readiness}%</div>
            <div className={`text-xs ${readinessInfo.color}`}>{readinessInfo.label}</div>
          </div>
        </div>

        {/* Progress bars */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Study Progress</span>
              <span>{progress?.progressPercent ?? 0}%</span>
            </div>
            <Progress value={progress?.progressPercent ?? 0} className="h-1.5" />
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Exam Readiness</span>
              <span>{readiness}%</span>
            </div>
            <Progress
              value={readiness}
              className="h-1.5"
              indicatorClassName={readiness >= 70 ? "bg-emerald-500" : readiness >= 40 ? "bg-amber-500" : "bg-rose-500"}
            />
          </div>
        </div>
      </div>

      {/* Content stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Domains", value: cert.domains.length, icon: "🗂️" },
          { label: "Questions", value: totalQuestions, icon: "❓" },
          { label: "Flashcards", value: totalFlashcards, icon: "⚡" },
          { label: "Labs", value: totalLabs, icon: "🔬" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <div className="text-xl mb-1">{stat.icon}</div>
              <div className="text-lg font-bold text-slate-100">{stat.value}</div>
              <div className="text-xs text-slate-500">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <Link href={`/quiz?certId=${cert.id}`}>
          <Button className="gap-2">
            <Brain className="w-4 h-4" />
            Practice Quiz
          </Button>
        </Link>
        <Link href={`/practice-exam?certId=${cert.id}`}>
          <Button variant="outline" className="gap-2">
            <Shield className="w-4 h-4" />
            Practice Exam
          </Button>
        </Link>
        <Link href={`/flashcards?certId=${cert.id}`}>
          <Button variant="outline" className="gap-2">
            <BookOpen className="w-4 h-4" />
            Flashcards
          </Button>
        </Link>
        <Link href={`/labs?certId=${cert.id}`}>
          <Button variant="outline" className="gap-2">
            <FlaskConical className="w-4 h-4" />
            Labs
          </Button>
        </Link>
        {!studyPlan && (
          <Link href={`/study-plan?certId=${cert.id}`}>
            <Button variant="success" className="gap-2">
              Create Study Plan <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        )}
      </div>

      <Tabs defaultValue="domains">
        <TabsList>
          <TabsTrigger value="domains">Domains & Topics</TabsTrigger>
          <TabsTrigger value="performance">My Performance</TabsTrigger>
          {studyPlan && <TabsTrigger value="plan">Study Plan</TabsTrigger>}
        </TabsList>

        <TabsContent value="domains" className="space-y-3">
          {cert.domains.map((domain) => (
            <DomainAccordion
              key={domain.id}
              domain={domain}
              isWeak={weakDomainIds.has(domain.id)}
            />
          ))}
        </TabsContent>

        <TabsContent value="performance">
          {recentQuizAttempts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Brain className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 mb-4">No quiz attempts yet for this certification.</p>
                <Link href={`/quiz?certId=${cert.id}`}>
                  <Button>Start Your First Quiz</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {weakAreas.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      Weak Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {weakAreas.map((area) => {
                      const accuracy =
                        area.totalAttempts > 0
                          ? Math.round(((area.totalAttempts - area.incorrectCount) / area.totalAttempts) * 100)
                          : 0;
                      return (
                        <div key={area.id}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">{area.domain.name}</span>
                            <span className="text-rose-400">{accuracy}% accuracy</span>
                          </div>
                          <Progress value={accuracy} className="h-1.5" indicatorClassName="bg-rose-500" />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recent Quiz Attempts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recentQuizAttempts.map((attempt) => (
                    <div key={attempt.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {attempt.mode.replace("_", " ")}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {new Date(attempt.startedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          attempt.score >= 70 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {Math.round(attempt.score)}%
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {studyPlan && (
          <TabsContent value="plan">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Upcoming Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {studyPlan.tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30">
                    <div className={`w-2 h-2 rounded-full ${
                      new Date(task.dueDate) < new Date() ? "bg-rose-400" : "bg-blue-400"
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm text-slate-300">{task.title}</p>
                      <p className="text-xs text-slate-500">
                        Due {new Date(task.dueDate).toLocaleDateString()} · {task.duration}m
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {task.taskType.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
                <Link href="/study-plan">
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    View Full Plan <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
