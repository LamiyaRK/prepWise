import api from './api'

export interface TestQuestion {
  id: string
  testId: string
  question: string
  options: string[]
  answer: string
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

export interface SubmitResult {
  score: number
  total: number
  percentage: number
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