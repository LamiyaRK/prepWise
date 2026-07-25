import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
  // eslint-disable-next-line no-var
  var __prismaKeepAlive: ReturnType<typeof setInterval> | undefined
}

const prisma =
  global.__prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma

  // Guard against stacking multiple intervals across hot reloads
  if (!global.__prismaKeepAlive) {
    global.__prismaKeepAlive = setInterval(async () => {
      await prisma.$queryRaw`SELECT 1`
    }, 4 * 60 * 1000)
  }
}

export default prisma
