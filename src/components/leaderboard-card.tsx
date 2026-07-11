import { Trophy, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TelegramHighScore } from '@/lib/telegram'

interface LeaderboardCardProps {
  entries: TelegramHighScore[]
  currentUserId: number
  isLoading: boolean
  error: string | null
}

function initialsFor(entry: TelegramHighScore): string {
  const first = entry.user.first_name?.[0] ?? ''
  const last = entry.user.last_name?.[0] ?? ''
  return (first + last).toUpperCase() || '?'
}

function nameFor(entry: TelegramHighScore, isCurrentUser: boolean): string {
  if (isCurrentUser) return 'You'
  return [entry.user.first_name, entry.user.last_name].filter(Boolean).join(' ')
}

export function LeaderboardCard({
  entries,
  currentUserId,
  isLoading,
  error,
}: LeaderboardCardProps) {
  return (
    <div className="w-full space-y-3 rounded-2xl border border-indigo-100 bg-white p-4 text-left">
      <div className="flex items-center gap-2 font-display text-sm font-semibold text-indigo-950">
        <Trophy className="h-4 w-4 text-amber-500" />
        Leaderboard
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-indigo-950/50">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading leaderboard...
        </div>
      )}

      {!isLoading && error && (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-rose-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {!isLoading && !error && entries.length === 0 && (
        <p className="py-6 text-center text-sm text-indigo-950/50">
          No scores yet.
          <br />
          Be the first player!
        </p>
      )}

      {!isLoading && !error && entries.length > 0 && (
        <ul className="space-y-1.5">
          {entries.map(entry => {
            const isCurrentUser = entry.user.id === currentUserId
            return (
              <li
                key={entry.user.id}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-2.5 py-2',
                  isCurrentUser && 'bg-violet-600'
                )}
              >
                <span
                  className={cn(
                    'w-6 shrink-0 text-xs font-bold',
                    isCurrentUser ? 'text-white/80' : 'text-indigo-950/40'
                  )}
                >
                  #{entry.position}
                </span>
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    isCurrentUser ? 'bg-white/20 text-white' : 'bg-violet-100 text-violet-700'
                  )}
                >
                  {initialsFor(entry)}
                </div>
                <span
                  className={cn(
                    'flex-1 truncate text-sm font-medium',
                    isCurrentUser ? 'text-white' : 'text-indigo-950'
                  )}
                >
                  {nameFor(entry, isCurrentUser)}
                </span>
                <span
                  className={cn(
                    'text-sm font-bold',
                    isCurrentUser ? 'text-white' : 'text-indigo-950'
                  )}
                >
                  {entry.score}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
