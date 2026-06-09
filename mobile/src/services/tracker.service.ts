import api from './api'

export type TrackerStatus = 'APPLIED' | 'IN_REVIEW' | 'INTERVIEW' | 'OFFER' | 'REJECTED'
export type TrackerStage = 'RESUME' | 'PHONE_SCREEN' | 'TECHNICAL' | 'HR' | 'FINAL'

export interface TrackerEntry {
  id: string
  userId: string
  companyName: string
  jobTitle?: string
  jobLink?: string
  status: TrackerStatus
  stage?: TrackerStage
  appliedAt: string
  notes?: string
  updatedAt: string
}

export interface CreateTrackerPayload {
  companyName: string
  jobTitle?: string
  jobLink?: string
  status?: TrackerStatus
  stage?: TrackerStage
  notes?: string
}

export const trackerService = {
  getAll: () =>
    api.get<TrackerEntry[]>('/tracker'),

  create: (payload: CreateTrackerPayload) =>
    api.post<TrackerEntry>('/tracker', payload),

  update: (id: string, payload: Partial<CreateTrackerPayload>) =>
    api.patch<TrackerEntry>(`/tracker/${id}`, payload),

  remove: (id: string) =>
    api.delete(`/tracker/${id}`),
}