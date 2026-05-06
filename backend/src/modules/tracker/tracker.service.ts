import prisma from '../../config/prisma'

export const getTrackerEntries = async (userId: string) => {
  return prisma.jobTracker.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' }
  })
}

export const createTrackerEntry = async (userId: string, data: any) => {
  return prisma.jobTracker.create({
    data: { userId, ...data }
  })
}

export const updateTrackerEntry = async (userId: string, id: string, data: any) => {
  const entry = await prisma.jobTracker.findUnique({ where: { id } })
  if (!entry || entry.userId !== userId) throw new Error('Not found or unauthorized')

  return prisma.jobTracker.update({
    where: { id },
    data
  })
}

export const deleteTrackerEntry = async (userId: string, id: string) => {
  const entry = await prisma.jobTracker.findUnique({ where: { id } })
  if (!entry || entry.userId !== userId) throw new Error('Not found or unauthorized')

  return prisma.jobTracker.delete({ where: { id } })
}