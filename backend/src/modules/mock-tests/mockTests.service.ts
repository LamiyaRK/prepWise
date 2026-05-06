import prisma from '../../config/prisma'

export const getTests = async () => {
  return prisma.mockTest.findMany({
    include: { questions: true },
    orderBy: { createdAt: 'desc' }
  })
}

export const getTestById = async (id: string) => {
  return prisma.mockTest.findUnique({
    where: { id },
    include: { questions: true }
  })
}

export const createTest = async (data: any) => {
  const { questions, ...testData } = data
  return prisma.mockTest.create({
    data: {
      ...testData,
      questions: { create: questions }
    },
    include: { questions: true }
  })
}

export const submitTest = async (userId: string, testId: string, answers: string[]) => {
  const test = await prisma.mockTest.findUnique({
    where: { id: testId },
    include: { questions: true }
  })
  if (!test) throw new Error('Test not found')

  let score = 0
  test.questions.forEach((q, i) => {
    if (answers[i] && answers[i] === q.answer) score++
  })

  const result = await prisma.testResult.create({
    data: {
      userId,
      testId,
      score,
      total: test.questions.length
    }
  })

  return { score, total: test.questions.length, percentage: Math.round((score / test.questions.length) * 100), result }
}

export const getUserResults = async (userId: string) => {
  return prisma.testResult.findMany({
    where: { userId },
    include: { test: { select: { title: true, category: true } } },
    orderBy: { completedAt: 'desc' }
  })
}