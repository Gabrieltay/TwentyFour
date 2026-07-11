const TELEGRAM_API_BASE = 'https://api.telegram.org/bot'

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set')
  }
  return token
}

export async function callTelegramApi<T = unknown>(
  method: string,
  payload: Record<string, unknown>
): Promise<T> {
  const token = getBotToken()
  const response = await fetch(`${TELEGRAM_API_BASE}${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await response.json()
  if (!data.ok) {
    throw new Error(`Telegram API error (${method}): ${data.description || response.statusText}`)
  }
  return data.result as T
}

export interface GameScoreTarget {
  userId: number
  chatId?: number
  messageId?: number
  inlineMessageId?: string
}

function scoreTargetPayload(target: GameScoreTarget): Record<string, unknown> {
  if (target.inlineMessageId) {
    return { user_id: target.userId, inline_message_id: target.inlineMessageId }
  }
  return { user_id: target.userId, chat_id: target.chatId, message_id: target.messageId }
}

export async function setGameScore(target: GameScoreTarget, score: number): Promise<void> {
  await callTelegramApi('setGameScore', { ...scoreTargetPayload(target), score })
}

export interface TelegramHighScore {
  position: number
  user: {
    id: number
    first_name: string
    last_name?: string
    username?: string
  }
  score: number
}

export async function getGameHighScores(target: GameScoreTarget): Promise<TelegramHighScore[]> {
  return callTelegramApi<TelegramHighScore[]>('getGameHighScores', scoreTargetPayload(target))
}
