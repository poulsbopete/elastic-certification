"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertTriangle,
  BookOpen,
  Code2,
  MessageSquare,
  Pencil,
  Pin,
  Plus,
  RotateCcw,
  Search,
  Skull,
  StickyNote,
  Terminal,
  Trash2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Note {
  id: string;
  title: string;
  content: string;
  noteType: string;
  certId: string | null;
  tags: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Props {
  data: {
    notes: Note[];
    certs: Array<{ id: string; name: string; icon: string }>;
    userId: string;
  };
}

const noteTypes = [
  { value: "note", label: "Note", icon: StickyNote, color: "text-slate-400" },
  { value: "mistake", label: "Mistake", icon: AlertTriangle, color: "text-rose-400" },
  { value: "snippet", label: "Snippet", icon: Code2, color: "text-blue-400" },
  { value: "command", label: "Command", icon: Terminal, color: "text-amber-400" },
  { value: "investigation", label: "Investigation", icon: BookOpen, color: "text-purple-400" },
];

const noteTypeIcons: Record<string, typeof StickyNote> = {
  note: StickyNote,
  mistake: AlertTriangle,
  snippet: Code2,
  command: Terminal,
  investigation: BookOpen,
};

const noteTypeColors: Record<string, string> = {
  note: "text-slate-400",
  mistake: "text-rose-400",
  snippet: "text-blue-400",
  command: "text-amber-400",
  investigation: "text-purple-400",
};

export function NotesClient({ data }: Props) {
  const { certs } = data;
  const [notes, setNotes] = useState<Note[]>(data.notes);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCert, setFilterCert] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    noteType: "note",
    certId: "",
    tags: "",
    isPinned: false,
  });

  const filtered = notes.filter((n) => {
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.content.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType && n.noteType !== filterType) return false;
    if (filterCert && n.certId !== filterCert) return false;
    return true;
  });

  const pinned = filtered.filter((n) => n.isPinned);
  const unpinned = filtered.filter((n) => !n.isPinned);

  const resetForm = () => setForm({ title: "", content: "", noteType: "note", certId: "", tags: "", isPinned: false });

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        certId: form.certId || null,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      }),
    });
    const note = await res.json();
    setNotes([note, ...notes]);
    resetForm();
    setIsCreating(false);
  };

  const handleTogglePin = async (note: Note) => {
    await fetch("/api/notes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: note.id, isPinned: !note.isPinned }),
    });
    setNotes(notes.map((n) => n.id === note.id ? { ...n, isPinned: !n.isPinned } : n));
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/notes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotes(notes.filter((n) => n.id !== id));
  };

  function NoteCard({ note }: { note: Note }) {
    const Icon = noteTypeIcons[note.noteType] ?? StickyNote;
    const color = noteTypeColors[note.noteType] ?? "text-slate-400";
    const tags: string[] = JSON.parse(note.tags || "[]");

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <Card className={`hover:border-slate-700 transition-all group ${note.isPinned ? "border-amber-500/30" : ""}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Icon className={`w-3.5 h-3.5 ${color} flex-shrink-0`} />
                <span className="text-sm font-medium text-slate-200">{note.title}</span>
                {note.isPinned && <Pin className="w-3 h-3 text-amber-400 fill-amber-400" />}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleTogglePin(note)} title="Toggle pin">
                  <Pin className={`w-3.5 h-3.5 ${note.isPinned ? "text-amber-400" : "text-slate-600 hover:text-slate-400"}`} />
                </button>
                <button onClick={() => handleDelete(note.id)} title="Delete">
                  <Trash2 className="w-3.5 h-3.5 text-slate-600 hover:text-rose-400" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line line-clamp-4">
              {note.content}
            </p>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag) => (
                  <span key={tag} className="text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              <span className={`text-xs capitalize ${color} font-medium`}>{note.noteType}</span>
              <span className="text-xs text-slate-600">
                {new Date(note.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Notes & Journal</h1>
          <p className="text-sm text-slate-400">{notes.length} notes · {pinned.length} pinned</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Note
        </Button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className="border-blue-500/30">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-200">New Note</h2>
                  <button onClick={() => { setIsCreating(false); resetForm(); }}>
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                <Input
                  placeholder="Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />

                <Textarea
                  placeholder="Content... (markdown-ish — paste code, commands, notes, or 'the thing I keep forgetting'"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="h-32"
                />

                <div className="grid grid-cols-2 gap-3">
                  <Select value={form.noteType} onValueChange={(v) => setForm({ ...form, noteType: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {noteTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          <span className={t.color}>{t.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={form.certId} onValueChange={(v) => setForm({ ...form, certId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Certification (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No certification</SelectItem>
                      {certs.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Input
                  placeholder="Tags (comma-separated)"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isPinned}
                      onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                      className="rounded"
                    />
                    Pin this note
                  </label>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => { setIsCreating(false); resetForm(); }}>Cancel</Button>
                    <Button onClick={handleCreate}>Save Note</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Search notes..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All types</SelectItem>
            {noteTypes.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterCert} onValueChange={setFilterCert}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All certs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All certifications</SelectItem>
            {certs.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(search || filterType || filterCert) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSearch(""); setFilterType(""); setFilterCert(""); }}
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Mistake section */}
      {!filterType && !search && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Skull className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm font-semibold text-rose-400">Stupid Mistakes I Shall Never Repeat Again</h2>
          </div>
          {notes.filter((n) => n.noteType === "mistake").length === 0 ? (
            <p className="text-xs text-slate-500 italic">No mistake notes yet. Start logging the things that keep tripping you up.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <AnimatePresence>
                {notes
                  .filter((n) => n.noteType === "mistake")
                  .slice(0, 4)
                  .map((note) => (
                    <NoteCard key={note.id} note={note} />
                  ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* Pinned */}
      {pinned.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1">
            <Pin className="w-3 h-3 text-amber-400" />
            Pinned
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AnimatePresence>
              {pinned.map((note) => <NoteCard key={note.id} note={note} />)}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* All notes */}
      <div>
        {pinned.length > 0 && (
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">All Notes</h2>
        )}
        {unpinned.length === 0 && pinned.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <StickyNote className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 mb-4">No notes yet. Start capturing what you learn!</p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Note
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AnimatePresence>
              {unpinned.map((note) => <NoteCard key={note.id} note={note} />)}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
