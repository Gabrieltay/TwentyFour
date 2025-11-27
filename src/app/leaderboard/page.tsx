'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Home, Medal } from 'lucide-react'
import Link from 'next/link'

interface LeaderboardEntry {
  id: string
  score: number
  createdAt: string
  updatedAt: string
  user: {
    email: string
    name: string | null
    avatarUrl: string | null
  }
}

export default function LeaderboardPage() {
  const [scores, setScores] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
    loadScores()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
    } else {
      setUser(user)
    }
  }

  const loadScores = async () => {
    try {
      const response = await fetch('/api/scores')
      if (response.ok) {
        const data = await response.json()
        setScores(data.scores)
      }
    } catch (error) {
      console.error('Error loading scores:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Medal className="h-6 w-6 text-amber-700" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Leaderboard</h1>
          <Link href="/">
            <Button variant="outline" size="sm">
              <Home className="mr-2 h-4 w-4" />
              Back to Game
            </Button>
          </Link>
        </div>

        {/* Leaderboard Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Top Scores
            </CardTitle>
            <CardDescription>The highest scores achieved by players</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading scores...</div>
            ) : scores.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No scores yet. Be the first to set a record!
              </div>
            ) : (
              <div className="space-y-2">
                {scores.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                      entry.user.email === user?.email
                        ? 'bg-blue-50 border-2 border-blue-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center w-10">
                        {getMedalIcon(index + 1) || (
                          <span className="text-lg font-semibold text-gray-600">#{index + 1}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-1">
                        {/* Avatar */}
                        {entry.user.avatarUrl ? (
                          <img
                            src={entry.user.avatarUrl}
                            alt={entry.user.name || entry.user.email}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                            {(entry.user.name || entry.user.email).charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1">
                          <p
                            className={`font-medium ${
                              entry.user.email === user?.email ? 'text-blue-900' : 'text-gray-900'
                            }`}
                          >
                            {entry.user.name || entry.user.email}
                            {entry.user.email === user?.email && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">
                            Last played: {new Date(entry.updatedAt).toLocaleDateString()}{' '}
                            {new Date(entry.updatedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{entry.score}</p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
