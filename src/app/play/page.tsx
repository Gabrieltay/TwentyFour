import { getGameHighScores } from '@/lib/telegram'
import { GameLogo } from '@/components/game-logo'
import { HeaderSparkles } from '@/components/header-sparkles'
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
    <div className="relative flex h-[100dvh] flex-col items-center justify-center gap-8 overflow-hidden bg-gradient-to-b from-[#241454] to-[#170c3a] p-6 text-center">
      <HeaderSparkles />
      <GameLogo className="relative z-10" />
      <div className="relative z-10 max-w-sm space-y-4 rounded-3xl bg-[#F1EEFB] p-6">
        <h1 className="font-display text-xl font-semibold text-indigo-950">
          Open TwentyFour in Telegram
        </h1>
        <p className="text-sm text-indigo-950/60">
          This game only runs inside Telegram. Open the bot and tap the Play button on the game
          message to start.
        </p>
        <a
          href={TELEGRAM_BOT_URL}
          className="inline-block w-full rounded-2xl bg-violet-600 py-3 font-semibold text-white shadow-[0_4px_0_0_#5b21b6] transition active:translate-y-[4px] active:shadow-none"
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
