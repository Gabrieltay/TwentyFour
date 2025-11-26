# Testing Guide - TwentyFour Game

## Current Status

The game has been fully rebuilt with:
- ✅ Google OAuth authentication only
- ✅ Mobile-first button interface
- ✅ 5-minute timer
- ✅ 3 skip passes (no score deduction)
- ✅ Calculator-style number selection
- ✅ Database integration with Prisma + Supabase PostgreSQL

## Testing the Score Saving Feature

### Setup:
1. Make sure your dev server is running:
   ```bash
   pnpm dev
   ```

2. Make sure you've configured Google OAuth in Supabase (see [GOOGLE_AUTH_SETUP.md](GOOGLE_AUTH_SETUP.md))

### How to Test Score Saving:

1. **Sign in with Google**
   - Go to http://localhost:3000
   - Click "Continue with Google"
   - Sign in with your Google account

2. **Play the game**
   - Click "Start Game"
   - Play a few rounds
   - Try to solve at least one puzzle correctly to earn points

3. **Check Browser Console**
   - Open Developer Tools (F12 or Right-click → Inspect)
   - Go to the "Console" tab
   - You should see logs like:
     ```
     Saving score: 1
     POST /api/scores - Starting...
     User from Supabase: [user-id] [email]
     Received score: 1
     Upserting user in database...
     User upserted: [user-id]
     Creating score record...
     Score created: [score-id] 1
     Score saved successfully: {success: true, score: {...}}
     ```

4. **Check Database (via Supabase Dashboard)**
   - Go to https://supabase.com/dashboard/project/hipbwejveviqglbrtdbv
   - Click "Table Editor" in the sidebar
   - Select the "User" table - you should see your user
   - Select the "Score" table - you should see your scores

5. **End Game and Check High Score**
   - Click "End Game"
   - Your high score should be saved
   - Restart the game - your high score should persist

6. **Check Leaderboard**
   - Click the leaderboard icon (bar chart) in the top right
   - You should see your scores listed

## Troubleshooting

### If scores aren't saving:

1. **Check Console Errors**
   - Look for red error messages in the browser console
   - Common issues:
     - "Unauthorized" → User session expired, try logging out and back in
     - "Internal server error" → Check the terminal/server logs
     - Network errors → Check your internet connection

2. **Check Server Logs**
   - Look at your terminal where `pnpm dev` is running
   - You should see the console.log messages from the API route
   - Any errors will be shown in red

3. **Verify Database Connection**
   - Run: `pnpm db:push`
   - Should say "The database is already in sync with the Prisma schema"
   - If you get connection errors, check your .env DATABASE_URL

4. **Check User Authentication**
   - In browser console, type: `localStorage`
   - You should see Supabase session data
   - If not, try logging out and back in

### Common Issues:

**Issue: "Failed to save score" message appears**
- **Cause**: API request failed
- **Fix**: Check browser console for the exact error, check server logs

**Issue: Scores save but don't show in leaderboard**
- **Cause**: Leaderboard might be cached or query issue
- **Fix**: Refresh the leaderboard page, check database directly in Supabase

**Issue: High score doesn't persist after restart**
- **Cause**: Score might not be saving to database
- **Fix**: Check the `/api/scores/highest` endpoint is working (check network tab in dev tools)

## Manual Database Query

You can also manually check the database using Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Run these queries:

```sql
-- Check all users
SELECT * FROM "User";

-- Check all scores
SELECT * FROM "Score" ORDER BY score DESC LIMIT 10;

-- Check specific user's scores
SELECT s.*, u.email
FROM "Score" s
JOIN "User" u ON s."userId" = u.id
WHERE u.email = 'your-email@gmail.com'
ORDER BY s.score DESC;
```

## What to Report

If you're still having issues, please provide:
1. Screenshot of browser console (with errors in red)
2. Terminal output (server logs)
3. What step you're at when the error occurs
4. Your Supabase project ID (already: hipbwejveviqglbrtdbv)

Good luck testing! 🎮
