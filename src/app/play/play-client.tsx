'use client'

import { useState, useEffect, useCallback } from 'react'
import Script from 'next/script'
import { generateNumbers } from '@/lib/game'
import { GameLogo } from '@/components/game-logo'
import { HeaderSparkles } from '@/components/header-sparkles'
import { cn } from '@/lib/utils'
import {
  Trophy,
  Clock,
  Share2,
  Star,
  Crown,
  Plus,
  Minus,
  X,
  Divide,
  Flag,
  RotateCcw,
  Sparkle,
  Check,
  BookOpen,
  Lightbulb,
  BarChart3,
  Settings as SettingsIcon,
  type LucideIcon,
} from 'lucide-react'
import { Toaster, toast } from 'sonner'

type GameState = 'first' | 'second'
type ModalKey = 'how-to-play' | 'tips' | 'stats'

interface PlayClientProps {
  chatId?: number
  messageId?: number
  inlineMessageId?: string
  initialHighScore: number
}

const GAME_DURATION_SECONDS = 300

const TILE_STYLES = [
  { bg: 'bg-emerald-500', bevel: 'shadow-[0_5px_0_0_#0d9354]' },
  { bg: 'bg-rose-500', bevel: 'shadow-[0_5px_0_0_#be123c]' },
  { bg: 'bg-blue-500', bevel: 'shadow-[0_5px_0_0_#1d4ed8]' },
  { bg: 'bg-amber-500', bevel: 'shadow-[0_5px_0_0_#b45309]' },
]

const OPERATORS: { symbol: string; label: string; Icon: LucideIcon }[] = [
  { symbol: '+', label: 'Add', Icon: Plus },
  { symbol: '-', label: 'Subtract', Icon: Minus },
  { symbol: '×', label: 'Multiply', Icon: X },
  { symbol: '÷', label: 'Divide', Icon: Divide },
]

function StatCard({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  valueClassName?: string
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl bg-white px-3 py-3 shadow-sm">
      <div className="flex items-center gap-1 text-[11px] font-bold tracking-wide text-indigo-950/60 uppercase">
        {icon}
        {label}
      </div>
      <div className={cn('font-display text-2xl font-semibold text-indigo-950', valueClassName)}>
        {value}
      </div>
    </div>
  )
}

function NavItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 px-3 py-1 text-violet-300 transition active:scale-95 active:text-white"
    >
      <Icon className="h-5 w-5" />
      <span className="text-[10px] font-semibold tracking-wide uppercase">{label}</span>
    </button>
  )
}

function InfoModal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="animate-in slide-in-from-bottom w-full max-w-sm space-y-4 rounded-t-3xl bg-white p-6 shadow-xl duration-300 sm:rounded-3xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-indigo-950">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-indigo-950/40 active:bg-indigo-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function PlayClient({
  chatId,
  messageId,
  inlineMessageId,
  initialHighScore,
}: PlayClientProps) {
  const [numbers, setNumbers] = useState<(number | null)[]>([null, null, null, null])
  const [originalNumbers, setOriginalNumbers] = useState<number[]>([])
  const [nextNumbers, setNextNumbers] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(initialHighScore)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SECONDS)
  const [skipsLeft, setSkipsLeft] = useState(3)
  const [gameStarted, setGameStarted] = useState(false)

  // Calculator state
  const [gameState, setGameState] = useState<GameState>('first')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [firstNumber, setFirstNumber] = useState<number | null>(null)
  const [firstIndex, setFirstIndex] = useState<number | null>(null)
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null)
  const [operationCount, setOperationCount] = useState(0)
  const [showScoreBadge, setShowScoreBadge] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  const [isNewHighScore, setIsNewHighScore] = useState(false)
  const [activeModal, setActiveModal] = useState<ModalKey | null>(null)

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready()
      window.Telegram.WebApp.expand()
    }
  }, [])

  const startGame = useCallback(() => {
    setScore(0)
    setTimeLeft(GAME_DURATION_SECONDS)
    setSkipsLeft(3)
    setGameStarted(true)
    const firstPuzzle = generateNumbers()
    setNumbers(firstPuzzle)
    setOriginalNumbers(firstPuzzle)
    setTimeout(() => {
      setNextNumbers(generateNumbers())
    }, 0)
    resetCalculator()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    startGame()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveScore = useCallback(
    async (currentScore: number) => {
      const initData = window.Telegram?.WebApp?.initData
      if (!initData) {
        console.error('Telegram initData unavailable, skipping score submission')
        return
      }

      try {
        const response = await fetch('/api/telegram/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: currentScore,
            initData,
            chatId,
            messageId,
            inlineMessageId,
          }),
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to submit score')
        }
      } catch (error) {
        console.error('Error submitting score to Telegram:', error)
        toast.error('⚠️ Failed to submit score to Telegram.', { duration: 3000 })
      }
    },
    [chatId, messageId, inlineMessageId]
  )

  useEffect(() => {
    if (!gameStarted || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted, timeLeft])

  const newRound = () => {
    const newNumbers = nextNumbers.length > 0 ? nextNumbers : generateNumbers()
    setNumbers(newNumbers)
    setOriginalNumbers(newNumbers)
    resetCalculator()
    setTimeout(() => {
      setNextNumbers(generateNumbers())
    }, 0)
  }

  const resetCalculator = () => {
    setGameState('first')
    setSelectedIndex(null)
    setFirstNumber(null)
    setFirstIndex(null)
    setSelectedOperator(null)
    setOperationCount(0)
  }

  const calculateResult = (a: number, b: number, operator: string): number | null => {
    switch (operator) {
      case '+':
        return a + b
      case '-':
        return a - b
      case '×':
        return a * b
      case '÷':
        return b === 0 ? null : a / b
      default:
        return null
    }
  }

  const handleNumberClick = (index: number) => {
    const num = numbers[index]
    if (num === null) return

    if (gameState === 'first') {
      if (selectedIndex === index) {
        setSelectedIndex(null)
        setFirstNumber(null)
        setFirstIndex(null)
      } else {
        setSelectedIndex(index)
        setFirstNumber(num)
        setFirstIndex(index)
      }
    } else if (gameState === 'second' && selectedOperator) {
      if (index === firstIndex) return

      const result = calculateResult(firstNumber!, num, selectedOperator)

      if (result === null) {
        toast.error('Cannot divide by zero!', { duration: 1500 })
        return
      }

      const newNumbers = [...numbers]
      newNumbers[index] = result
      newNumbers[firstIndex!] = null
      setNumbers(newNumbers)

      const newOpCount = operationCount + 1

      if (newOpCount === 3) {
        if (Math.abs(result - 24) < 0.0001) {
          toast.success('🎉 Correct! +1 point', { duration: 1500 })
          setScore(prev => prev + 1)
          setTimeout(() => {
            newRound()
          }, 800)
        } else {
          toast.error(`❌ Result is ${result}, not 24. Try again!`, { duration: 1500 })
          setTimeout(() => {
            resetRound()
          }, 1200)
        }
      } else {
        setOperationCount(newOpCount)
        setSelectedIndex(index)
        setFirstNumber(result)
        setFirstIndex(index)
        setGameState('first')
        setSelectedOperator(null)
      }
    }
  }

  const handleOperatorClick = (operator: string) => {
    if (firstNumber === null || firstIndex === null) return
    setSelectedOperator(operator)
    setGameState('second')
  }

  const resetRound = () => {
    setNumbers([...originalNumbers])
    resetCalculator()
  }

  const handleSkip = () => {
    if (skipsLeft > 0) {
      setSkipsLeft(skipsLeft - 1)
      newRound()
    }
  }

  const endGame = () => {
    setGameStarted(false)
    setFinalScore(score)
    const isNewRecord = score > highScore
    setIsNewHighScore(isNewRecord)
    setShowScoreBadge(true)

    if (isNewRecord) {
      setHighScore(score)
      saveScore(score)
    }
  }

  const handlePlayAgain = () => {
    setShowScoreBadge(false)
    startGame()
  }

  const handleShareScore = () => {
    window.TelegramGameProxy?.shareScore()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const toFraction = (num: number): string => {
    if (Number.isInteger(num)) {
      return num.toString()
    }

    const sign = num < 0 ? '-' : ''
    const absNum = Math.abs(num)
    const tolerance = 1.0e-6

    let bestNumerator = Math.round(absNum)
    let bestDenominator = 1
    let bestError = Math.abs(absNum - bestNumerator)

    for (let d = 2; d <= 100; d++) {
      const n = Math.round(absNum * d)
      const value = n / d
      const error = Math.abs(absNum - value)

      if (error < bestError) {
        bestNumerator = n
        bestDenominator = d
        bestError = error

        if (error < tolerance) break
      }
    }

    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
    const divisor = gcd(bestNumerator, bestDenominator)
    const numerator = bestNumerator / divisor
    const denominator = bestDenominator / divisor

    if (denominator === 1) {
      return sign + numerator.toString()
    }

    return `${sign}${numerator}/${denominator}`
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-gradient-to-b from-[#241454] to-[#170c3a]">
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="afterInteractive" />
      <Script src="https://telegram.org/js/games.js" strategy="afterInteractive" />
      <Toaster position="top-center" richColors />

      <div className="relative shrink-0 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-8">
        <HeaderSparkles />
        <div className="relative z-10 flex items-center justify-between">
          <GameLogo />
          <button
            onClick={() => toast(`🏆 Best score: ${highScore}`, { duration: 2000 })}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-amber-300 ring-1 ring-white/10 transition active:scale-95"
            aria-label="Best score"
          >
            <Trophy className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="relative z-10 -mt-4 flex-1 overflow-y-auto rounded-t-[32px] bg-[#F1EEFB]">
        <div className="mx-auto max-w-md space-y-4 p-4 pb-6">
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              icon={<Star className="h-3.5 w-3.5 text-violet-500" />}
              label="Score"
              value={score}
            />
            <StatCard
              icon={<Clock className="h-3.5 w-3.5 text-blue-500" />}
              label="Time"
              value={formatTime(timeLeft)}
              valueClassName={timeLeft < 30 ? 'text-rose-600' : undefined}
            />
            <StatCard
              icon={<Crown className="h-3.5 w-3.5 text-amber-500" />}
              label="Best"
              value={highScore}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {numbers.map((num, index) => (
              <button
                key={index}
                onClick={() => handleNumberClick(index)}
                disabled={num === null}
                className={cn(
                  'relative flex aspect-square items-center justify-center overflow-hidden rounded-[28px] font-display font-semibold text-white transition-all duration-150',
                  TILE_STYLES[index].bg,
                  TILE_STYLES[index].bevel,
                  num === null && 'invisible',
                  num !== null && 'active:translate-y-[5px] active:shadow-none',
                  selectedIndex === index && 'ring-4 ring-white'
                )}
              >
                <Sparkle className="absolute top-3 left-3 h-4 w-4 text-white/30" />
                <Sparkle className="absolute right-4 bottom-4 h-3 w-3 text-white/20" />
                {num !== null && (
                  <span
                    className={cn(
                      '[text-shadow:0_2px_0_rgba(0,0,0,0.15)]',
                      Number.isInteger(num) ? 'text-5xl' : 'text-3xl'
                    )}
                  >
                    {toFraction(num)}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {OPERATORS.map(op => (
              <button
                key={op.symbol}
                onClick={() => handleOperatorClick(op.symbol)}
                disabled={firstNumber === null}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-2xl bg-white py-3 text-indigo-900 shadow-sm transition active:scale-95 disabled:opacity-40',
                  selectedOperator === op.symbol && 'bg-violet-600 text-white'
                )}
              >
                <op.Icon className="h-5 w-5" />
                <span className="text-[10px] font-bold tracking-wide uppercase">{op.label}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleSkip}
              disabled={skipsLeft === 0}
              className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left shadow-sm transition active:scale-[0.98] disabled:opacity-50"
            >
              <Sparkle className="h-5 w-5 shrink-0 text-violet-400" />
              <div className="min-w-0 flex-1">
                <div className="font-display text-sm font-semibold text-indigo-950">Skip</div>
                <div className="text-[11px] text-indigo-950/50">Use wisely!</div>
              </div>
              <div className="flex shrink-0 gap-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full',
                      i < skipsLeft ? 'bg-violet-500' : 'bg-gray-200'
                    )}
                  >
                    {i < skipsLeft && <Check className="h-3 w-3 text-white" />}
                  </div>
                ))}
              </div>
            </button>
            <button
              onClick={resetRound}
              className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left shadow-sm transition active:scale-[0.98]"
            >
              <RotateCcw className="h-5 w-5 shrink-0 text-violet-400" />
              <div>
                <div className="font-display text-sm font-semibold text-indigo-950">Reset</div>
                <div className="text-[11px] text-indigo-950/50">Start over</div>
              </div>
            </button>
          </div>

          <button
            onClick={endGame}
            className="flex w-full items-center gap-3 rounded-2xl bg-rose-500 px-5 py-4 text-left text-white shadow-[0_5px_0_0_#9f1239] transition active:translate-y-[5px] active:shadow-none"
          >
            <Flag className="h-6 w-6 shrink-0" />
            <div>
              <div className="font-display text-base font-semibold">End Game</div>
              <div className="text-xs text-white/80">Finish and see your score</div>
            </div>
          </button>
        </div>
      </div>

      <div className="shrink-0 border-t border-white/5 bg-[#1c1044] px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-md justify-around">
          <NavItem
            icon={BookOpen}
            label="How to Play"
            onClick={() => setActiveModal('how-to-play')}
          />
          <NavItem icon={Lightbulb} label="Tips" onClick={() => setActiveModal('tips')} />
          <NavItem icon={BarChart3} label="Stats" onClick={() => setActiveModal('stats')} />
          <NavItem
            icon={SettingsIcon}
            label="Settings"
            onClick={() => toast('⚙️ Settings coming soon', { duration: 1500 })}
          />
        </div>
      </div>

      {activeModal === 'how-to-play' && (
        <InfoModal title="How to Play" onClose={() => setActiveModal(null)}>
          <div className="space-y-3 text-sm text-indigo-950/70">
            <p>
              Combine the four numbers using <strong>+</strong>, <strong>−</strong>,{' '}
              <strong>×</strong>, and <strong>÷</strong> to make exactly <strong>24</strong>.
            </p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>Tap a number, then an operator, then a second number to combine them.</li>
              <li>Keep combining until every number has been used.</li>
              <li>Reach 24 to score a point and move on to the next puzzle.</li>
            </ol>
            <p>You have 3 skips and 5 minutes on the clock — use them wisely!</p>
          </div>
        </InfoModal>
      )}

      {activeModal === 'tips' && (
        <InfoModal title="Tips" onClose={() => setActiveModal(null)}>
          <ul className="space-y-2 text-sm text-indigo-950/70">
            <li>💡 Look for pairs that multiply cleanly into 24, like 3×8 or 4×6.</li>
            <li>💡 Division can turn awkward numbers into useful fractions.</li>
            <li>💡 Stuck? Skip the puzzle instead of burning your timer trying to force it.</li>
          </ul>
        </InfoModal>
      )}

      {activeModal === 'stats' && (
        <InfoModal title="Stats" onClose={() => setActiveModal(null)}>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="font-display text-2xl font-semibold text-indigo-950">{score}</div>
              <div className="text-xs text-indigo-950/50">Score</div>
            </div>
            <div>
              <div className="font-display text-2xl font-semibold text-indigo-950">{highScore}</div>
              <div className="text-xs text-indigo-950/50">Best</div>
            </div>
            <div>
              <div className="font-display text-2xl font-semibold text-indigo-950">
                {formatTime(timeLeft)}
              </div>
              <div className="text-xs text-indigo-950/50">Time Left</div>
            </div>
          </div>
        </InfoModal>
      )}

      {showScoreBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="animate-in zoom-in-95 w-full max-w-sm space-y-4 rounded-3xl bg-white p-8 text-center shadow-xl duration-300">
            {isNewHighScore && (
              <div className="flex justify-center">
                <div className="flex h-20 w-20 animate-bounce items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
                  <Trophy className="h-12 w-12 text-white" />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-semibold text-indigo-950">
                {isNewHighScore ? 'New High Score!' : 'Game Over'}
              </h2>
              <div className="font-display bg-gradient-to-r from-violet-600 to-rose-500 bg-clip-text text-6xl font-semibold text-transparent">
                {finalScore}
              </div>
              <p className="text-sm text-indigo-950/60">
                {isNewHighScore ? 'Congratulations! You beat your previous best!' : 'Great effort!'}
              </p>
            </div>
            <button
              onClick={handleShareScore}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-indigo-100 bg-white py-3 font-semibold text-indigo-950 shadow-sm transition active:scale-[0.98]"
            >
              <Share2 className="h-4 w-4" />
              Share Score
            </button>
            <button
              onClick={handlePlayAgain}
              className="w-full rounded-2xl bg-violet-600 py-3 font-semibold text-white shadow-[0_4px_0_0_#5b21b6] transition active:translate-y-[4px] active:shadow-none"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
