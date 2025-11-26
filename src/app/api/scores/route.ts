import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/scores - Starting...')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

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

    // Create or update user in database
    console.log('Upserting user in database...')
    const dbUser = await prisma.user.upsert({
      where: { id: user.id },
      update: { email: user.email! },
      create: { id: user.id, email: user.email! },
    })
    console.log('User upserted:', dbUser.id)

    // Create score record
    console.log('Creating score record...')
    const scoreRecord = await prisma.score.create({
      data: {
        userId: user.id,
        score,
      },
    })
    console.log('Score created:', scoreRecord.id, scoreRecord.score)

    return NextResponse.json({ success: true, score: scoreRecord })
  } catch (error) {
    console.error('Error saving score - Full error:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const scores = await prisma.score.findMany({
      include: {
        user: true,
      },
      orderBy: {
        score: 'desc',
      },
      take: 10,
    })

    return NextResponse.json({ scores })
  } catch (error) {
    console.error('Error fetching scores:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
