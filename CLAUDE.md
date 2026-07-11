# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TwentyFour is a math puzzle game distributed as a **Telegram HTML5 Game**. Players use four random numbers (1-9) and basic arithmetic operations (+, -, \*, /) to make the number 24. Built with Next.js 16 App Router, TypeScript, and Tailwind/shadcn-ui, deployed on Vercel. The bot is [@TwentyFourGameBot](https://t.me/TwentyFourGameBot).

There is no database and no login system — Telegram is the only identity provider, and scores live entirely in Telegram's native Games score API (`setGameScore` / `getGameHighScores`).

## Essential Commands

### Development

- `pnpm dev` - Start development server (localhost:3000)
- `pnpm build` - Build production application
- `pnpm start` - Start production server

### Code Quality

- `pnpm check-all` - Run all checks: type-check, lint, and format:check (use before committing)
- `pnpm type-check` - Run TypeScript type checking without emitting files
- `pnpm lint` - Run ESLint on all TypeScript/TSX files
- `pnpm lint:fix` - Auto-fix ESLint issues
- `pnpm format` - Format all files with Prettier
- `pnpm format:check` - Check formatting without modifying files

## Architecture

### Two surfaces

- **Root route (`src/app/page.tsx`)**: a static marketing page. No auth, no gameplay, no API calls — just an explanation of the game and a "Play on Telegram" link to `https://t.me/TwentyFourGameBot`.
- **`/play` (`src/app/play/page.tsx` + `src/app/play/play-client.tsx`)**: the actual game. Only reachable from inside Telegram's in-app WebView, launched via the bot's "Play" button. Requires `user_id` plus either (`chat_id` + `message_id`) or `inline_message_id` as query params — these are appended by the bot webhook when it answers the game's callback query. If they're missing, the page shows a message directing the user back to the bot instead of the game.

### Telegram bot webhook

`src/app/api/telegram/webhook/route.ts` handles updates from Telegram (configured via `setWebhook`):

- `/start` → replies with `sendGame` using `TELEGRAM_GAME_SHORT_NAME`.
- `callback_query` with a matching `game_short_name` (i.e. the "Play" button was tapped) → `answerCallbackQuery` with a `url` pointing at `${NEXT_PUBLIC_APP_URL}/play` plus `user_id`, and either `chat_id`+`message_id` or `inline_message_id` depending on how the game message was sent.
- Optionally verifies the `X-Telegram-Bot-Api-Secret-Token` header against `TELEGRAM_WEBHOOK_SECRET` if that env var is set.

### Score submission and leaderboard

The frontend never calls the Telegram Bot API directly (that would require exposing `TELEGRAM_BOT_TOKEN`). Instead `src/lib/telegram-leaderboard-service.ts` (`TelegramLeaderboardService`) wraps two API routes:

- `POST /api/game/score` (`src/app/api/game/score/route.ts`): called from `play-client.tsx` on game over with the score and the `userId`/`chatId`/`messageId`/`inlineMessageId` that `/play` was loaded with. The game is launched via the classic Telegram Games flow (`sendGame` + `answerCallbackQuery({ url })`), not a Mini App `web_app` button, so `Telegram.WebApp.initData` is never populated here — there's no HMAC-signed identity available in this flow. The route instead trusts the `userId` from the URL, the same way `GET /api/game/leaderboard` already does; that URL was constructed server-side by the webhook from a real `callback_query`. Only scores greater than zero are submitted.
- `GET /api/game/leaderboard` (`src/app/api/game/leaderboard/route.ts`): called from `play-client.tsx` after a game ends, and again after a score submission, to refresh the on-screen leaderboard (`src/components/leaderboard-card.tsx`). Wraps Telegram's `getGameHighScores`, which does **not** return the full leaderboard — only the requesting player, players near them, and the top scorers for that `chat_id`+`message_id`/`inline_message_id`. There's no Telegram API for a global cross-chat ranking.

There is no local persistence — Telegram's Games API is the only source of truth, and it already only updates a player's score if the new one is higher.

### Telegram Web App SDK

`play-client.tsx` loads `https://telegram.org/js/telegram-web-app.js` via `next/script` and calls `window.Telegram.WebApp.ready()` / `.expand()` on mount. Types for `window.Telegram` live in `src/types/telegram-web-app.d.ts`. Avoid `100vh`/fixed browser-chrome assumptions in this route — use `100dvh` and Telegram's WebApp APIs instead, since it renders inside an in-app WebView.

### Game Logic

Core game logic (unchanged) is in [src/lib/game.ts](src/lib/game.ts):

- `generateNumbers()`: Generates 4 random numbers (1-9) that have a valid solution to reach 24.
- `validateExpression()`: Validates a hand-typed expression evaluates to 24 using each number exactly once.
- `hasSolution()`: Brute-force solver used to verify a puzzle is solvable.

### UI Components

Uses shadcn/ui components in [src/components/ui/](src/components/ui/) - when adding new components, follow the shadcn/ui installation pattern.

## Git Workflow

Husky hooks are configured:

- **pre-commit**: Runs `lint-staged` (lints and formats changed files)
- **pre-push**: Runs `pnpm type-check` to ensure type safety

## Environment Variables

Required in `.env.local` (see `.env.local.example`):

```
TELEGRAM_BOT_TOKEN=              # from @BotFather, server-only, never expose to the client
TELEGRAM_GAME_SHORT_NAME=        # short_name registered via BotFather's /newgame
TELEGRAM_WEBHOOK_SECRET=         # optional, verifies webhook requests are from Telegram
NEXT_PUBLIC_APP_URL=             # public base URL of this deployment, e.g. https://twentyfour.example.com
```

After deploying, point the bot's webhook at `${NEXT_PUBLIC_APP_URL}/api/telegram/webhook` via Telegram's `setWebhook` API, and make sure the game's URL registered with BotFather also matches `${NEXT_PUBLIC_APP_URL}/play`.

## Documentation

The [docs/](docs/) folder has some pre-Telegram-migration docs (Supabase/Google OAuth setup, leaderboard UI, etc.) that no longer reflect the current architecture — treat anything about auth, Prisma, or a database-backed leaderboard there as historical, not current.

## Key Development Notes

- **Package Manager**: This project uses `pnpm` (v10.12.4) - do not use npm or yarn
- **React 19**: Using React 19 RC - be aware of breaking changes from React 18
- **Next.js 16**: Uses App Router exclusively, no Pages directory
- **No database**: there is intentionally no Prisma/Postgres/Supabase in this project. Don't reintroduce persistence without checking with the user first — scores are meant to live only in Telegram.
