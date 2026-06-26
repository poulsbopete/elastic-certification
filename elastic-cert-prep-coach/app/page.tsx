import Link from "next/link";
import { ArrowRight, Brain, FlaskConical, Gauge, Shield, Sparkles, Trophy, Zap } from "lucide-react";

const certs = [
  { name: "Elastic Certified Engineer", icon: "⚙️", color: "#0077CC", level: "Core" },
  { name: "Elastic Certified Observability Engineer", icon: "📡", color: "#00A88E", level: "Specialist" },
  { name: "Elastic Certified SIEM Analyst", icon: "🛡️", color: "#C4262E", level: "Specialist" },
  { name: "Elastic Certified Analyst", icon: "📊", color: "#F0AB00", level: "Analyst" },
  { name: "Elastic GenAI Associate", icon: "🤖", color: "#7B61FF", level: "Associate" },
];

const features = [
  { icon: Brain, title: "Adaptive Quiz Engine", desc: "Multiple modes: practice, timed, domain-specific, weak-areas only, and mixed across all certs." },
  { icon: Shield, title: "Practice Exam Simulator", desc: "Full-length timed exams with domain score breakdowns, confidence gap analysis, and remediation plans." },
  { icon: Zap, title: "Spaced Repetition Flashcards", desc: "SM-2 algorithm scheduling with daily review queues, cram mode, and retention tracking." },
  { icon: FlaskConical, title: "Lab Planner", desc: "Hands-on lab checklists with readiness views, estimated time, prerequisites, and notes." },
  { icon: Gauge, title: "Readiness Algorithm", desc: "Weighted score from quiz accuracy, flashcard retention, lab completion, and exam performance." },
  { icon: Sparkles, title: "AI Study Coach", desc: "Get session suggestions, explanations, mini quizzes, and next-action recommendations." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Nav */}
      <nav className="border-b border-slate-800 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <Gauge className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-100">Elastic Cert Prep Coach</span>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Open App <ArrowRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs text-blue-400 mb-8">
          <Sparkles className="w-3 h-3" />
          5 Elastic Certifications. One Focused Study Platform.
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-slate-100 leading-tight mb-6">
          Pass Your Elastic
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            Certification Exams
          </span>
        </h1>

        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
          A personalized study coach with adaptive quizzes, spaced repetition flashcards,
          practice exam simulations, hands-on lab planning, and an AI study coach.
          Built for serious Elastic engineers.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-base"
          >
            Start Studying <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/quiz"
            className="flex items-center gap-2 border border-slate-700 hover:border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-8 py-3 rounded-xl transition-colors text-base"
          >
            Quick Quiz
          </Link>
        </div>
      </section>

      {/* Certification Tracks */}
      <section className="max-w-5xl mx-auto px-8 pb-16">
        <h2 className="text-center text-sm font-semibold text-slate-500 uppercase tracking-widest mb-6">
          Certification Tracks
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {certs.map((cert) => (
            <div
              key={cert.name}
              className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5"
            >
              <span className="text-xl">{cert.icon}</span>
              <div>
                <div className="text-sm font-medium text-slate-200">{cert.name}</div>
                <div className="text-xs text-slate-500">{cert.level}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-8 pb-24">
        <h2 className="text-2xl font-bold text-slate-100 text-center mb-12">
          Everything you need to pass
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-6"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-semibold text-slate-100 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-800 py-16 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span className="text-sm text-slate-400">All content is editable — customize objectives to match official Elastic training materials</span>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Open Dashboard <ArrowRight className="w-5 h-5" />
        </Link>
      </section>
    </div>
  );
}
