import prisma from '../../config/prisma'

export const getJobs = async (filters: any) => {
  const { category, location, type } = filters
  return prisma.job.findMany({
    where: {
      ...(category && { category }),
      ...(location && { location }),
      ...(type && { type })
    },
    include: { postedBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' }
  })
}

export const getJobById = async (id: string) => {
  return prisma.job.findUnique({
    where: { id },
    include: { postedBy: { select: { id: true, name: true } } }
  })
}

export const createJob = async (userId: string, data: any) => {
  return prisma.job.create({
    data: { postedById: userId, ...data }
  })
}

export const updateJob = async (userId: string, id: string, data: any) => {
  const job = await prisma.job.findUnique({ where: { id } })
  if (!job || job.postedById !== userId) throw new Error('Not found or unauthorized')

  return prisma.job.update({
    where: { id },
    data
  })
}

export const deleteJob = async (userId: string, id: string) => {
  const job = await prisma.job.findUnique({ where: { id } })
  if (!job || job.postedById !== userId) throw new Error('Not found or unauthorized')

  return prisma.job.delete({ where: { id } })
}