import { NextRequest, NextResponse } from 'next/server'
import { setGameScore, validateInitData } from '@/lib/telegram'

export async function POST(request: NextRequest) {
  let body: {
    score?: unknown
    initData?: unknown
    chatId?: unknown
    messageId?: unknown
    inlineMessageId?: unknown
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { score, initData, chatId, messageId, inlineMessageId } = body

  if (typeof score !== 'number' || !Number.isFinite(score) || score < 0) {
    return NextResponse.json({ error: 'Invalid score' }, { status: 400 })
  }

  if (typeof initData !== 'string' || !initData) {
    return NextResponse.json({ error: 'Missing Telegram initData' }, { status: 400 })
  }

  const user = validateInitData(initData)
  if (!user) {
    return NextResponse.json({ error: 'Invalid Telegram session' }, { status: 401 })
  }

  const hasInlineTarget = typeof inlineMessageId === 'string' && inlineMessageId.length > 0
  const hasChatTarget = typeof chatId === 'number' && typeof messageId === 'number'

  if (!hasInlineTarget && !hasChatTarget) {
    return NextResponse.json(
      { error: 'Missing chatId/messageId or inlineMessageId' },
      { status: 400 }
    )
  }

  try {
    await setGameScore(
      {
        userId: user.id,
        chatId: hasChatTarget ? (chatId as number) : undefined,
        messageId: hasChatTarget ? (messageId as number) : undefined,
        inlineMessageId: hasInlineTarget ? (inlineMessageId as string) : undefined,
      },
      score
    )
  } catch (error) {
    console.error('Failed to submit score to Telegram:', error)
    return NextResponse.json({ error: 'Failed to submit score to Telegram' }, { status: 502 })
  }

  return NextResponse.json({ success: true })
}
