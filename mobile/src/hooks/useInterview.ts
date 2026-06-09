import { useState, useEffect, useCallback } from 'react'
import { interviewService, InterviewQuestion, QuestionFilters } from '../services/interview.service'

export const useInterview = (filters?: QuestionFilters) => {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [bookmarks, setBookmarks] = useState<InterviewQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [qRes, bRes] = await Promise.all([
        interviewService.getAll(filters),
        interviewService.getBookmarks()
      ])
      setQuestions(qRes.data)
      setBookmarks(bRes.data)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load questions')
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  const toggleBookmark = async (questionId: string) => {
    const res = await interviewService.toggleBookmark(questionId)
    if (res.data.bookmarked) {
      const q = questions.find(q => q.id === questionId)
      if (q) setBookmarks(prev => [q, ...prev])
    } else {
      setBookmarks(prev => prev.filter(q => q.id !== questionId))
    }
    return res.data
  }

  useEffect(() => { fetch() }, [fetch])

  return { questions, bookmarks, loading, error, refetch: fetch, toggleBookmark }
}