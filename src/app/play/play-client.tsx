'use client'

import { useState, useEffect, useCallback } from 'react'
import Script from 'next/script'
import { generateNumbers } from '@/lib/game'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Trophy, Clock } from 'lucide-react'
import { Toaster, toast } from 'sonner'

type GameState = 'first' | 'second'

interface PlayClientProps {
  chatId?: number
  messageId?: number
  inlineMessageId?: string
  initialHighScore: number
}

const GAME_DURATION_SECONDS = 300

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

    setTimeout(() => {
      setShowScoreBadge(false)
      startGame()
    }, 3000)
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

  const numberColors = [
    'bg-green-500 hover:bg-green-600',
    'bg-red-500 hover:bg-red-600',
    'bg-blue-500 hover:bg-blue-600',
    'bg-yellow-500 hover:bg-yellow-600',
  ]

  return (
    <div className="h-[100dvh] flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="afterInteractive" />
      <Toaster position="top-center" richColors />

      <div className="bg-white shadow-sm p-3 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex justify-center items-center">
          <h1 className="text-2xl font-bold text-gray-900">TwentyFour</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <div className="text-sm text-muted-foreground">Score</div>
              <div className="text-3xl font-bold">{score}</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Clock className="h-4 w-4" />
                Time
              </div>
              <div className={`text-3xl font-bold ${timeLeft < 30 ? 'text-red-600' : ''}`}>
                {formatTime(timeLeft)}
              </div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Trophy className="h-4 w-4" />
                Best
              </div>
              <div className="text-3xl font-bold">{highScore}</div>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {numbers.map((num, index) => (
              <button
                key={index}
                onClick={() => handleNumberClick(index)}
                disabled={num === null}
                className={`
                    h-32 rounded-xl text-white font-bold
                    transition-all duration-200 shadow-lg
                    ${num === null ? 'invisible' : ''}
                    ${numberColors[index]}
                    ${selectedIndex === index ? 'ring-4 ring-white scale-95' : ''}
                    ${num !== null ? 'active:scale-95' : ''}
                    disabled:opacity-0 disabled:cursor-not-allowed
                    flex items-center justify-center
                  `}
              >
                {num !== null ? (
                  <span className={Number.isInteger(num) ? 'text-6xl' : 'text-4xl'}>
                    {toFraction(num)}
                  </span>
                ) : (
                  ''
                )}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {['+', '-', '×', '÷'].map(op => (
              <Button
                key={op}
                onClick={() => handleOperatorClick(op)}
                disabled={firstNumber === null}
                variant="outline"
                className={`h-16 text-3xl font-bold ${
                  selectedOperator === op ? 'bg-blue-500 text-white' : ''
                }`}
              >
                {op}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleSkip}
              disabled={skipsLeft === 0}
              variant="outline"
              size="lg"
              className="h-14 flex items-center gap-2"
            >
              <span>Skip</span>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      i < skipsLeft ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    {i < skipsLeft ? '✓' : ''}
                  </div>
                ))}
              </div>
            </Button>
            <Button onClick={resetRound} variant="outline" size="lg" className="h-14">
              Reset
            </Button>
          </div>

          <Button onClick={endGame} variant="destructive" className="w-full">
            End Game
          </Button>
        </div>
      </div>

      {showScoreBadge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-8 max-w-sm w-full text-center space-y-4 animate-in zoom-in-95 duration-300">
            {isNewHighScore && (
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                  <Trophy className="h-12 w-12 text-white" />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {isNewHighScore ? 'New High Score!' : 'Game Over'}
              </h2>
              <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {finalScore}
              </div>
              <p className="text-sm text-gray-600">
                {isNewHighScore
                  ? 'Congratulations! You beat your previous best!'
                  : 'Great effort! Starting a new round...'}
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
