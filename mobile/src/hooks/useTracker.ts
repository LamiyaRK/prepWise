import { useState, useEffect, useCallback } from 'react'
import { trackerService, TrackerEntry, CreateTrackerPayload } from '../services/tracker.service'
import { scheduleFollowUpReminder, cancelFollowUpReminder } from '../services/notifications.service'

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

    // Schedule a follow-up reminder 5 days out for freshly-applied entries.
    if (!payload.status || payload.status === 'APPLIED') {
      scheduleFollowUpReminder(res.data.id, res.data.companyName, 5).catch(() => {})
    }

    return res.data
  }

  const update = async (id: string, payload: Partial<CreateTrackerPayload>) => {
    const res = await trackerService.update(id, payload)
    setEntries(prev => prev.map(e => e.id === id ? res.data : e))

    // Once the status moves past "just applied," a follow-up nudge no longer
    // makes sense — cancel it so the user isn't reminded about something
    // that's already progressed (or been rejected).
    if (payload.status && payload.status !== 'APPLIED') {
      cancelFollowUpReminder(id).catch(() => {})
    }

    return res.data
  }

  const remove = async (id: string) => {
    await trackerService.remove(id)
    setEntries(prev => prev.filter(e => e.id !== id))
    cancelFollowUpReminder(id).catch(() => {})
  }

  useEffect(() => { fetch() }, [fetch])

  return { entries, loading, error, refetch: fetch, create, update, remove }
}
