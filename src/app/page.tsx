'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateNumbers } from '@/lib/game'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Trophy, LogOut, BarChart3, Clock } from 'lucide-react'
import Link from 'next/link'
import { Toaster, toast } from 'sonner'

type GameState = 'first' | 'second'

export default function GamePage() {
  const [numbers, setNumbers] = useState<(number | null)[]>([null, null, null, null])
  const [originalNumbers, setOriginalNumbers] = useState<number[]>([])
  const [nextNumbers, setNextNumbers] = useState<number[]>([]) // Pre-generated next puzzle
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [user, setUser] = useState<any>(null)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes = 300 seconds
  const [skipsLeft, setSkipsLeft] = useState(3)
  const [gameStarted, setGameStarted] = useState(false)

  // Calculator state
  const [gameState, setGameState] = useState<GameState>('first')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [firstNumber, setFirstNumber] = useState<number | null>(null)
  const [firstIndex, setFirstIndex] = useState<number | null>(null)
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null)
  const [operationCount, setOperationCount] = useState(0)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
    loadHighScore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (gameStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted, timeLeft])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    // Don't redirect - let users see the landing page
    if (user) {
      setUser(user)
    }
  }

  const loadHighScore = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    try {
      const response = await fetch(`/api/scores/highest?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setHighScore(data.highScore || 0)
      }
    } catch (error) {
      console.error('Error loading high score:', error)
    }
  }

  const startGame = () => {
    // Check if user is logged in before starting
    if (!user) {
      router.push('/login')
      return
    }

    setScore(0)
    setTimeLeft(300)
    setSkipsLeft(3)
    setGameStarted(true)
    // Pre-generate first puzzle and next puzzle
    const firstPuzzle = generateNumbers()
    setNumbers(firstPuzzle)
    setOriginalNumbers(firstPuzzle)
    // Pre-generate next puzzle in background
    setTimeout(() => {
      setNextNumbers(generateNumbers())
    }, 0)
    resetCalculator()

    // Scroll to top when game starts
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const newRound = () => {
    // Use pre-generated numbers if available, otherwise generate new ones
    const newNumbers = nextNumbers.length > 0 ? nextNumbers : generateNumbers()
    setNumbers(newNumbers)
    setOriginalNumbers(newNumbers)
    resetCalculator()

    // Pre-generate next puzzle in background for smooth experience
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

  const handleNumberClick = (index: number) => {
    const num = numbers[index]
    if (num === null) return

    if (gameState === 'first') {
      // First number selection
      if (selectedIndex === index) {
        // Deselect
        setSelectedIndex(null)
        setFirstNumber(null)
        setFirstIndex(null)
      } else {
        setSelectedIndex(index)
        setFirstNumber(num)
        setFirstIndex(index)
      }
    } else if (gameState === 'second' && selectedOperator) {
      // Second number selection - perform operation
      if (index === firstIndex) return // Can't select same number

      const result = calculateResult(firstNumber!, num, selectedOperator)

      if (result === null) {
        toast.error('Cannot divide by zero!', {
          duration: 1500,
        })
        return
      }

      // Update the numbers array
      const newNumbers = [...numbers]
      newNumbers[index] = result
      newNumbers[firstIndex!] = null
      setNumbers(newNumbers)

      const newOpCount = operationCount + 1

      // Check if this was the final operation
      if (newOpCount === 3) {
        if (Math.abs(result - 24) < 0.0001) {
          // Success!
          toast.success('🎉 Correct! +1 point', {
            duration: 1500,
          })
          const newScore = score + 1
          setScore(newScore)

          if (newScore > highScore) {
            setHighScore(newScore)
          }

          setTimeout(() => {
            newRound()
          }, 800)
        } else {
          toast.error(`❌ Result is ${result}, not 24. Try again!`, {
            duration: 1500,
          })
          setTimeout(() => {
            resetRound()
          }, 1200)
        }
      } else {
        // Continue with next operation
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

  const endGame = async () => {
    setGameStarted(false)

    // Only save and update high score if it's a new record
    if (score > highScore) {
      setHighScore(score)
      await saveScore(score)
    }
  }

  const saveScore = async (currentScore: number) => {
    try {
      console.log('Saving score:', currentScore)
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ score: currentScore }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Failed to save score:', errorData)
        throw new Error(errorData.error || 'Failed to save score')
      }

      const data = await response.json()
      console.log('Score saved successfully:', data)
    } catch (error) {
      console.error('Error saving score:', error)
      // Show error to user
      toast.error('⚠️ Failed to save score. Please check your connection.', {
        duration: 3000,
      })
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const toFraction = (num: number): string => {
    // If it's a whole number, return as is
    if (Number.isInteger(num)) {
      return num.toString()
    }

    // Handle negative numbers
    const sign = num < 0 ? '-' : ''
    const absNum = Math.abs(num)

    // Find the best fraction approximation
    const tolerance = 1.0e-6
    let numerator = 1
    let denominator = 1

    let bestNumerator = Math.round(absNum)
    let bestDenominator = 1
    let bestError = Math.abs(absNum - bestNumerator)

    // Try denominators up to 100
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

    // Simplify the fraction
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
    const divisor = gcd(bestNumerator, bestDenominator)
    numerator = bestNumerator / divisor
    denominator = bestDenominator / divisor

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
    <div className="min-h-screen md:h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 md:overflow-hidden">
      <Toaster position="top-center" richColors />
      {/* Header */}
      <div className="bg-white shadow-sm p-3 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">TwentyFour</h1>
          <div className="flex gap-2">
            {user ? (
              <>
                <Link href="/leaderboard">
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 md:overflow-y-auto overflow-visible">
        <div className="max-w-4xl mx-auto p-4 pb-8 space-y-3">
          {/* Stats Bar - Only show when game is started */}
          {gameStarted && (
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
          )}

          {!gameStarted ? (
            /* Landing Page */
            <div className="space-y-4">
              {/* Hero Section */}
              <Card className="p-6 text-center space-y-4 bg-gradient-to-br from-white to-blue-50 border-2 border-blue-100 overflow-hidden relative">
                {/* Animated background elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-20 animate-pulse" />
                <div
                  className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-200 rounded-full blur-3xl opacity-20 animate-pulse"
                  style={{ animationDelay: '1s' }}
                />

                <div className="relative z-10 space-y-4">
                  {/* Title with animation */}
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-2 animate-bounce">
                      <Trophy className="h-4 w-4" />
                      Challenge Your Mind
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Twenty Four
                    </h1>
                    <p className="text-lg text-gray-600 font-medium">
                      The Classic Math Puzzle Game
                    </p>
                  </div>

                  {/* Animated example */}
                  <div className="bg-white rounded-xl p-4 shadow-lg max-w-md mx-auto border border-blue-100">
                    <p className="text-sm text-gray-500 mb-2 font-semibold">Example Puzzle:</p>
                    <div className="flex justify-center gap-2 mb-3">
                      {[6, 6, 3, 1].map((num, i) => (
                        <div
                          key={i}
                          className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center text-xl font-bold shadow-lg transform hover:scale-110 transition-transform animate-fadeIn"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-mono bg-gray-50 p-2 rounded">
                        (6 - 3) × (6 + 1) = <span className="text-green-600 font-bold">24</span>
                      </p>
                    </div>
                  </div>

                  {/* How to Play */}
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-gray-900">How to Play</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
                      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-xl">🎯</span>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-1 text-sm">Goal</h4>
                        <p className="text-xs text-gray-600">Use all four numbers to make 24</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-xl">➕</span>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-1 text-sm">Operations</h4>
                        <p className="text-xs text-gray-600">Use +, -, ×, ÷ operations</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Clock className="h-5 w-5 text-purple-600" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-1 text-sm">Time Limit</h4>
                        <p className="text-xs text-gray-600">
                          5 minutes to score as much as you can
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Game Features */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 max-w-md mx-auto border border-blue-100">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2 text-gray-700">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        <span>3 Skip Passes</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        <span>Tap Interface</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                        <span>Global Leaderboard</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                        <span>Personal Best</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={startGame}
                    size="lg"
                    className="w-full max-w-md mx-auto text-base py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  >
                    Start Playing Now
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            <>
              {/* Number Buttons */}
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

              {/* Operator Buttons */}
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

              {/* Action Buttons */}
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

              {/* End Game Button */}
              <Button onClick={endGame} variant="destructive" className="w-full">
                End Game
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
