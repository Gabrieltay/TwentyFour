import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export function GameLogo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-violet-700 text-2xl ring-4 ring-violet-950/40">
        🐰
      </div>
      <div className="flex items-center gap-1.5">
        <div className="font-display leading-[0.8] font-semibold">
          <div className="text-2xl text-white [text-shadow:0_2px_0_rgba(0,0,0,0.35)] sm:text-3xl">
            TWENTY
          </div>
          <div
            className="bg-gradient-to-b from-amber-300 to-orange-500 bg-clip-text text-2xl text-transparent [text-shadow:0_2px_0_rgba(0,0,0,0.25)] sm:text-3xl"
            style={{ WebkitTextStroke: '0.5px rgba(0,0,0,0.35)' }}
          >
            FOUR
          </div>
        </div>
        <div className="relative flex h-8 w-8 rotate-6 items-center justify-center rounded-lg bg-white font-display text-sm font-semibold text-indigo-950 shadow-md sm:h-9 sm:w-9 sm:text-base">
          24
          <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-amber-300" />
        </div>
      </div>
    </div>
  )
}
