import prisma from '../../config/prisma'

export const getQuestions = async (filters: any) => {
  const { category, difficulty } = filters
  return prisma.interviewQuestion.findMany({
    where: {
      ...(category && { category }),
      ...(difficulty && { difficulty }),
    },
    orderBy: { createdAt: 'desc' },
  })
}

export const createQuestion = async (data: any) => {
  const { category, question, answer, difficulty, isAI } = data
  return prisma.interviewQuestion.create({
    data: { category, question, answer, difficulty, isAI: !!isAI },
  })
}

export const bookmarkQuestion = async (userId: string, questionId: string) => {
  const existing = await prisma.bookmark.findUnique({
    where: { userId_questionId: { userId, questionId } },
  })

  if (existing) {
    await prisma.bookmark.delete({
      where: { userId_questionId: { userId, questionId } },
    })
    return { bookmarked: false }
  }

  await prisma.bookmark.create({ data: { userId, questionId } })
  return { bookmarked: true }
}

export const getBookmarkedQuestions = async (userId: string) => {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    include: { question: true },
    orderBy: { createdAt: 'desc' },
  })
  return bookmarks.map(b => b.question)
}
