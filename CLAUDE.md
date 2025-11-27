# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TwentyFour is a web-based math puzzle game where players use four random numbers (1-9) and basic arithmetic operations (+, -, \*, /) to make the number 24. Built with Next.js 16 App Router, TypeScript, Supabase authentication, and Prisma ORM with PostgreSQL.

## Essential Commands

### Development

- `pnpm dev` - Start development server (localhost:3000)
- `pnpm build` - Build production application (runs `prisma generate` first)
- `pnpm start` - Start production server

### Code Quality

- `pnpm check-all` - Run all checks: type-check, lint, and format:check (use before committing)
- `pnpm type-check` - Run TypeScript type checking without emitting files
- `pnpm lint` - Run ESLint on all TypeScript/TSX files
- `pnpm lint:fix` - Auto-fix ESLint issues
- `pnpm format` - Format all files with Prettier
- `pnpm format:check` - Check formatting without modifying files

### Database

- `pnpm db:generate` - Generate Prisma client (runs automatically on install)
- `pnpm db:push` - Push schema changes to database without migrations
- `pnpm db:studio` - Open Prisma Studio for database inspection

## Architecture

### Dual Authentication and Data Layer

The application uses a split architecture with Supabase for authentication and Prisma for data persistence:

- **Supabase**: Handles user authentication, sessions, and JWT tokens
- **Prisma + PostgreSQL**: Stores user profiles, scores, and game data
- **User Synchronization**: When scores are saved ([src/app/api/scores/route.ts](src/app/api/scores/route.ts)), users are upserted from Supabase auth metadata into Prisma database, syncing `name` and `avatarUrl` from OAuth providers

### Supabase Client Patterns

Three distinct Supabase clients for different contexts:

1. **Server Components** ([src/lib/supabase/server.ts](src/lib/supabase/server.ts)): Uses `createServerClient` with Next.js cookies for RSC
2. **Client Components** ([src/lib/supabase/client.ts](src/lib/supabase/client.ts)): Uses `createBrowserClient` for browser-side auth
3. **Middleware** ([src/lib/supabase/middleware.ts](src/lib/supabase/middleware.ts)): Refreshes session cookies on each request

Always use the appropriate client for the context - importing the wrong one will cause authentication issues.

### Prisma Singleton with Adapter

Prisma is configured with the PostgreSQL adapter pattern ([src/lib/prisma.ts](src/lib/prisma.ts:5-14)):

- Uses `pg` Pool with `@prisma/adapter-pg` for better connection management
- Singleton pattern with `globalThis` to prevent multiple instances in development
- Logs all queries, errors, and warnings

When making database changes, always run `pnpm db:generate` before `pnpm db:push`.

### Game Logic

Core game logic is in [src/lib/game.ts](src/lib/game.ts):

- `generateNumbers()`: Generates 4 random numbers (1-9) that have a valid solution to reach 24. Uses `hasSolution()` to verify solvability, falls back to known puzzles if needed after 100 attempts.
- `validateExpression()`: Validates player input by:
  1. Checking exactly 4 numbers are used
  2. Verifying each given number is used exactly once
  3. Ensuring only valid characters (digits, operators, parentheses)
  4. Evaluating the expression using Function constructor
  5. Checking result equals 24 (with 0.0001 tolerance for floating point)
- `hasSolution()`: Brute-force solver that tries all permutations and operator combinations to verify a puzzle is solvable

### Next.js App Router Structure

- [src/app/page.tsx](src/app/page.tsx) - Main game interface (Server Component)
- [src/app/login/page.tsx](src/app/login/page.tsx) - Authentication page
- [src/app/leaderboard/page.tsx](src/app/leaderboard/page.tsx) - Top scores display
- [src/app/api/scores/route.ts](src/app/api/scores/route.ts) - POST: save scores, GET: fetch top 10 leaderboard
- [src/app/api/scores/highest/route.ts](src/app/api/scores/highest/route.ts) - GET: fetch user's highest score
- [src/app/auth/callback/route.ts](src/app/auth/callback/route.ts) - OAuth callback handler
- [src/middleware.ts](src/middleware.ts) - Session refresh on all routes (except static files)

### UI Components

Uses shadcn/ui components in [src/components/ui/](src/components/ui/) - when adding new components, follow the shadcn/ui installation pattern.

## Git Workflow

Husky hooks are configured:

- **pre-commit**: Runs `lint-staged` (lints and formats changed files)
- **pre-push**: Runs `pnpm type-check` to ensure type safety

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=postgresql://user:password@host:port/database
```

The `DATABASE_URL` should point to the same PostgreSQL database that Supabase uses.

## Key Development Notes

- **Package Manager**: This project uses `pnpm` (v10.12.4) - do not use npm or yarn
- **React 19**: Using React 19 RC - be aware of breaking changes from React 18
- **Next.js 16**: Uses App Router exclusively, no Pages directory
- **Authentication Flow**: Middleware updates session → Server Components read user → API routes verify auth
- **Score System**: Scores are always associated with authenticated users; leaderboard shows highest score per user
