import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

async function main() {
  // Create PostgreSQL connection pool
  const connectionString = process.env.DATABASE_URL!
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    console.log('Starting cleanup of duplicate scores...')

    // Get all users with scores
    const users = await prisma.user.findMany({
      include: {
        scores: {
          orderBy: { score: 'desc' },
        },
      },
    })

    console.log(`Found ${users.length} users`)

    for (const user of users) {
      if (user.scores.length > 1) {
        console.log(`User ${user.email} has ${user.scores.length} scores`)

        // Keep the highest score (first one after ordering by desc)
        const highestScore = user.scores[0]
        const scoresToDelete = user.scores.slice(1)

        console.log(`  Keeping score: ${highestScore.score}`)
        console.log(`  Deleting ${scoresToDelete.length} duplicate scores`)

        // Delete the duplicate scores
        await prisma.score.deleteMany({
          where: {
            id: {
              in: scoresToDelete.map(s => s.id),
            },
          },
        })

        console.log(`  ✓ Cleaned up duplicates for ${user.email}`)
      } else if (user.scores.length === 1) {
        console.log(`User ${user.email} has 1 score: ${user.scores[0].score}`)
      } else {
        console.log(`User ${user.email} has no scores`)
      }
    }

    console.log('\n✓ Cleanup complete!')
  } catch (error) {
    console.error('Error during cleanup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main().catch(console.error)
