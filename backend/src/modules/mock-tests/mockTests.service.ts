import prisma from '../../config/prisma'
import { recordActivity } from '../../shared/streak.service'

// Public-facing question shape — deliberately omits `answer`.
const publicQuestionSelect = {
  id: true,
  testId: true,
  question: true,
  options: true,
} as const

export const getTests = async () => {
  return prisma.mockTest.findMany({
    include: { questions: { select: publicQuestionSelect } },
    orderBy: { createdAt: 'desc' },
  })
}

export const getTestById = async (id: string) => {
  return prisma.mockTest.findUnique({
    where: { id },
    include: { questions: { select: publicQuestionSelect } },
  })
}

export const createTest = async (data: any) => {
  const { questions, ...testData } = data
  return prisma.mockTest.create({
    data: {
      ...testData,
      questions: { create: questions },
    },
    include: { questions: { select: publicQuestionSelect } },
  })
}

export const submitTest = async (userId: string, testId: string, answers: string[]) => {
  // Fetch WITH answers — this happens server-side only, never sent to the
  // client until after grading.
  const test = await prisma.mockTest.findUnique({
    where: { id: testId },
    include: { questions: true },
  })
  if (!test) throw new Error('Test not found')

  let score = 0
  const review = test.questions.map((q, i) => {
    const userAnswer = answers[i] ?? null
    const isCorrect = userAnswer === q.answer
    if (isCorrect) score++
    return {
      questionId: q.id,
      question: q.question,
      options: q.options,
      correctAnswer: q.answer,
      userAnswer,
      isCorrect,
    }
  })

  const result = await prisma.testResult.create({
    data: {
      userId,
      testId,
      score,
      total: test.questions.length,
    },
  })

  await recordActivity(userId)

  return {
    score,
    total: test.questions.length,
    percentage: Math.round((score / test.questions.length) * 100),
    result,
    review, // answers revealed here, only after grading
  }
}

export const getUserResults = async (userId: string) => {
  return prisma.testResult.findMany({
    where: { userId },
    include: { test: { select: { title: true, category: true } } },
    orderBy: { completedAt: 'desc' },
  })
}
