# ⚡ Elastic Cert Prep Coach

A production-ready, full-stack study platform for all five Elastic certifications. Built with Next.js 15, TypeScript, Tailwind CSS, Prisma, and SQLite — deployable to Vercel in minutes.

> **Disclaimer:** All sample study objectives, domains, and topics included in this app are editable placeholders. Always verify against your official Elastic training materials and exam guides.

---

## 🎯 Supported Certifications

| Cert | Abbreviation | Icon |
|------|--------------|------|
| Elastic Certified Engineer | ECE | ⚙️ |
| Elastic Certified Observability Engineer | ECOE | 📡 |
| Elastic Certified SIEM Analyst | ECSA | 🛡️ |
| Elastic Certified Analyst | ECA | 📊 |
| Elastic GenAI Associate Accreditation | EGAA | 🤖 |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Local Development

```bash
# 1. Clone and install
git clone <your-repo-url>
cd elastic-cert-prep-coach
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env if needed (DATABASE_URL defaults to SQLite)

# 3. Initialize database
npx prisma migrate dev --name init

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```env
DATABASE_URL="file:./prisma/dev.db"
```

For Postgres (production), change to:
```env
DATABASE_URL="postgresql://user:password@host:5432/elastic_cert_coach"
```
Then update `prisma/schema.prisma`: change `provider = "sqlite"` to `provider = "postgresql"` and run `prisma migrate deploy`.

---

## 📁 Project Structure

```
elastic-cert-prep-coach/
├── app/
│   ├── (dashboard)/           # Main app layout (sidebar + topbar)
│   │   ├── dashboard/         # Main dashboard
│   │   ├── certifications/    # Cert detail pages
│   │   ├── study-plan/        # Study plan generator
│   │   ├── quiz/              # Quiz engine
│   │   ├── practice-exam/     # Full exam simulator
│   │   ├── flashcards/        # Spaced repetition flashcards
│   │   ├── labs/              # Lab planner
│   │   ├── notes/             # Notes & journal
│   │   ├── analytics/         # Progress analytics
│   │   ├── coach/             # AI Study Coach
│   │   ├── admin/             # Content editor
│   │   └── settings/          # User settings
│   ├── api/                   # API routes
│   │   ├── certs/             # Certification data
│   │   ├── quiz/              # Quiz engine + answer submission
│   │   ├── flashcards/        # Spaced repetition reviews
│   │   ├── notes/             # Note CRUD
│   │   ├── labs/              # Lab completion tracking
│   │   ├── study-plan/        # Plan generation
│   │   ├── analytics/         # Dashboard metrics
│   │   └── coach/             # AI coach endpoint
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Landing page
├── components/
│   ├── ui/                    # shadcn-style component library
│   ├── layout/                # Sidebar, Topbar
│   └── shared/                # Pomodoro, ThemeProvider
├── lib/
│   ├── db.ts                  # Prisma client singleton
│   ├── utils.ts               # Helpers (readiness calc, formatting)
│   └── mock-ai.ts             # AI provider abstraction (mock + interface)
├── store/
│   └── useAppStore.ts         # Zustand global state
├── types/
│   └── index.ts               # TypeScript interfaces
├── prisma/
│   ├── schema.prisma          # Database schema (18 models)
│   └── seed.ts                # Seed data for all 5 certs
└── README.md
```

---

## ✏️ Editing Certification Domains & Topics

All content is editable in two ways:

### Via the Admin UI
1. Go to `/admin` (Content Editor in sidebar)
2. Select a certification tab
3. Expand a domain to edit its name and topics
4. Export your edits as JSON for backup

### Via the Seed File
Edit `prisma/seed.ts` directly and re-run:
```bash
npx prisma migrate reset --force
```
The seed file contains clearly labeled domains for each certification under functions like `seedCertDomains()`.

### Via JSON Import
Export your current content structure from the Admin page, edit it, then re-import (import functionality is marked as "coming soon" in the UI but the seed format is documented in `prisma/seed.ts`).

---

## 🤖 Adding a Real AI Provider

The AI Study Coach is wired to `lib/mock-ai.ts` which implements the `AiProvider` interface with deterministic mock responses.

To plug in a real LLM:

### OpenAI Example

```typescript
// lib/mock-ai.ts — replace MockAiProvider with:

import OpenAI from "openai";

class OpenAiProvider implements AiProvider {
  private client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async generateStudySuggestion(ctx: StudyContext) {
    const prompt = `You are a study coach for Elastic certifications.
    The student is studying: ${ctx.certName}
    Weak areas: ${ctx.weakDomains.join(", ")}
    Readiness score: ${ctx.readinessScore}%
    Study streak: ${ctx.studyStreak} days
    
    Give a focused, motivating study suggestion (2-3 sentences max).`;

    const res = await this.client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
    });
    return res.choices[0].message.content ?? "";
  }

  // ... implement other methods from AiProvider interface
}

export const aiProvider: AiProvider = new OpenAiProvider();
```

Then add to `.env`:
```env
OPENAI_API_KEY=sk-...
```

The interface supports: `generateStudySuggestion`, `explainQuestion`, `generateQuizQuestions`, `suggestNextAction`, `generateMiniQuiz`.

---

## 🚢 Deployment

### Vercel (Recommended)

> **Note:** SQLite is ephemeral on Vercel (filesystem is read-only in serverless). For production Vercel deployment, switch to Postgres or PlanetScale.

**Option A: Vercel + Postgres (production)**
1. Create a Postgres database in Vercel Dashboard
2. Copy connection string to environment variables
3. Update `prisma/schema.prisma`: `provider = "postgresql"`
4. Push and deploy — Vercel auto-runs `prisma generate` via `postinstall`

**Option B: Local/Self-hosted with SQLite**
```bash
npm run build
npm start
```

**Option C: Deploy to Railway/Render**
- Set `DATABASE_URL` to a Postgres connection string
- The app auto-migrates on startup if you add `prisma migrate deploy` to your start script

### GitHub Pages
Next.js with server components and API routes requires a Node.js runtime and cannot be statically exported to GitHub Pages. Use Vercel, Railway, Render, or any VPS with Node.js.

---

## 🛠 Database Commands

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name your_change_name

# Reset and re-seed (dev only)
npx prisma migrate reset --force

# Open Prisma Studio (visual DB browser)
npx prisma studio

# Run seed manually
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

---

## 📊 Features

| Feature | Status |
|---------|--------|
| Multi-cert dashboard | ✅ |
| Study plan generator | ✅ |
| Quiz engine (5 modes) | ✅ |
| Practice exam simulator | ✅ |
| Spaced repetition flashcards | ✅ |
| Lab planner | ✅ |
| Notes & journal | ✅ |
| Analytics & charts | ✅ |
| AI Study Coach (mock) | ✅ |
| Admin content editor | ✅ |
| Dark mode | ✅ |
| Pomodoro timer | ✅ |
| Readiness algorithm | ✅ |
| Weak area tracking | ✅ |
| Real AI provider | Plug-in ready |
| JSON import/export | Partial |
| Auth/multi-user | Placeholder |

---

## 🧠 Readiness Score Algorithm

The readiness score (0–100%) is a weighted composite:

| Factor | Weight |
|--------|--------|
| Recent quiz accuracy | 30% |
| Practice exam scores | 25% |
| Flashcard retention | 20% |
| Lab completion rate | 15% |
| Domain coverage breadth | 10% |

Implemented in `lib/utils.ts` → `calculateReadiness()`.

---

## 🤝 Contributing

1. Fork the repo
2. Edit `prisma/seed.ts` to add better domain/topic content
3. Submit a PR with your improvements

All study content is intentionally marked as editable — community contributions of accurate, well-sourced study objectives are welcome.

---

## ⚠️ Disclaimer

This application is **not affiliated with or endorsed by Elastic**. All sample study objectives are community-created approximations intended as a starting point. Always study from official Elastic documentation, training courses, and exam guides. The exam blueprints and passing criteria change — verify everything against current official sources.
