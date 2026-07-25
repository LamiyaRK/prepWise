import api from './api'

export interface StartInterviewResponse {
  sessionId: string
  question: string
  exchange: number
  maxExchanges: number
}

export interface RespondInterviewResponse {
  done: boolean
  question?: string
  exchange?: number
  maxExchanges?: number
  overallScore?: number
  feedback?: string
  strengths?: string[]
  improvements?: string[]
}

export interface InterviewHistoryItem {
  id: string
  role: string
  category: string
  status: 'IN_PROGRESS' | 'COMPLETED'
  finalScore: number | null
  createdAt: string
  completedAt: string | null
}

export interface InterviewMessage {
  id: string
  sender: 'AI' | 'USER'
  content: string
  createdAt: string
}

export interface InterviewSessionDetail extends InterviewHistoryItem {
  finalFeedback: string | null
  strengths: string[]
  improvements: string[]
  messages: InterviewMessage[]
}

export const aiInterviewService = {
  start: (role: string, category: string) =>
    api.post<StartInterviewResponse>('/ai-interview/start', { role, category }),

  respond: (sessionId: string, answer: string) =>
    api.post<RespondInterviewResponse>(`/ai-interview/${sessionId}/respond`, { answer }),

  getHistory: () =>
    api.get<InterviewHistoryItem[]>('/ai-interview/history'),

  getSession: (sessionId: string) =>
    api.get<InterviewSessionDetail>(`/ai-interview/${sessionId}`),
}
