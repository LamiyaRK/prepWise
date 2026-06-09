import api from './api'

export interface Job {
  id: string
  title: string
  company: string
  location: string
  category: string
  type: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'REMOTE'
  link?: string
  description?: string
  postedById: string
  postedBy: { id: string; name: string }
  createdAt: string
}

export interface CreateJobPayload {
  title: string
  company: string
  location: string
  category: string
  type: string
  link?: string
  description?: string
}

export interface JobFilters {
  category?: string
  location?: string
  type?: string
}

export const jobsService = {
  getAll: (filters?: JobFilters) =>
    api.get<Job[]>('/jobs', { params: filters }),

  getById: (id: string) =>
    api.get<Job>(`/jobs/${id}`),

  create: (payload: CreateJobPayload) =>
    api.post<Job>('/jobs', payload),

  update: (id: string, payload: Partial<CreateJobPayload>) =>
    api.patch<Job>(`/jobs/${id}`, payload),

  remove: (id: string) =>
    api.delete(`/jobs/${id}`),
}