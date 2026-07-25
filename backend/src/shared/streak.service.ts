import prisma from '../config/prisma'

const startOfDay = (d: Date) => {
  const copy = new Date(d)
  copy.setUTCHours(0, 0, 0, 0)
  return copy
}

const daysBetween = (a: Date, b: Date) =>
  Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86_400_000)

export interface StreakResult {
  currentStreak: number
  longestStreak: number
  streakIncreased: boolean
}

/**
 * Call this whenever a user does something meaningful — applying to a job,
 * completing a mock test, finishing an AI interview, sharing a community
 * post. Idempotent per calendar day: calling it multiple times in the same
 * UTC day only counts once.
 */
export const recordActivity = async (userId: string): Promise<StreakResult> => {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('User not found')

  const today = startOfDay(new Date())

  if (user.lastActiveDate) {
    const diff = daysBetween(user.lastActiveDate, today)

    if (diff === 0) {
      // Already recorded today — no change.
      return { currentStreak: user.currentStreak, longestStreak: user.longestStreak, streakIncreased: false }
    }

    const newStreak = diff === 1 ? user.currentStreak + 1 : 1 // consecutive day vs. streak broken
    const newLongest = Math.max(user.longestStreak, newStreak)

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { currentStreak: newStreak, longestStreak: newLongest, lastActiveDate: today },
    })
    return { currentStreak: updated.currentStreak, longestStreak: updated.longestStreak, streakIncreased: true }
  }

  // First activity ever recorded for this user.
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { currentStreak: 1, longestStreak: Math.max(user.longestStreak, 1), lastActiveDate: today },
  })
  return { currentStreak: updated.currentStreak, longestStreak: updated.longestStreak, streakIncreased: true }
}

export const getStreak = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentStreak: true, longestStreak: true, lastActiveDate: true },
  })
  if (!user) throw new Error('User not found')

  const today = startOfDay(new Date())
  const activeToday = user.lastActiveDate ? daysBetween(user.lastActiveDate, today) === 0 : false
  // A streak that hasn't been touched in 2+ days is effectively broken, even
  // though we only reset the stored value the next time recordActivity runs.
  const isStale = user.lastActiveDate ? daysBetween(user.lastActiveDate, today) > 1 : false

  return {
    currentStreak: isStale ? 0 : user.currentStreak,
    longestStreak: user.longestStreak,
    lastActiveDate: user.lastActiveDate,
    activeToday,
  }
}
