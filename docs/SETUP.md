# Quick Setup Guide

Follow these steps to get your TwentyFour game running:

## 1. Install Dependencies

```bash
pnpm install
```

## 2. Set up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to initialize (takes ~2 minutes)

## 3. Get Supabase Credentials

### API Keys (for authentication)

1. Go to **Project Settings** → **API**
2. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### Database Connection String (for Prisma)

1. Go to **Project Settings** → **Database**
2. Scroll to **Connection string** section
3. Select **URI** tab
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with the password you set when creating the project

## 4. Create Environment File

Create a file named `.env.local` in the root directory with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your_anon_key
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

## 5. Initialize Database

Run these commands to set up your database tables:

```bash
pnpm prisma generate
pnpm prisma db push
```

## 6. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and you should see the login page!

## Troubleshooting

### "Invalid Prisma Client" error

Run: `pnpm prisma generate`

### Authentication not working

- Check that your Supabase URL and keys are correct in `.env.local`
- Make sure you're using the **anon/public** key, not the service role key

### Database connection errors

- Verify your DATABASE_URL is correct
- Make sure you replaced `[YOUR-PASSWORD]` with your actual password
- Check that your Supabase project is running

### Build errors

Try deleting these folders and reinstalling:

```bash
rm -rf node_modules .next
pnpm install
```

## Next Steps

1. Sign up for an account on your local instance
2. Start playing the game!
3. Check out the leaderboard to see high scores

Enjoy the game!
