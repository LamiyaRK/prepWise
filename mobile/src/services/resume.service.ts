import api from './api'

export interface ExperienceEntry {
  id: string
  company: string
  role: string
  startDate: string
  endDate: string
  current: boolean
  bullets: string[]
}

export interface EducationEntry {
  id: string
  school: string
  degree: string
  startDate: string
  endDate: string
}

export interface ProjectEntry {
  id: string
  name: string
  description: string
  link?: string
}

export interface ResumeData {
  fullName: string
  email: string
  phone: string
  location: string
  linkedin: string
  summary: string
  experience: ExperienceEntry[]
  education: EducationEntry[]
  skills: string[]
  projects: ProjectEntry[]
}

export interface ResumeListItem {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface ResumeDetail extends ResumeListItem {
  data: ResumeData
}

export const resumeService = {
  list: () => api.get<ResumeListItem[]>('/resumes'),
  get: (id: string) => api.get<ResumeDetail>(`/resumes/${id}`),
  create: (title: string, data: ResumeData) => api.post<ResumeDetail>('/resumes', { title, data }),
  update: (id: string, title: string, data: ResumeData) => api.patch<ResumeDetail>(`/resumes/${id}`, { title, data }),
  remove: (id: string) => api.delete(`/resumes/${id}`),
}

export const emptyResumeData = (): ResumeData => ({
  fullName: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  summary: '',
  experience: [],
  education: [],
  skills: [],
  projects: [],
})
