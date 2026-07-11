export interface TelegramWebApp {
  initData: string
  ready: () => void
  expand: () => void
  close: () => void
  viewportHeight: number
  viewportStableHeight: number
  onEvent: (eventType: string, callback: () => void) => void
  offEvent: (eventType: string, callback: () => void) => void
}

export interface TelegramGameProxy {
  shareScore: () => void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
    TelegramGameProxy?: TelegramGameProxy
  }
}
