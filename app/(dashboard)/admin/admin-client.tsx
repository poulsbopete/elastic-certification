"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Download,
  Edit3,
  Info,
  NotebookPen,
  Plus,
  Save,
  Upload,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Topic {
  id: string;
  name: string;
  description: string;
  _count: { questions: number; flashcards: number; labExercises: number };
}

interface Domain {
  id: string;
  name: string;
  description: string;
  weightPercent: number;
  disclaimer: string;
  isEditable: boolean;
  topics: Topic[];
}

interface Cert {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  domains: Domain[];
}

interface Props {
  certs: Cert[];
}

function DomainEditor({ domain }: { domain: Domain }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(domain.name);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In a real app: PATCH /api/admin/domain
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="border border-slate-800 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center gap-3 p-3.5 hover:bg-slate-800/30 text-left transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-200">{name}</span>
            <Badge variant="outline" className="text-xs">{domain.weightPercent}%</Badge>
            {domain.isEditable && <Badge variant="secondary" className="text-xs">Editable</Badge>}
            {saved && <Badge variant="success" className="text-xs">Saved!</Badge>}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{domain.topics.length} topics</p>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-800 bg-slate-900/30"
          >
            <div className="p-4 space-y-4">
              {/* Edit domain name */}
              <div className="flex items-center gap-2">
                {editing ? (
                  <>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex-1 h-8 text-sm"
                    />
                    <Button size="sm" onClick={handleSave} className="gap-1 h-8">
                      <Save className="w-3 h-3" />
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="h-8">
                      Cancel
                    </Button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit domain name
                  </button>
                )}
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-400/80">{domain.disclaimer}</p>
              </div>

              {/* Topics */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Topics</p>
                <div className="space-y-1.5">
                  {domain.topics.map((topic) => (
                    <div key={topic.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/40">
                      <ChevronRight className="w-3 h-3 text-slate-600" />
                      <span className="text-xs text-slate-300 flex-1">{topic.name}</span>
                      <div className="flex gap-2 text-xs text-slate-600">
                        <span>{topic._count.questions}q</span>
                        <span>{topic._count.flashcards}fc</span>
                        <span>{topic._count.labExercises}lab</span>
                      </div>
                    </div>
                  ))}
                  <button className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 px-2.5 py-1.5">
                    <Plus className="w-3 h-3" />
                    Add topic
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AdminClient({ certs }: Props) {
  const handleExportSeed = () => {
    const seedData = certs.map((cert) => ({
      slug: cert.slug,
      name: cert.name,
      domains: cert.domains.map((d) => ({
        name: d.name,
        weightPercent: d.weightPercent,
        topics: d.topics.map((t) => t.name),
      })),
    }));
    const blob = new Blob([JSON.stringify(seedData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "certification-content-export.json";
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Content Editor</h1>
          <p className="text-sm text-slate-400">Edit certification domains, topics, and objectives</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExportSeed}>
            <Download className="w-4 h-4" />
            Export Content
          </Button>
          <Button variant="outline" className="gap-2" disabled>
            <Upload className="w-4 h-4" />
            Import JSON
          </Button>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-400 font-medium mb-1">Sample/Editable Content</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            All domains, topics, questions, and flashcards are fully customizable.
            They are currently seeded with <strong>sample study objectives</strong> —
            always verify against your official Elastic training materials and exam guides.
            Use the editor below to match your actual study materials.
          </p>
        </div>
      </div>

      <Tabs defaultValue={certs[0]?.slug ?? ""}>
        <TabsList className="flex-wrap h-auto gap-1 p-1">
          {certs.map((cert) => (
            <TabsTrigger key={cert.slug} value={cert.slug} className="gap-2 text-xs">
              <span>{cert.icon}</span>
              {cert.shortName}
            </TabsTrigger>
          ))}
        </TabsList>

        {certs.map((cert) => (
          <TabsContent key={cert.slug} value={cert.slug} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <NotebookPen className="w-4 h-4" />
                  {cert.name}
                </CardTitle>
                <p className="text-xs text-slate-500">{cert.domains.length} domains</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {cert.domains.map((domain) => (
                  <DomainEditor key={domain.id} domain={domain} />
                ))}
                <button className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 px-3 py-2 w-full">
                  <Plus className="w-3.5 h-3.5" />
                  Add domain
                </button>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Import from JSON</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-400 mb-3">
            Import certification content from a JSON file. This will add to existing content (not replace).
            See <code className="text-blue-300">prisma/seed.ts</code> for the expected format.
          </p>
          <Button variant="outline" disabled className="gap-2">
            <Upload className="w-4 h-4" />
            Choose JSON File (coming soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
