import api from './api'

export interface Streak {
  currentStreak: number
  longestStreak: number
  lastActiveDate: string | null
  activeToday: boolean
}

export const streakService = {
  get: () => api.get<Streak>('/streak'),
}
