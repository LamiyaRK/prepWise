import api from './api'

// Public shape — the correct answer is never sent to the client before
// submission. See TestReviewItem for the post-submission shape.
export interface TestQuestion {
  id: string
  testId: string
  question: string
  options: string[]
}

export interface MockTest {
  id: string
  title: string
  category: string
  duration: number
  questions: TestQuestion[]
  createdAt: string
}

export interface TestResult {
  id: string
  testId: string
  score: number
  total: number
  percentage: number
  completedAt: string
  test: { title: string; category: string }
}

export interface TestReviewItem {
  questionId: string
  question: string
  options: string[]
  correctAnswer: string
  userAnswer: string | null
  isCorrect: boolean
}

export interface SubmitResult {
  score: number
  total: number
  percentage: number
  review: TestReviewItem[]
}

export const mockTestsService = {
  getAll: () =>
    api.get<MockTest[]>('/tests'),

  getById: (id: string) =>
    api.get<MockTest>(`/tests/${id}`),

  submit: (id: string, answers: string[]) =>
    api.post<SubmitResult>(`/tests/${id}/submit`, { answers }),

  getMyResults: () =>
    api.get<TestResult[]>('/tests/results/me'),
}
