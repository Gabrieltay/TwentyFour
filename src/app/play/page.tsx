import { getGameHighScores } from '@/lib/telegram'
import { PlayClient } from './play-client'

const TELEGRAM_BOT_URL = 'https://t.me/TwentyFourGameBot'

interface PlayPageProps {
  searchParams: Promise<{
    user_id?: string
    chat_id?: string
    message_id?: string
    inline_message_id?: string
  }>
}

function OpenInTelegram() {
  return (
    <div className="h-[100dvh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6 text-center">
      <div className="max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Open TwentyFour in Telegram</h1>
        <p className="text-gray-600">
          This game only runs inside Telegram. Open the bot and tap the Play button on the game
          message to start.
        </p>
        <a
          href={TELEGRAM_BOT_URL}
          className="inline-block px-5 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg"
        >
          Open @TwentyFourGameBot
        </a>
      </div>
    </div>
  )
}

export default async function PlayPage({ searchParams }: PlayPageProps) {
  const params = await searchParams

  const userId = params.user_id ? Number(params.user_id) : NaN
  const chatId = params.chat_id ? Number(params.chat_id) : undefined
  const messageId = params.message_id ? Number(params.message_id) : undefined
  const inlineMessageId = params.inline_message_id

  const hasValidTarget =
    Boolean(inlineMessageId) || (chatId !== undefined && messageId !== undefined)

  if (!Number.isFinite(userId) || !hasValidTarget) {
    return <OpenInTelegram />
  }

  let initialHighScore = 0
  try {
    const highScores = await getGameHighScores({ userId, chatId, messageId, inlineMessageId })
    initialHighScore = highScores.find(entry => entry.user.id === userId)?.score ?? 0
  } catch (error) {
    console.error('Failed to load Telegram high scores:', error)
  }

  return (
    <PlayClient
      chatId={chatId}
      messageId={messageId}
      inlineMessageId={inlineMessageId}
      initialHighScore={initialHighScore}
    />
  )
}
