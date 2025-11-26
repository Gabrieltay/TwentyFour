import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const highestScore = await prisma.score.findFirst({
      where: { userId },
      orderBy: { score: 'desc' },
      select: { score: true },
    })

    return NextResponse.json({ highScore: highestScore?.score || 0 })
  } catch (error) {
    console.error('Error fetching highest score:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
