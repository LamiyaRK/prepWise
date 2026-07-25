import api from './api'

export interface GeminiQuestion {
  question: string
  hint: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

export interface SpeechEvaluation {
  score: number
  feedback: string
  tips: string[]
  transcript?: string
}

export interface CVFeedback {
  score: number
  summary: string
  strengths: string[]
  improvements: string[]
  keywords: string[]
}

export const aiToolsService = {
  generateQuestions: (role: string, category: string, count: number) =>
    api.post<GeminiQuestion[]>('/ai-tools/generate-questions', { role, category, count }),

  evaluateAnswer: (question: string, answer: string) =>
    api.post<SpeechEvaluation>('/ai-tools/evaluate-answer', { question, answer }),

  evaluateVoice: (question: string, audioBase64: string, mimeType: string = 'm4a') =>
    api.post<SpeechEvaluation>('/ai-tools/evaluate-voice', { question, audio: audioBase64, mimeType }),

  analyzeCV: (cvText: string) =>
    api.post<CVFeedback>('/ai-tools/analyze-cv', { cvText }),

  analyzeCVFile: (fileBase64: string, mimeType: string, fileName: string) =>
    api.post<CVFeedback>('/ai-tools/analyze-cv', { fileBase64, mimeType, fileName }),

  improveText: (text: string, context: string) =>
    api.post<{ improved: string }>('/ai-tools/improve-text', { text, context }),
}