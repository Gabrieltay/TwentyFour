import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/scores - Starting...')
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log('User from Supabase:', user?.id, user?.email)

    if (!user) {
      console.error('No user found in session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { score } = await request.json()
    console.log('Received score:', score)

    if (typeof score !== 'number' || score < 0) {
      console.error('Invalid score value:', score)
      return NextResponse.json({ error: 'Invalid score' }, { status: 400 })
    }

    // Create or update user in database with metadata from Supabase
    console.log('Upserting user in database...')
    const dbUser = await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email!,
        name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      },
      create: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      },
    })
    console.log('User upserted:', dbUser.id)

    // Get existing score to check if new score is higher
    console.log('Checking for existing score...')
    const existingScore = await prisma.score.findUnique({
      where: { userId: user.id },
    })

    // Only update if new score is higher or if no score exists
    if (!existingScore || score > existingScore.score) {
      console.log('Upserting score record...')
      const scoreRecord = await prisma.score.upsert({
        where: { userId: user.id },
        update: {
          score,
        },
        create: {
          userId: user.id,
          score,
        },
      })
      console.log('Score upserted:', scoreRecord.id, scoreRecord.score)
      return NextResponse.json({ success: true, score: scoreRecord })
    } else {
      console.log('Score not higher than existing score, skipping...')
      return NextResponse.json({
        success: false,
        message: 'Score not higher than existing high score',
        currentHighScore: existingScore.score,
      })
    }
  } catch (error) {
    console.error('Error saving score - Full error:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get the highest score for each user using a subquery approach
    const scores = (await prisma.$queryRaw`
      SELECT DISTINCT ON (s."userId")
        s.id,
        s."userId",
        s.score,
        s."createdAt",
        s."updatedAt",
        u.email,
        u.name,
        u."avatarUrl"
      FROM "Score" s
      JOIN "User" u ON s."userId" = u.id
      ORDER BY s."userId", s.score DESC, s."updatedAt" DESC
    `) as Array<{
      id: string
      userId: string
      score: number
      createdAt: Date
      updatedAt: Date
      email: string
      name: string | null
      avatarUrl: string | null
    }>

    // Sort by score descending and take top 10
    const topScores = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(score => ({
        id: score.id,
        score: score.score,
        createdAt: score.createdAt,
        updatedAt: score.updatedAt,
        user: {
          email: score.email,
          name: score.name,
          avatarUrl: score.avatarUrl,
        },
      }))

    return NextResponse.json({ scores: topScores })
  } catch (error) {
    console.error('Error fetching scores:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
