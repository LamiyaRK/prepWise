import { useState, useEffect, useCallback } from 'react'
import { trackerService, TrackerEntry, CreateTrackerPayload } from '../services/tracker.service'

export const useTracker = () => {
  const [entries, setEntries] = useState<TrackerEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await trackerService.getAll()
      setEntries(res.data)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load tracker')
    } finally {
      setLoading(false)
    }
  }, [])

  const create = async (payload: CreateTrackerPayload) => {
    const res = await trackerService.create(payload)
    setEntries(prev => [res.data, ...prev])
    return res.data
  }

  const update = async (id: string, payload: Partial<CreateTrackerPayload>) => {
    const res = await trackerService.update(id, payload)
    setEntries(prev => prev.map(e => e.id === id ? res.data : e))
    return res.data
  }

  const remove = async (id: string) => {
    await trackerService.remove(id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  useEffect(() => { fetch() }, [fetch])

  return { entries, loading, error, refetch: fetch, create, update, remove }
}