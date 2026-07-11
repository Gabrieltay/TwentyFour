# TwentyFour - Math Puzzle Game

A math puzzle game distributed as a **Telegram HTML5 Game**. Players use four random numbers (1-9) and basic arithmetic operations (+, -, \*, /) to make the number 24. Each number can only be used once per round. Play it via [@TwentyFourGameBot](https://t.me/TwentyFourGameBot) on Telegram.

## Features

- Telegram-native identity and scoring — no login, no database
- Score tracking via Telegram's `setGameScore` / `getGameHighScores` Games API
- Progressive difficulty with random number generation
- Clean, responsive UI with Tailwind CSS and shadcn/ui

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Telegram Bot API** - Bot webhook, game launch, and score submission
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **pnpm** - Package manager

## Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- A Telegram bot created via [@BotFather](https://t.me/BotFather), with a Game registered via `/newgame`

## Setup Instructions

### 1. Clone the repository

```bash
cd twentyfour
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory (see `.env.local.example`):

```env
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_GAME_SHORT_NAME=your_game_short_name
TELEGRAM_WEBHOOK_SECRET=optional_shared_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page. The `/play` route only works when opened from inside Telegram with the right query params — see below.

### 5. Wire up the bot

1. In [@BotFather](https://t.me/BotFather), run `/newgame` and register a game with a `short_name` matching `TELEGRAM_GAME_SHORT_NAME`, and set its URL to `${NEXT_PUBLIC_APP_URL}/play`.
2. Point the bot's webhook at your deployment:
   ```bash
   curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
     -d "url=${NEXT_PUBLIC_APP_URL}/api/telegram/webhook" \
     -d "secret_token=${TELEGRAM_WEBHOOK_SECRET}"
   ```
3. Message the bot with `/start` and tap "Play" to launch the game.

## How to Play

1. Open [@TwentyFourGameBot](https://t.me/TwentyFourGameBot) in Telegram and send `/start`
2. Tap the **Play** button to launch the game in Telegram's in-app browser
3. You'll see 4 random numbers (1-9)
4. Tap two numbers and an operator to combine them; repeat until one number is left
5. Get to 24 to score a point and move to the next round
6. Skip a round (up to 3 skips) if you get stuck
7. You have 5 minutes — try to beat your high score, tracked natively by Telegram!

## Project Structure

```
twentyfour/
├── src/
│   ├── app/
│   │   ├── api/telegram/
│   │   │   ├── webhook/          # Bot webhook (/start, callback_query)
│   │   │   └── score/            # Score submission (setGameScore)
│   │   ├── play/                 # The actual game (Telegram WebView only)
│   │   ├── page.tsx              # Static marketing/landing page
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   └── ui/                   # shadcn/ui components
│   ├── lib/
│   │   ├── telegram.ts           # Telegram Bot API helpers + initData validation
│   │   └── game.ts               # Game logic and validation
│   └── types/
│       └── telegram-web-app.d.ts # window.Telegram types
└── package.json
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add the environment variables above (with `NEXT_PUBLIC_APP_URL` set to your production URL)
5. Deploy
6. Run the `setWebhook` call from step 5 above against your production URL

## License

MIT
