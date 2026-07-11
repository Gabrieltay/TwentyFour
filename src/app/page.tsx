import Image from 'next/image'
import { Clock, Minus, Plus, Send, Sparkle, Sparkles, X as Times, Divide } from 'lucide-react'
import { HeaderSparkles } from '@/components/header-sparkles'

const TELEGRAM_BOT_URL = 'https://t.me/TwentyFourGameBot'

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-[#241454] to-[#170c3a]">
      <HeaderSparkles />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        {/* Hero */}
        <div className="flex items-center gap-4">
          <Image
            src="/game-avatar.png"
            alt="TwentyFour"
            width={96}
            height={96}
            className="h-20 w-20 shrink-0 rounded-full ring-4 ring-violet-950/40 sm:h-24 sm:w-24"
            priority
          />
          <div className="flex items-center gap-1.5">
            <div className="font-display leading-[0.8] font-semibold">
              <div className="text-4xl text-white [text-shadow:0_2px_0_rgba(0,0,0,0.35)] sm:text-5xl">
                TWENTY
              </div>
              <div
                className="bg-gradient-to-b from-amber-300 to-orange-500 bg-clip-text text-4xl text-transparent [text-shadow:0_2px_0_rgba(0,0,0,0.25)] sm:text-5xl"
                style={{ WebkitTextStroke: '0.5px rgba(0,0,0,0.35)' }}
              >
                FOUR
              </div>
            </div>
            <div className="relative flex h-10 w-10 rotate-6 items-center justify-center rounded-lg bg-white font-display text-base font-semibold text-indigo-950 shadow-md sm:h-11 sm:w-11 sm:text-lg">
              24
              <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-amber-300" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/20 px-3 py-1.5 text-sm font-semibold text-violet-200 ring-1 ring-violet-300/20">
            🎯 Challenge Your Mind
          </div>
          <p className="text-sm font-medium text-white/60">The classic math puzzle game</p>
        </div>

        {/* Example puzzle */}
        <div className="rounded-3xl bg-white p-5 shadow-xl">
          <p className="mb-4 text-center text-xs font-bold tracking-widest text-indigo-950/50 uppercase">
            Example Puzzle
          </p>
          <div className="mb-4 flex justify-center gap-3">
            {[
              { num: 6, bg: 'bg-emerald-500' },
              { num: 6, bg: 'bg-rose-500' },
              { num: 3, bg: 'bg-blue-500' },
              { num: 1, bg: 'bg-amber-500' },
            ].map((tile, i) => (
              <div
                key={i}
                className={`font-display flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-semibold text-white shadow-sm sm:h-20 sm:w-20 sm:text-3xl ${tile.bg}`}
              >
                {tile.num}
              </div>
            ))}
          </div>
          <p className="rounded-xl bg-indigo-50 p-3 text-center text-base text-indigo-950/70">
            (6 - 3) × (6 + 1) = <span className="font-bold text-emerald-600">24</span>
          </p>
        </div>

        {/* How to Play */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/20">
              <Sparkle className="h-3.5 w-3.5 text-violet-300" />
            </div>
            <h3 className="font-display text-base font-semibold tracking-wide text-white uppercase">
              How to Play
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-2xl">
                🎯
              </div>
              <h4 className="mb-1 text-sm font-bold text-indigo-950">Goal</h4>
              <p className="text-xs text-indigo-950/60">Use all four numbers to make 24</p>
            </div>
            <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
              <div className="mx-auto mb-2 grid h-12 w-12 grid-cols-2 gap-0.5 rounded-full bg-emerald-100 p-2.5 text-emerald-700">
                <Plus className="h-3 w-3" />
                <Minus className="h-3 w-3" />
                <Times className="h-3 w-3" />
                <Divide className="h-3 w-3" />
              </div>
              <h4 className="mb-1 text-sm font-bold text-indigo-950">Operations</h4>
              <p className="text-xs text-indigo-950/60">Use +, -, ×, ÷ operations</p>
            </div>
            <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Clock className="h-6 w-6 text-amber-600" />
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
        <div className="mt-auto space-y-3 pt-2">
          <a
            href={TELEGRAM_BOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 py-4 font-display font-semibold text-white shadow-[0_5px_0_0_#5b21b6] transition active:translate-y-[5px] active:shadow-none"
          >
            <Send className="h-5 w-5" />
            Play on Telegram
          </a>
          <p className="text-center text-xs text-white/50">
            Opens @TwentyFourGameBot in Telegram — no account or download needed.
          </p>
        </div>
      </div>
    </div>
  )
}
