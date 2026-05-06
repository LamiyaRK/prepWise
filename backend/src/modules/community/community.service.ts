import prisma from '../../config/prisma'

export const getPosts = async () => {
  return prisma.communityPost.findMany({
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      comments: {
        include: {
          user: { select: { id: true, name: true, avatar: true } }
        },
        orderBy: { createdAt: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export const getPostById = async (id: string) => {
  return prisma.communityPost.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      comments: {
        include: {
          user: { select: { id: true, name: true, avatar: true } }
        },
        orderBy: { createdAt: 'asc' }
      }
    }
  })
}

export const createPost = async (userId: string, data: any) => {
  return prisma.communityPost.create({
    data: { userId, ...data },
    include: {
      user: { select: { id: true, name: true, avatar: true } }
    }
  })
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
        : { push: userId }
    }
  })

  return { liked: !alreadyLiked, totalLikes: updated.likes.length }
}

export const addComment = async (userId: string, postId: string, content: string) => {
  const post = await prisma.communityPost.findUnique({ where: { id: postId } })
  if (!post) throw new Error('Post not found')

  return prisma.comment.create({
    data: { userId, postId, content },
    include: {
      user: { select: { id: true, name: true, avatar: true } }
    }
  })
}

export const deletePost = async (userId: string, id: string) => {
  const post = await prisma.communityPost.findUnique({ where: { id } })
  if (!post || post.userId !== userId) throw new Error('Not found or unauthorized')

  return prisma.communityPost.delete({ where: { id } })
}