'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Trophy, LogOut, BarChart3, Clock } from 'lucide-react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
    }
  }

  const startGame = () => {
    // Check if user is logged in before starting
    if (!user) {
      router.push('/login')
      return
    }

    // Redirect to game page
    router.push('/game')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen md:h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 md:overflow-hidden">
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
          {/* Landing Page */}
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
                  <p className="text-lg text-gray-600 font-medium">The Classic Math Puzzle Game</p>
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
                      <p className="text-xs text-gray-600">5 minutes to score as much as you can</p>
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
        </div>
      </div>
    </div>
  )
}
