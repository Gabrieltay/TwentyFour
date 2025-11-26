# TwentyFour - Math Puzzle Game

A web-based game where players use four random numbers (1-9) and basic arithmetic operations (+, -, *, /) to make the number 24. Each number can only be used once per round.

## Features

- User authentication with Supabase
- Score tracking and leaderboard
- Progressive difficulty with random number generation
- Clean, responsive UI with Tailwind CSS and shadcn/ui
- Real-time validation of expressions

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Supabase** - Authentication and user management
- **Prisma** - Database ORM
- **PostgreSQL** - Database (via Supabase)
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **pnpm** - Package manager

## Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- A Supabase account and project

## Setup Instructions

### 1. Clone the repository

```bash
cd twentyfour
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be set up
3. Go to Project Settings > API
4. Copy your project URL and anon/public key

### 4. Configure environment variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_postgres_connection_string
```

To get your DATABASE_URL:
1. In Supabase, go to Project Settings > Database
2. Copy the connection string under "Connection string" (URI format)
3. Replace `[YOUR-PASSWORD]` with your database password

### 5. Set up the database

Run Prisma migrations to create the database tables:

```bash
pnpm prisma generate
pnpm prisma db push
```

### 6. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Play

1. **Sign up** or **log in** to your account
2. You'll see 4 random numbers (1-9)
3. Create a mathematical expression using all 4 numbers that equals 24
4. Use +, -, *, / and parentheses
5. Each number must be used exactly once
6. Submit your answer to earn points
7. Skip a round (costs 1 point) if you get stuck
8. Try to beat your high score!

### Examples

For numbers: 8, 7, 6, 3
- `8 + 7 + 6 + 3` = 24 ✓
- `(8 - 4) * (7 - 1)` = 24 ✓

## Project Structure

```
twentyfour/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── scores/          # API routes for score management
│   │   ├── login/               # Login page
│   │   ├── signup/              # Signup page
│   │   ├── leaderboard/         # Leaderboard page
│   │   ├── page.tsx             # Main game page
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css          # Global styles
│   ├── components/
│   │   └── ui/                  # shadcn/ui components
│   ├── lib/
│   │   ├── supabase/            # Supabase client utilities
│   │   ├── game.ts              # Game logic and validation
│   │   ├── prisma.ts            # Prisma client
│   │   └── utils.ts             # Utility functions
│   └── middleware.ts            # Auth middleware
├── prisma/
│   └── schema.prisma            # Database schema
└── package.json
```

## Database Schema

### User
- `id` (String, UUID)
- `email` (String, unique)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Score
- `id` (String, UUID)
- `userId` (String, foreign key)
- `score` (Int)
- `createdAt` (DateTime)

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables (same as `.env.local`)
5. Deploy

Make sure to run database migrations on your production database.

## License

MIT