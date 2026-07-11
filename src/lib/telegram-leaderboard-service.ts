import type { TelegramHighScore } from '@/lib/telegram'

export interface LeaderboardTarget {
  chatId?: number
  messageId?: number
  inlineMessageId?: string
}

async function parseErrorMessage(response: Response, fallback: string): Promise<string> {
  const data = await response.json().catch(() => ({}))
  return typeof data.error === 'string' ? data.error : fallback
}

/**
 * Client-side gateway to our Telegram-backed leaderboard API routes. The UI
 * never talks to the Telegram Bot API directly (that requires the bot token).
 */
class TelegramLeaderboardService {
  async submitScore(score: number, target: LeaderboardTarget): Promise<void> {
    const initData = window.Telegram?.WebApp?.initData
    if (!initData) {
      throw new Error('Telegram initData unavailable')
    }

    const response = await fetch('/api/game/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, initData, ...target }),
    })

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response, 'Failed to submit score'))
    }
  }

  async getLeaderboard(userId: number, target: LeaderboardTarget): Promise<TelegramHighScore[]> {
    const params = new URLSearchParams({ userId: String(userId) })
    if (target.inlineMessageId) {
      params.set('inlineMessageId', target.inlineMessageId)
    } else {
      if (target.chatId !== undefined) params.set('chatId', String(target.chatId))
      if (target.messageId !== undefined) params.set('messageId', String(target.messageId))
    }

    const response = await fetch(`/api/game/leaderboard?${params.toString()}`)
    if (!response.ok) {
      throw new Error(await parseErrorMessage(response, 'Failed to load leaderboard'))
    }
    return response.json()
  }
}

export const telegramLeaderboardService = new TelegramLeaderboardService()
