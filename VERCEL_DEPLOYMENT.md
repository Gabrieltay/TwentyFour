# Vercel Deployment Guide

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Your Supabase project set up with Google OAuth
3. Your DATABASE_URL from Supabase

## Environment Variables

Before deploying, you need to set up the following environment variables in your Vercel project settings:

### Required Environment Variables:

1. **DATABASE_URL**
   - Your Supabase PostgreSQL connection string (pooler URL)
   - Example: `postgresql://postgres.hipbwejveviqglbrtdbv:YOUR_PASSWORD@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres`

2. **NEXT_PUBLIC_SUPABASE_URL**
   - Your Supabase project URL
   - Example: `https://hipbwejveviqglbrtdbv.supabase.co`

3. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Your Supabase anonymous key
   - Find this in: Supabase Dashboard → Settings → API

## Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Import to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel will auto-detect Next.js settings

### 3. Configure Environment Variables

1. In the Vercel import screen, scroll down to "Environment Variables"
2. Add all three environment variables listed above
3. Make sure to add them for all environments (Production, Preview, Development)

### 4. Deploy

1. Click "Deploy"
2. Wait for the build to complete (usually 2-3 minutes)
3. Vercel will provide you with a deployment URL

### 5. Update Supabase OAuth Redirect URLs

After deployment, update your Google OAuth settings in Supabase:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel deployment URL to "Site URL"
3. Add `https://your-app.vercel.app/auth/callback` to "Redirect URLs"

## Build Configuration

The project is already configured for Vercel deployment:

- ✅ `postinstall` script generates Prisma Client automatically
- ✅ `build` script runs Prisma generate before Next.js build
- ✅ `.npmrc` allows necessary build scripts
- ✅ `prisma.config.ts` handles environment variables correctly

## Troubleshooting

### Build fails with "Module '@prisma/client' has no exported member 'PrismaClient'"

- **Cause**: Prisma Client wasn't generated
- **Fix**: Ensure `DATABASE_URL` environment variable is set in Vercel

### "Unauthorized" errors after deployment

- **Cause**: OAuth redirect URLs not updated
- **Fix**: Add your Vercel URL to Supabase OAuth redirect URLs

### Database connection errors

- **Cause**: Wrong DATABASE_URL or network restrictions
- **Fix**: Use the **pooler** connection string from Supabase (port 5432), not the direct connection

## Post-Deployment Checklist

- [ ] Environment variables are set in Vercel
- [ ] Build completed successfully
- [ ] OAuth redirect URLs updated in Supabase
- [ ] Can log in with Google
- [ ] Scores are being saved to database
- [ ] Leaderboard displays correctly

## Continuous Deployment

Once set up, Vercel will automatically deploy:

- **Production**: When you push to `main` branch
- **Preview**: When you create a pull request

You can customize this in Vercel project settings → Git.
