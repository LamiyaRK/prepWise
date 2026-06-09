import { useState, useEffect, useCallback } from 'react'
import { jobsService, Job, JobFilters } from '../services/jobs.service'

export const useJobs = (filters?: JobFilters) => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await jobsService.getAll(filters)
      setJobs(res.data)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => { fetch() }, [fetch])

  return { jobs, loading, error, refetch: fetch }
}