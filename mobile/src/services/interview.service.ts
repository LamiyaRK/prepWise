import api from './api'

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

export interface InterviewQuestion {
  id: string
  category: string
  question: string
  answer?: string
  difficulty: Difficulty
  isAI: boolean
  createdAt: string
}

export interface QuestionFilters {
  category?: string
  difficulty?: Difficulty
}

export const interviewService = {
  getAll: (filters?: QuestionFilters) =>
    api.get<InterviewQuestion[]>('/interview', { params: filters }),

  create: (payload: Omit<InterviewQuestion, 'id' | 'createdAt'>) =>
    api.post<InterviewQuestion>('/interview', payload),

  toggleBookmark: (questionId: string) =>
    api.post<{ bookmarked: boolean }>(`/interview/bookmark/${questionId}`),

  getBookmarks: () =>
    api.get<InterviewQuestion[]>('/interview/bookmarks'),
}