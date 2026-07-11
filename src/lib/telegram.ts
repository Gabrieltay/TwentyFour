import crypto from 'crypto'

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

interface TelegramWebAppUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
}

/**
 * Validates initData from the Telegram WebApp JS SDK per
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
 * Returns the authenticated user if the signature checks out, otherwise null.
 */
export function validateInitData(initData: string): TelegramWebAppUser | null {
  const token = getBotToken()
  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  if (!hash) return null
  params.delete('hash')

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(token).digest()
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

  if (computedHash.length !== hash.length) return null
  const isValid = crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(hash))
  if (!isValid) return null

  const userJson = params.get('user')
  if (!userJson) return null

  try {
    return JSON.parse(userJson) as TelegramWebAppUser
  } catch {
    return null
  }
}
