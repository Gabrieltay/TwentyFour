import { NextRequest, NextResponse } from 'next/server'
import { getGameHighScores } from '@/lib/telegram'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const userId = Number(searchParams.get('userId'))
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ error: 'Missing or invalid userId' }, { status: 400 })
  }

  const chatIdParam = searchParams.get('chatId')
  const messageIdParam = searchParams.get('messageId')
  const inlineMessageId = searchParams.get('inlineMessageId') || undefined

  const chatId = chatIdParam ? Number(chatIdParam) : undefined
  const messageId = messageIdParam ? Number(messageIdParam) : undefined
  const hasInlineTarget = Boolean(inlineMessageId)
  const hasChatTarget = chatId !== undefined && messageId !== undefined

  if (!hasInlineTarget && !hasChatTarget) {
    return NextResponse.json(
      { error: 'Missing chatId/messageId or inlineMessageId' },
      { status: 400 }
    )
  }

  try {
    // Telegram's getGameHighScores does NOT return the full leaderboard — only
    // the requesting player, players "close" to them, and the top scorers for
    // this chat/message. There is no API for a global cross-chat ranking.
    const highScores = await getGameHighScores({
      userId,
      chatId: hasChatTarget ? chatId : undefined,
      messageId: hasChatTarget ? messageId : undefined,
      inlineMessageId: hasInlineTarget ? inlineMessageId : undefined,
    })
    return NextResponse.json(highScores)
  } catch (error) {
    console.error('Failed to load Telegram high scores:', error)
    return NextResponse.json({ error: 'Failed to load leaderboard' }, { status: 502 })
  }
}
