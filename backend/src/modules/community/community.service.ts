import prisma from '../../config/prisma'
import { recordActivity } from '../../shared/streak.service'

const userSelect = { id: true, name: true, avatar: true }

export const getPosts = async () => {
  return prisma.communityPost.findMany({
    where: { removed: false },
    include: {
      user: { select: userSelect },
      comments: {
        include: { user: { select: userSelect } },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export const getPostById = async (id: string) => {
  return prisma.communityPost.findUnique({
    where: { id },
    include: {
      user: { select: userSelect },
      comments: {
        include: { user: { select: userSelect } },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
}

export const createPost = async (userId: string, data: any) => {
  const { company, role, content, tags } = data

  if (!company?.trim() || !role?.trim() || !content?.trim()) {
    throw new Error('company, role, and content are required')
  }

  const post = await prisma.communityPost.create({
    data: {
      company,
      role,
      content,
      tags: Array.isArray(tags) ? tags : [],
      userId,
    },
    include: { user: { select: userSelect } },
  })

  await recordActivity(userId)
  return post
}

export const toggleLike = async (userId: string, postId: string) => {
  const post = await prisma.communityPost.findUnique({ where: { id: postId } })
  if (!post) throw new Error('Post not found')

  const alreadyLiked = post.likes.includes(userId)

  const updated = await prisma.communityPost.update({
    where: { id: postId },
    data: {
      likes: alreadyLiked
        ? { set: post.likes.filter(id => id !== userId) }
        : { push: userId },
    },
  })

  return { liked: !alreadyLiked, totalLikes: updated.likes.length }
}

export const addComment = async (userId: string, postId: string, content: string) => {
  if (!content?.trim()) throw new Error('Comment cannot be empty')

  const post = await prisma.communityPost.findUnique({ where: { id: postId } })
  if (!post) throw new Error('Post not found')

  return prisma.comment.create({
    data: { userId, postId, content },
    include: { user: { select: userSelect } },
  })
}

export const deletePost = async (userId: string, userRole: string, id: string) => {
  const post = await prisma.communityPost.findUnique({ where: { id } })
  if (!post) throw new Error('Not found')
  // Owners can delete their own posts; admins can moderate anyone's.
  if (post.userId !== userId && userRole !== 'ADMIN') throw new Error('Unauthorized')

  return prisma.communityPost.delete({ where: { id } })
}

export const reportPost = async (userId: string, postId: string, reason?: string) => {
  const post = await prisma.communityPost.findUnique({ where: { id: postId } })
  if (!post) throw new Error('Post not found')

  const existing = await prisma.postReport.findUnique({
    where: { postId_userId: { postId, userId } },
  })
  if (existing) throw new Error('You already reported this post')

  await prisma.postReport.create({ data: { postId, userId, reason } })
  return { reported: true }
}
