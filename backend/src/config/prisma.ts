import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

// Keep connection alive during development
if (process.env.NODE_ENV !== 'production') {
  setInterval(async () => {
    await prisma.$queryRaw`SELECT 1`
  }, 4 * 60 * 1000) // ping every 4 minutes
}

export default prisma