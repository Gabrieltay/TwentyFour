import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

async function main() {
  const connectionString = process.env.DATABASE_URL!
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    const userId = 'ce82c992-6994-48ea-ad2d-52eeb454e0ae' // Your user ID from the logs

    console.log('Checking score for user:', userId)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { scores: true },
    })

    if (!user) {
      console.log('User not found')
      return
    }

    console.log('\nUser:', {
      email: user.email,
      name: user.name,
    })

    console.log('\nScores:')
    if (user.scores.length === 0) {
      console.log('  No scores found')
    } else {
      user.scores.forEach(score => {
        console.log(
          `  Score: ${score.score}, Created: ${score.createdAt}, Updated: ${score.updatedAt}`
        )
      })
    }

    // Also test the API query
    const scoreRecord = await prisma.score.findUnique({
      where: { userId },
    })

    console.log('\nScore via findUnique:')
    if (scoreRecord) {
      console.log(`  Score: ${scoreRecord.score}`)
    } else {
      console.log('  No score found')
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main().catch(console.error)
