# RecruIQ

A professional online quiz application for corporate recruitment, allowing HR teams to create skill assessments, assign them to candidates, and track performance analytics.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/quiz-app run dev` — run the frontend (port 24311)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/` — DB tables: quizzes, questions, candidates, attempts, answers
- `artifacts/api-server/src/routes/` — quizzes.ts, candidates.ts, attempts.ts, analytics.ts
- `artifacts/quiz-app/src/` — React frontend (pages/, components/)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod validation schemas

## Architecture decisions

- Contract-first API: OpenAPI spec gates all codegen; frontend hooks and backend Zod validators are always in sync
- Quiz scoring is 100% server-side: answers are evaluated against `correct_answer` on submit, never exposed to the client during a quiz session
- Candidate email deduplication: `POST /candidates` is idempotent — returns the existing candidate if the email is already registered
- Analytics are computed at query time with SQL aggregates (no separate reporting table needed at this scale)
- Status badges use enum strings (`draft`, `active`, `archived`) stored as text in Postgres for easy filtering

## Product

- **Admin dashboard**: live stats (quiz count, candidate count, attempts, pass rate) + recent activity feed
- **Quiz management**: create/edit/delete quizzes with title, category, duration, passing score; inline question editor supporting multiple-choice, true/false, and short-answer types
- **Candidate management**: register and manage candidates; view individual attempt history
- **Attempt log**: filterable log of all quiz attempts across candidates and quizzes
- **Quiz analytics**: per-quiz deep-dive showing pass rate, average score, high/low scores
- **Candidate quiz portal**: timed quiz-taking flow — candidate identifies themselves, selects an active quiz, answers questions with a countdown timer, and sees results immediately on submit

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm run typecheck:libs` after changing DB schema before typechecking API server routes
- After each OpenAPI spec change, re-run `pnpm --filter @workspace/api-spec run codegen`
- The API server must be restarted after rebuilding to pick up route changes

## Pointers

- See the workspace setup for details on TS configurations and package dependencies.
