import prisma from '../../config/prisma'

// ── Job verification queue ────────────────────────────────────────────────

export const getPendingJobs = async () => {
  return prisma.job.findMany({
    where: { verified: false, rejected: false },
    include: { postedBy: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  })
}

export const verifyJob = async (id: string) => {
  const job = await prisma.job.findUnique({ where: { id } })
  if (!job) throw new Error('Job not found')

  return prisma.job.update({
    where: { id },
    data: { verified: true, rejected: false, verifiedAt: new Date() },
  })
}

export const rejectJob = async (id: string) => {
  const job = await prisma.job.findUnique({ where: { id } })
  if (!job) throw new Error('Job not found')

  return prisma.job.update({
    where: { id },
    data: { verified: false, rejected: true },
  })
}

// ── Community moderation ──────────────────────────────────────────────────

export const getReportedPosts = async () => {
  return prisma.communityPost.findMany({
    where: { removed: false, reports: { some: {} } },
    include: {
      user: { select: { id: true, name: true } },
      reports: { include: { user: { select: { id: true, name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export const moderateRemovePost = async (id: string) => {
  const post = await prisma.communityPost.findUnique({ where: { id } })
  if (!post) throw new Error('Post not found')

  return prisma.communityPost.update({ where: { id }, data: { removed: true } })
}

export const dismissReports = async (postId: string) => {
  await prisma.postReport.deleteMany({ where: { postId } })
  return { dismissed: true }
}

// ── User / role management ────────────────────────────────────────────────

export const listUsers = async () => {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, university: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
}

export const setUserRole = async (userId: string, role: 'USER' | 'ADMIN') => {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('User not found')

  return prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  })
}

// ── Platform stats ─────────────────────────────────────────────────────────

export const getPlatformStats = async () => {
  const [totalUsers, admins, pendingJobs, verifiedJobs, posts, reportedPosts, trackerEntries, testResults, aiInterviews] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.job.count({ where: { verified: false, rejected: false } }),
      prisma.job.count({ where: { verified: true } }),
      prisma.communityPost.count({ where: { removed: false } }),
      prisma.communityPost.count({ where: { removed: false, reports: { some: {} } } }),
      prisma.jobTracker.count(),
      prisma.testResult.count(),
      prisma.aiInterviewSession.count(),
    ])

  return {
    users: { total: totalUsers, admins, regular: totalUsers - admins },
    jobs: { pending: pendingJobs, verified: verifiedJobs },
    community: { posts, reportedPosts },
    engagement: { trackerEntries, testsCompleted: testResults, aiInterviews },
  }
}
