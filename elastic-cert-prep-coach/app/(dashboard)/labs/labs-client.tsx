"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getDifficultyColor } from "@/lib/utils";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  FlaskConical,
  ListChecks,
  Pencil,
  Save,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Lab {
  id: string;
  title: string;
  goal: string;
  steps: string;
  prerequisites: string;
  estimatedMins: number;
  difficulty: string;
  notes: string;
  isCompleted: boolean;
  isEditable: boolean;
  topic: {
    name: string;
    domain: { name: string; cert: { name: string; icon: string; color: string; id: string } };
  };
}

interface Props {
  data: {
    labs: Lab[];
    certs: Array<{ id: string; name: string; icon: string; slug: string }>;
    completed: number;
    totalMins: number;
  };
}

function LabCard({ lab }: { lab: Lab }) {
  const [expanded, setExpanded] = useState(false);
  const [isCompleted, setIsCompleted] = useState(lab.isCompleted);
  const [notes, setNotes] = useState(lab.notes);
  const [editingNotes, setEditingNotes] = useState(false);
  const [saving, setSaving] = useState(false);

  const steps: string[] = JSON.parse(lab.steps || "[]");
  const prereqs: string[] = JSON.parse(lab.prerequisites || "[]");

  const toggleComplete = async () => {
    const next = !isCompleted;
    setIsCompleted(next);
    await fetch("/api/labs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ labId: lab.id, isCompleted: next }),
    });
  };

  const saveNotes = async () => {
    setSaving(true);
    await fetch("/api/labs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ labId: lab.id, notes }),
    });
    setSaving(false);
    setEditingNotes(false);
  };

  return (
    <Card className={`transition-all ${isCompleted ? "border-emerald-500/30" : "hover:border-slate-700"}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <button onClick={toggleComplete} className="mt-0.5 flex-shrink-0">
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className={`text-sm font-medium ${isCompleted ? "text-slate-500 line-through" : "text-slate-200"}`}>
                  {lab.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{lab.goal}</p>
              </div>
              <button onClick={() => setExpanded(!expanded)}>
                {expanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getDifficultyColor(lab.difficulty)}`}>
                {lab.difficulty}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-600">
                <Clock className="w-3 h-3" />
                {lab.estimatedMins}m
              </span>
              <span className="text-xs text-slate-600">{lab.topic.domain.name}</span>
            </div>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-4 overflow-hidden"
                >
                  {prereqs.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Prerequisites</p>
                      <ul className="space-y-1">
                        {prereqs.map((p, i) => (
                          <li key={i} className="text-xs text-slate-400 flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-slate-600" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {steps.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Steps</p>
                      <ol className="space-y-2">
                        {steps.map((step, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded bg-slate-800 text-slate-400 text-xs flex items-center justify-center flex-shrink-0 font-medium">
                              {i + 1}
                            </span>
                            <span className="text-xs text-slate-400">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Notes section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">My Notes</p>
                      {!editingNotes ? (
                        <button
                          onClick={() => setEditingNotes(true)}
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <Pencil className="w-3 h-3" />
                          Edit
                        </button>
                      ) : (
                        <button
                          onClick={saveNotes}
                          disabled={saving}
                          className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                        >
                          <Save className="w-3 h-3" />
                          {saving ? "Saving..." : "Save"}
                        </button>
                      )}
                    </div>
                    {editingNotes ? (
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full h-24 text-xs bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-300 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Add your notes, observations, and gotchas..."
                      />
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        {notes || "No notes yet. Click edit to add observations."}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LabsClient({ data }: Props) {
  const { labs, certs, completed, totalMins } = data;
  const [filterCertId, setFilterCertId] = useState("");

  const filteredLabs = filterCertId
    ? labs.filter((l) => l.topic.domain.cert.id === filterCertId)
    : labs;

  const completionPercent = labs.length > 0 ? Math.round((completed / labs.length) * 100) : 0;

  // Group by cert
  const byCert: Record<string, { cert: Lab["topic"]["domain"]["cert"]; labs: Lab[] }> = {};
  filteredLabs.forEach((lab) => {
    const certName = lab.topic.domain.cert.name;
    if (!byCert[certName]) byCert[certName] = { cert: lab.topic.domain.cert, labs: [] };
    byCert[certName].labs.push(lab);
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Lab Planner</h1>
        <p className="text-sm text-slate-400">Hands-on practice exercises</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-100">{completed}/{labs.length}</div>
            <div className="text-xs text-slate-500 mt-1">Labs Completed</div>
            <Progress value={completionPercent} className="mt-2 h-1" indicatorClassName="bg-emerald-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-100">{Math.round(totalMins / 60)}h</div>
            <div className="text-xs text-slate-500 mt-1">Lab Time Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-100">
              {labs.filter((l) => !l.isCompleted).length}
            </div>
            <div className="text-xs text-slate-500 mt-1">Labs Remaining</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Select value={filterCertId} onValueChange={setFilterCertId}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="All certifications" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All certifications</SelectItem>
          {certs.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Labs by cert */}
      <div className="space-y-8">
        {Object.entries(byCert).map(([certName, { cert, labs: certLabs }]) => {
          const certCompleted = certLabs.filter((l) => l.isCompleted).length;
          return (
            <div key={certName}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">{cert.icon}</span>
                <h2 className="text-sm font-semibold text-slate-300">{certName}</h2>
                <Badge variant="secondary" className="text-xs">
                  {certCompleted}/{certLabs.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {certLabs.map((lab) => (
                  <LabCard key={lab.id} lab={lab} />
                ))}
              </div>
            </div>
          );
        })}
        {filteredLabs.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FlaskConical className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No labs found.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
