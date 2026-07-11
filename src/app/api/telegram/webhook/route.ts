import { NextRequest, NextResponse } from 'next/server'
import { callTelegramApi } from '@/lib/telegram'

interface TelegramUpdate {
  message?: {
    text?: string
    chat: { id: number }
  }
  callback_query?: {
    id: string
    from: { id: number }
    game_short_name?: string
    inline_message_id?: string
    message?: {
      chat: { id: number }
      message_id: number
    }
  }
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET
  if (webhookSecret) {
    const headerSecret = request.headers.get('x-telegram-bot-api-secret-token')
    if (headerSecret !== webhookSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const gameShortName = process.env.TELEGRAM_GAME_SHORT_NAME
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!gameShortName || !appUrl) {
    console.error(
      'Telegram webhook is missing TELEGRAM_GAME_SHORT_NAME or NEXT_PUBLIC_APP_URL env vars'
    )
    return NextResponse.json({ ok: true })
  }

  let update: TelegramUpdate
  try {
    update = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  try {
    if (update.message?.text === '/start') {
      await callTelegramApi('sendGame', {
        chat_id: update.message.chat.id,
        game_short_name: gameShortName,
      })
    } else if (update.callback_query?.game_short_name === gameShortName) {
      const callbackQuery = update.callback_query
      const params = new URLSearchParams({ user_id: String(callbackQuery.from.id) })

      if (callbackQuery.inline_message_id) {
        params.set('inline_message_id', callbackQuery.inline_message_id)
      } else if (callbackQuery.message) {
        params.set('chat_id', String(callbackQuery.message.chat.id))
        params.set('message_id', String(callbackQuery.message.message_id))
      }

      await callTelegramApi('answerCallbackQuery', {
        callback_query_id: callbackQuery.id,
        url: `${appUrl}/play?${params.toString()}`,
      })
    } else if (update.callback_query) {
      // Acknowledge any other callback query so the client stops showing a loading spinner
      await callTelegramApi('answerCallbackQuery', {
        callback_query_id: update.callback_query.id,
      })
    }
  } catch (error) {
    console.error('Error handling Telegram webhook update:', error)
  }

  return NextResponse.json({ ok: true })
}
