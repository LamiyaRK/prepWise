import prisma from '../../config/prisma'

export const getJobs = async (filters: any) => {
  const { category, location, type } = filters
  return prisma.job.findMany({
    where: {
      verified: true,
      rejected: false,
      ...(category && { category }),
      ...(location && { location }),
      ...(type && { type }),
    },
    include: { postedBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export const getMyJobs = async (userId: string) => {
  return prisma.job.findMany({
    where: { postedById: userId },
    include: { postedBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export const getJobById = async (id: string) => {
  return prisma.job.findUnique({
    where: { id },
    include: { postedBy: { select: { id: true, name: true } } },
  })
}

export const createJob = async (userId: string, data: any) => {
  const { title, company, location, category, type, link, description } = data

  if (!title?.trim() || !company?.trim() || !location?.trim() || !category?.trim() || !type) {
    throw new Error('title, company, location, category, and type are required')
  }

  return prisma.job.create({
    data: {
      title,
      company,
      location,
      category,
      type,
      link,
      description,
      postedById: userId,
      // verified defaults to false — every new job starts pending admin review,
      // regardless of what the client sends.
    },
  })
}

export const updateJob = async (userId: string, id: string, data: any) => {
  const job = await prisma.job.findUnique({ where: { id } })
  if (!job || job.postedById !== userId) throw new Error('Not found or unauthorized')

  const { title, company, location, category, type, link, description } = data

  return prisma.job.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(company !== undefined && { company }),
      ...(location !== undefined && { location }),
      ...(category !== undefined && { category }),
      ...(type !== undefined && { type }),
      ...(link !== undefined && { link }),
      ...(description !== undefined && { description }),
      // Editing a job resets it to pending review so an approved listing
      // can't be silently swapped for something else after approval.
      verified: false,
      rejected: false,
      verifiedAt: null,
    },
  })
}

export const deleteJob = async (userId: string, id: string) => {
  const job = await prisma.job.findUnique({ where: { id } })
  if (!job || job.postedById !== userId) throw new Error('Not found or unauthorized')

  return prisma.job.delete({ where: { id } })
}
