'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateNumbers } from '@/lib/game'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Trophy, LogOut, BarChart3, Clock } from 'lucide-react'
import Link from 'next/link'

type GameState = 'first' | 'second'

export default function GamePage() {
  const [numbers, setNumbers] = useState<(number | null)[]>([null, null, null, null])
  const [originalNumbers, setOriginalNumbers] = useState<number[]>([])
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
  const [message, setMessage] = useState('')

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
    loadHighScore()
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (gameStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [gameStarted, timeLeft])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
    } else {
      setUser(user)
    }
  }

  const loadHighScore = async () => {
    const { data: { user } } = await supabase.auth.getUser()
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
    setScore(0)
    setTimeLeft(300)
    setSkipsLeft(3)
    setGameStarted(true)
    newRound()
  }

  const newRound = () => {
    const newNumbers = generateNumbers()
    setNumbers(newNumbers)
    setOriginalNumbers(newNumbers)
    resetCalculator()
    setMessage('')
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
        setMessage('Cannot divide by zero!')
        setTimeout(() => setMessage(''), 2000)
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
          setMessage('🎉 Correct! +1 point')
          const newScore = score + 1
          setScore(newScore)

          if (newScore > highScore) {
            setHighScore(newScore)
            saveScore(newScore)
          }

          setTimeout(() => {
            newRound()
          }, 1500)
        } else {
          setMessage(`❌ Result is ${result}, not 24. Try again!`)
          setTimeout(() => {
            resetRound()
          }, 2000)
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
    setMessage('')
  }

  const handleSkip = () => {
    if (skipsLeft > 0) {
      setSkipsLeft(skipsLeft - 1)
      newRound()
    }
  }

  const endGame = async () => {
    setGameStarted(false)
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
      setMessage('⚠️ Failed to save score. Please check your connection.')
      setTimeout(() => setMessage(''), 3000)
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

  if (!user) return null

  const numberColors = [
    'bg-green-500 hover:bg-green-600',
    'bg-red-500 hover:bg-red-600',
    'bg-blue-500 hover:bg-blue-600',
    'bg-yellow-500 hover:bg-yellow-600'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">TwentyFour</h1>
          <div className="flex gap-2">
            <Link href="/leaderboard">
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Stats Bar */}
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

        {/* Skips Remaining */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                i < skipsLeft ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              {i < skipsLeft ? '✓' : ''}
            </div>
          ))}
        </div>

        {!gameStarted ? (
          /* Start Screen */
          <Card className="p-8 text-center space-y-4">
            <h2 className="text-3xl font-bold">Ready to Play?</h2>
            <p className="text-muted-foreground">
              Make 24 using all four numbers and basic operations
            </p>
            <p className="text-sm text-muted-foreground">
              • 5 minutes time limit<br />
              • 3 skip passes<br />
              • Tap numbers and operators in sequence
            </p>
            <Button onClick={startGame} size="lg" className="w-full">
              Start Game
            </Button>
          </Card>
        ) : (
          <>
            {/* Message */}
            {message && (
              <div className={`p-4 rounded-lg text-center font-bold ${
                message.includes('Correct') || message.includes('🎉')
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {message}
              </div>
            )}

            {/* Number Buttons */}
            <div className="grid grid-cols-2 gap-4">
              {numbers.map((num, index) => (
                <button
                  key={index}
                  onClick={() => handleNumberClick(index)}
                  disabled={num === null}
                  className={`
                    h-32 rounded-xl text-white text-6xl font-bold
                    transition-all duration-200 shadow-lg
                    ${num === null ? 'invisible' : ''}
                    ${numberColors[index]}
                    ${selectedIndex === index ? 'ring-4 ring-white scale-95' : ''}
                    ${num !== null ? 'active:scale-95' : ''}
                    disabled:opacity-0 disabled:cursor-not-allowed
                  `}
                >
                  {num !== null ? num : ''}
                </button>
              ))}
            </div>

            {/* Operator Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {['+', '-', '×', '÷'].map((op) => (
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
                className="h-14"
              >
                Skip ({skipsLeft} left)
              </Button>
              <Button
                onClick={resetRound}
                variant="outline"
                size="lg"
                className="h-14"
              >
                Reset
              </Button>
            </div>

            {/* End Game Button */}
            <Button
              onClick={endGame}
              variant="destructive"
              className="w-full"
            >
              End Game
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
