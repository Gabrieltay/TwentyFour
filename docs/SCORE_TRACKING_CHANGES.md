# Score Tracking Implementation - Summary

## Overview

The game now tracks all scores in the database and displays each user's highest score on the leaderboard with the last updated timestamp.

## Changes Made

### 1. Database Schema Updates

**File: [prisma/schema.prisma](prisma/schema.prisma)**

Added `updatedAt` field to the Score model:

```prisma
model Score {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  score     Int
  createdAt DateTime @default(now())
  updatedAt DateTime @default(now()) @updatedAt  // NEW FIELD

  @@index([userId])
  @@index([score])
}
```

**Behavior:**

- Multiple score records are created per user (one for each game session)
- `createdAt`: When the score was first recorded
- `updatedAt`: Automatically updated by Prisma whenever the record is modified
- Existing data is preserved

### 2. Game Logic Updates

**File: [src/app/page.tsx](src/app/page.tsx)**

**Changed scoring behavior:**

- ✅ Scores are NO LONGER saved after each correct round
- ✅ Scores are ONLY saved when the game ends (End Game button or timer expires)
- ✅ Only saves if score > 0 (prevents empty game sessions)

**Key changes:**

```typescript
// Lines 150-152: Removed saveScore() call after correct answer
if (newScore > highScore) {
  setHighScore(newScore)
  // saveScore(newScore) <- REMOVED
}

// Lines 209-221: Updated endGame function
const endGame = async () => {
  setGameStarted(false)

  // Save the final score
  if (score > 0) {
    await saveScore(score) // Only saves once per game
  }

  // Update high score if this is a new record
  if (score > highScore) {
    setHighScore(score)
  }
}
```

### 3. API Updates

**File: [src/app/api/scores/route.ts](src/app/api/scores/route.ts)**

**POST endpoint (unchanged):**

- Still uses `prisma.score.create()` to insert new score records
- Each game session creates a new record in the database

**GET endpoint (updated):**

- Now returns the **highest score per user** using PostgreSQL's `DISTINCT ON`
- Shows the `updatedAt` timestamp from that highest score
- Returns top 10 users sorted by their best score

```typescript
// Uses raw SQL query to get best score per user
const scores = await prisma.$queryRaw`
  SELECT DISTINCT ON (s."userId")
    s.id,
    s."userId",
    s.score,
    s."createdAt",
    s."updatedAt",
    u.email
  FROM "Score" s
  JOIN "User" u ON s."userId" = u.id
  ORDER BY s."userId", s.score DESC, s."updatedAt" DESC
`
```

### 4. Leaderboard Updates

**File: [src/app/leaderboard/page.tsx](src/app/leaderboard/page.tsx)**

**Display changes:**

- Shows the highest score achieved by each user
- Displays "Last played: [date] [time]" instead of just the created date
- Uses the `updatedAt` timestamp to show when they achieved their best score

**Interface update:**

```typescript
interface LeaderboardEntry {
  id: string
  score: number
  createdAt: string
  updatedAt: string // NEW FIELD
  user: {
    email: string
  }
}
```

**Display format:**

```typescript
Last played: {new Date(entry.updatedAt).toLocaleDateString()}
             {new Date(entry.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
```

Example: "Last played: 11/27/2025 2:45 PM"

## How It Works Now

### User Plays a Game:

1. User starts game
2. Solves puzzles, score increases locally
3. High score updates in real-time on screen
4. When game ends (button click or timer):
   - Final score is saved to database (creates new Score record)
   - High score persists for next session

### Leaderboard Display:

1. Query finds the highest score for each user
2. Sorts users by their best score (descending)
3. Displays top 10 users
4. Shows when they last achieved/updated their high score
5. Highlights current user's entry

## Benefits

✅ **Complete Score History**: All game sessions are tracked in the database
✅ **Performance**: Only one database write per game (not per round)
✅ **Accurate Timestamps**: Shows when users last played and achieved their best score
✅ **Data Preservation**: No data loss, existing scores remain intact
✅ **User-Friendly**: Clear "Last played" timestamp on leaderboard
✅ **Scalable**: Can add features like personal score history, statistics, etc.

## Future Enhancements (Optional)

You could add:

- Personal score history page showing all games played
- Statistics (average score, total games played, win rate)
- Score trends/graphs over time
- Filter leaderboard by time period (daily, weekly, all-time)
- Delete old scores after X days to manage database size
