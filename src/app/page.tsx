import { Clock, Send } from 'lucide-react'
import { GameLogo } from '@/components/game-logo'
import { HeaderSparkles } from '@/components/header-sparkles'

const TELEGRAM_BOT_URL = 'https://t.me/TwentyFourGameBot'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#241454] to-[#170c3a]">
      <div className="relative shrink-0 px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-10">
        <HeaderSparkles />
        <div className="relative z-10 flex justify-center">
          <GameLogo />
        </div>
      </div>

      <div className="-mt-4 flex-1 rounded-t-[32px] bg-[#F1EEFB]">
        <div className="mx-auto max-w-2xl space-y-4 p-4 pt-6 pb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1.5 text-sm font-semibold text-violet-700">
            🎯 Challenge Your Mind
          </div>
          <p className="text-sm font-medium text-indigo-950/60">The Classic Math Puzzle Game</p>

          {/* Example puzzle */}
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="mb-2 text-sm font-semibold text-indigo-950/50">Example Puzzle:</p>
            <div className="mb-3 flex justify-center gap-2">
              {[
                { num: 6, bg: 'bg-emerald-500' },
                { num: 6, bg: 'bg-rose-500' },
                { num: 3, bg: 'bg-blue-500' },
                { num: 1, bg: 'bg-amber-500' },
              ].map((tile, i) => (
                <div
                  key={i}
                  className={`font-display flex h-14 w-14 items-center justify-center rounded-xl text-xl font-semibold text-white shadow-sm ${tile.bg}`}
                >
                  {tile.num}
                </div>
              ))}
            </div>
            <p className="rounded-lg bg-indigo-50 p-2 text-center text-sm text-indigo-950/70">
              (6 - 3) × (6 + 1) = <span className="font-bold text-emerald-600">24</span>
            </p>
          </div>

          {/* How to Play */}
          <div className="space-y-3">
            <h3 className="font-display text-base font-semibold text-indigo-950">How to Play</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-violet-100">
                  <span className="text-xl">🎯</span>
                </div>
                <h4 className="mb-1 text-sm font-bold text-indigo-950">Goal</h4>
                <p className="text-xs text-indigo-950/60">Use all four numbers to make 24</p>
              </div>
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                  <span className="text-xl">➕</span>
                </div>
                <h4 className="mb-1 text-sm font-bold text-indigo-950">Operations</h4>
                <p className="text-xs text-indigo-950/60">Use +, -, ×, ÷ operations</p>
              </div>
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <h4 className="mb-1 text-sm font-bold text-indigo-950">Time Limit</h4>
                <p className="text-xs text-indigo-950/60">5 minutes to score as much as you can</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <div className="grid grid-cols-2 gap-2 text-xs text-indigo-950/70">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                <span>3 Skip Passes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Tap Interface</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span>Telegram Leaderboard</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span>Personal Best</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <a
            href={TELEGRAM_BOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 py-4 font-display font-semibold text-white shadow-[0_5px_0_0_#5b21b6] transition active:translate-y-[5px] active:shadow-none"
          >
            <Send className="h-5 w-5" />
            Play on Telegram
          </a>
          <p className="text-center text-xs text-indigo-950/50">
            Opens @TwentyFourGameBot in Telegram — no account or download needed.
          </p>
        </div>
      </div>
    </div>
  )
}
