Future Simulator

Explore the futures of your life decisions — before you make them.

Future Simulator is a hackathon web app that turns a real-life decision into three branching futures (best, average, worst), compares parallel choices side-by-side, and optionally enriches every narrative with AI. Built for demos: fast input, rich visuals, guest or signed-in use.



The problem

Big life decisions (career moves, quitting a job, starting a business, relocation) are hard to reason about. People weigh fears, finances, and relationships in their head without a structured way to see how paths diverge over time.

Our solution

A guided decision → simulate → explore flow:





Describe your situation, the choice you're considering, fears, finances, and constraints.



Simulate with a hybrid engine: deterministic modeling + optional Grok/Groq AI narratives.



Explore results across timelines, life domains, branching trees, parallel universes, and saved history.

The app remembers past runs in the browser (and in Supabase when signed in), so repeat decisions get smarter context.



Features







Feature



Description





Multi-step decision form



Situation, outcome, fears, emotional state, risk, relationships, skills, constraints





Three-scenario outcomes



Best / average / worst cases with timelines (Month 1 → Year 5)





Life domain analysis



Career, finance, relationships, mental health, reputation, and more





Wealth projection



Year-by-year optimistic / realistic / pessimistic snapshots (for financial decisions)





Advanced AI analysis



Personality signals, risk score, strategic advice, emotional trajectory





Parallel universe



Compare Option A vs Option B with AI verdict and comparison rows





Branching futures tree



Visual tree of probable branches from your scenarios





User memory



Local profile of themes, fears, and prior simulation summaries





History



Save and reload up to 12 runs (localStorage or Supabase cloud)





Auth



Email/password via Supabase; guest mode; optional Google sign-in





AI enrichment



xAI Grok or Groq (dev proxy); production via Supabase Edge Function



Tech stack







Layer



Technology





Frontend



React 18, TypeScript, Vite 5





Styling



Tailwind CSS 3, Lucide icons





Routing



React Router 7





Backend / DB



Supabase (Auth, PostgreSQL, Edge Functions)





AI



xAI Grok API / Groq API (proxied in dev, Edge Function in prod)



Quick start

Prerequisites





Node.js 18+



npm



(Optional) Supabase project for auth + cloud saves



(Optional) Grok or Groq API key for AI narratives

Install and run

cd project
npm install
cp .env.example .env
# Edit .env with your keys (see Environment variables below)
npm run dev

Open http://localhost:5173

Build for production

npm run build
npm run preview

Other scripts

npm run lint        # ESLint
npm run typecheck   # TypeScript check



Environment variables

Copy .env.example to .env. Never commit real API keys.







Variable



Required



Description





VITE_SUPABASE_URL



For cloud auth/saves



Supabase project URL





VITE_SUPABASE_ANON_KEY



For cloud auth/saves



Supabase anon/public key





GROK_API_KEY



For AI (dev)



xAI (xai-…) or Groq (gsk_…) key — server-side only in dev via Vite proxy





VITE_GROK_USE_SUPABASE



Prod AI
Set true to use Edge Function proxy
VITE_GROK_PROXY_URL

Alt AI

Custom HTTPS proxy URL

VITE_GROK_MODEL
Optional

Override model (default: grok-3-mini or Groq equivalent)





VITE_GOOGLE_CLIENT_ID

Optional

Google OAuth client ID — see supabase/GOOGLE_AUTH_SETUP.md

Without Supabase: the app runs in local-only mode (no login gate).

Without AI keys: simulations still run using template-based narratives and charts.

App flow (demo script)

Home → Decide → Results → Parallel → Branches → History


Home — Overview, run count, shortcuts to start or revisit results.

Decide — Fill the wizard; click Run simulation.

Results — Tabs: Overview, Future cards, Domains, Branches, AI analysis, Wealth chart.

Parallel — Enter two options; compare outcomes and AI verdict.

Branches — Interactive future tree from the latest simulation.

History — Load or delete saved runs; sign in to sync to cloud.

Project structure

project/
├── src/
│   ├── pages/           # Route pages (Home, Decide, Results, …)
│   ├── components/      # UI: forms, timelines, charts, layout
│   ├── contexts/        # AuthContext, SimulationContext
│   ├── lib/             # Simulation engine, AI, Supabase, memory
│   └── types.ts         # Shared TypeScript types
├── supabase/
│   ├── migrations/      # SQL for simulations + user_memory tables
│   └── functions/       # grok-simulate Edge Function
├── index.html
├── vite.config.ts       # Dev AI proxy + /api/ai-status
└── package.json

See DOCUMENTATION.md for architecture, data model, and API details.
Supabase setup

Create a Supabase project.
Run migrations in order in the SQL editor:

supabase/migrations/001_simulations.sql
supabase/migrations/002_auth_user_simulations.sql

supabase/migrations/003_user_memory.sql (optional cloud memory)
Deploy Edge Function grok-simulate and set secret GROK_API_KEY.
Enable Email auth (and optionally Google — see supabase/GOOGLE_AUTH_SETUP.md).
Hackathon highlights
Works offline-first: guest mode + localStorage history and memory.
Hybrid AI: numeric backbone always runs; LLM layers on when configured.
Polished UX: journey navigation, motion, scenario cards, parallel comparison UI.
Extensible types: rich SimulationResult payload stored as JSON in Postgres

Team & license
Event: Create X Hackathon
Team: Minahil Saeed, Zainab Amjad, Laiba Azez
License: MIT 
Further reading
DOCUMENTATION.md — Technical deep dive



supabase/GOOGLE_AUTH_SETUP.md — Google OAuth setup

