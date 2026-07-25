import prisma from '../../config/prisma'
import { recordActivity } from '../../shared/streak.service'

export const getTrackerEntries = async (userId: string) => {
  return prisma.jobTracker.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  })
}

export const createTrackerEntry = async (userId: string, data: any) => {
  const { companyName, jobTitle, jobLink, status, stage, notes } = data

  if (!companyName?.trim()) throw new Error('Company name is required')

  const entry = await prisma.jobTracker.create({
    data: { companyName, jobTitle, jobLink, status, stage, notes, userId },
  })

  await recordActivity(userId)
  return entry
}

export const updateTrackerEntry = async (userId: string, id: string, data: any) => {
  const entry = await prisma.jobTracker.findUnique({ where: { id } })
  if (!entry || entry.userId !== userId) throw new Error('Not found or unauthorized')

  const { companyName, jobTitle, jobLink, status, stage, notes } = data

  return prisma.jobTracker.update({
    where: { id },
    data: {
      ...(companyName !== undefined && { companyName }),
      ...(jobTitle !== undefined && { jobTitle }),
      ...(jobLink !== undefined && { jobLink }),
      ...(status !== undefined && { status }),
      ...(stage !== undefined && { stage }),
      ...(notes !== undefined && { notes }),
    },
  })
}

export const deleteTrackerEntry = async (userId: string, id: string) => {
  const entry = await prisma.jobTracker.findUnique({ where: { id } })
  if (!entry || entry.userId !== userId) throw new Error('Not found or unauthorized')

  return prisma.jobTracker.delete({ where: { id } })
}

/** Powers the application-funnel chart on the tracker dashboard. */
export const getTrackerFunnel = async (userId: string) => {
  const entries = await prisma.jobTracker.findMany({ where: { userId }, select: { status: true } })
  const counts: Record<string, number> = { APPLIED: 0, IN_REVIEW: 0, INTERVIEW: 0, OFFER: 0, REJECTED: 0 }
  for (const e of entries) counts[e.status] = (counts[e.status] ?? 0) + 1
  return { total: entries.length, counts }
}
