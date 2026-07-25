import api from './api'

export interface CompanyListItem {
  company: string
  postCount: number
}

export interface CompanyInsightPost {
  id: string
  role: string
  content: string
  tags: string[]
  likeCount: number
  commentCount: number
  createdAt: string
  user: { id: string; name: string; avatar?: string }
}

export interface CompanyInsights {
  company: string
  totalPosts: number
  topRoles: { label: string; count: number }[]
  topTags: { label: string; count: number }[]
  posts: CompanyInsightPost[]
}

export const companyInsightsService = {
  list: (search?: string) =>
    api.get<CompanyListItem[]>('/companies', { params: search ? { search } : {} }),

  getInsights: (company: string) =>
    api.get<CompanyInsights>(`/companies/${encodeURIComponent(company)}`),
}
