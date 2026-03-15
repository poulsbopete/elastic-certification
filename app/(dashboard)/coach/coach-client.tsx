"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  Bot,
  Brain,
  Lightbulb,
  Loader2,
  MessageSquare,
  Sparkles,
  Target,
  Wand2,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Props {
  data: {
    certProgresses: Array<{
      status: string;
      readinessScore: number;
      cert: { name: string; shortName: string; icon: string; color: string };
    }>;
    weakAreas: Array<{ domain: { name: string } }>;
    studyStreak: number;
    hoursThisWeek: number;
    activeCert: {
      readinessScore: number;
      cert: { name: string; shortName: string; icon: string; color: string };
    } | null;
  };
}

const quickActions = [
  {
    action: "study_suggestion",
    label: "What should I study today?",
    icon: Lightbulb,
    color: "text-amber-400",
  },
  {
    action: "next_action",
    label: "What's my next best action?",
    icon: Target,
    color: "text-blue-400",
  },
  {
    action: "mini_quiz",
    label: "Create a mini quiz",
    icon: Brain,
    color: "text-purple-400",
    needsTopic: true,
  },
];

export function CoachClient({ data }: Props) {
  const { certProgresses, weakAreas, studyStreak, hoursThisWeek, activeCert } = data;
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hey! I'm your AI Study Coach 🎓\n\nI'm currently running in **mock mode** — I give you realistic study suggestions and guidance based on your progress data. To connect a real AI model (OpenAI, Anthropic, etc.), check the \`lib/mock-ai.ts\` integration points.\n\nHow can I help you study smarter today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [topicInput, setTopicInput] = useState("");
  const [showTopicInput, setShowTopicInput] = useState(false);

  const weakDomainNames = weakAreas.map((w) => w.domain.name);

  const sendMessage = async (userText: string, action: string, payload: object) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });
      const data = await res.json();

      const result = typeof data.result === "string"
        ? data.result
        : JSON.stringify(data.result, null, 2);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I ran into an issue. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }

    setIsLoading(false);
  };

  const handleQuickAction = async (qa: typeof quickActions[0]) => {
    if (qa.needsTopic) {
      setShowTopicInput(true);
      return;
    }

    const payload =
      qa.action === "study_suggestion"
        ? {
            certName: activeCert?.cert.name ?? "Elastic certifications",
            weakDomains: weakDomainNames,
            studyStreak,
            hoursThisWeek,
            readinessScore: activeCert?.readinessScore ?? 0,
          }
        : {
            weakDomains: weakDomainNames,
            recentActivity: `${hoursThisWeek}h studied this week, ${studyStreak} day streak`,
          };

    await sendMessage(qa.label, qa.action, payload);
  };

  const handleMiniQuiz = async () => {
    if (!topicInput.trim()) return;
    await sendMessage(
      `Generate a mini quiz on: ${topicInput}`,
      "mini_quiz",
      { topic: topicInput }
    );
    setTopicInput("");
    setShowTopicInput(false);
  };

  const handleChat = async () => {
    if (!input.trim() || isLoading) return;
    await sendMessage(
      input,
      "study_suggestion",
      {
        certName: activeCert?.cert.name ?? "Elastic certifications",
        weakDomains: weakDomainNames,
        studyStreak,
        hoursThisWeek,
        readinessScore: activeCert?.readinessScore ?? 0,
        userQuestion: input,
      }
    );
    setInput("");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">AI Study Coach</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Mock mode active</span>
            <Badge variant="secondary" className="text-xs">Plug in real AI via lib/mock-ai.ts</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat */}
        <div className="lg:col-span-2 space-y-4">
          {/* Messages */}
          <Card className="h-[500px] flex flex-col">
            <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-800 text-slate-200"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                    </div>
                    <div className="bg-slate-800 rounded-xl px-4 py-3 text-sm text-slate-400">
                      Thinking...
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex gap-2 mt-4">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChat(); } }}
                  placeholder="Ask your study coach anything..."
                  disabled={isLoading}
                />
                <Button onClick={handleChat} disabled={isLoading || !input.trim()} size="icon">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((qa) => {
              const Icon = qa.icon;
              return (
                <button
                  key={qa.action}
                  onClick={() => handleQuickAction(qa)}
                  disabled={isLoading}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-700 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/60 transition-all text-left disabled:opacity-50"
                >
                  <Icon className={`w-4 h-4 ${qa.color} flex-shrink-0`} />
                  <span className="text-sm text-slate-300">{qa.label}</span>
                </button>
              );
            })}
          </div>

          {showTopicInput && (
            <div className="flex gap-2">
              <Input
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="Enter topic (e.g. ILM policies, EQL sequences...)"
                onKeyDown={(e) => e.key === "Enter" && handleMiniQuiz()}
              />
              <Button onClick={handleMiniQuiz}>Generate</Button>
              <Button variant="ghost" onClick={() => setShowTopicInput(false)}>Cancel</Button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Study context */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Your Study Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Study Streak</span>
                <span className="text-orange-400 font-medium">{studyStreak} days 🔥</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Hours This Week</span>
                <span className="text-blue-400 font-medium">{hoursThisWeek}h</span>
              </div>

              {activeCert && (
                <div className="mt-3 p-3 rounded-lg bg-slate-800/30">
                  <p className="text-xs text-slate-500 mb-1">Active Certification</p>
                  <div className="flex items-center gap-2">
                    <span>{activeCert.cert.icon}</span>
                    <span className="text-xs font-medium text-slate-300">{activeCert.cert.shortName}</span>
                    <span className="text-xs text-blue-400 ml-auto">{activeCert.readinessScore}% ready</span>
                  </div>
                  <Progress value={activeCert.readinessScore} className="mt-2 h-1" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weak areas */}
          {weakAreas.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-rose-400" />
                  Focus Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {weakAreas.slice(0, 5).map((area, i) => (
                    <div key={i} className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                      {area.domain.name}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cert readiness */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Cert Readiness</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {certProgresses.map((cp) => (
                <div key={cp.cert.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{cp.cert.shortName}</span>
                    <span className="text-slate-400">{cp.readinessScore}%</span>
                  </div>
                  <Progress value={cp.readinessScore} className="h-1" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Integration note */}
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <Wand2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-blue-400 mb-1">Add Real AI</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Implement the <code className="text-blue-300">AiProvider</code> interface in{" "}
                    <code className="text-blue-300">lib/mock-ai.ts</code> to connect OpenAI, Anthropic, or any LLM.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
