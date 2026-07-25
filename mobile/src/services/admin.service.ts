import api from './api'

export interface PendingJob {
  id: string
  title: string
  company: string
  location: string
  category: string
  type: string
  description?: string
  createdAt: string
  postedBy: { id: string; name: string; email: string }
}

export interface ReportedPost {
  id: string
  company: string
  role: string
  content: string
  createdAt: string
  user: { id: string; name: string }
  reports: { id: string; reason?: string; user: { id: string; name: string } }[]
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  university?: string
  createdAt: string
}

export interface PlatformStats {
  users: { total: number; admins: number; regular: number }
  jobs: { pending: number; verified: number }
  community: { posts: number; reportedPosts: number }
  engagement: { trackerEntries: number; testsCompleted: number; aiInterviews: number }
}

export const adminService = {
  getStats: () => api.get<PlatformStats>('/admin/stats'),

  getPendingJobs: () => api.get<PendingJob[]>('/admin/jobs/pending'),
  approveJob: (id: string) => api.post(`/admin/jobs/${id}/approve`),
  rejectJob: (id: string) => api.post(`/admin/jobs/${id}/reject`),

  getReportedPosts: () => api.get<ReportedPost[]>('/admin/community/reported'),
  removePost: (id: string) => api.post(`/admin/community/${id}/remove`),
  dismissReports: (id: string) => api.post(`/admin/community/${id}/dismiss-reports`),

  getUsers: () => api.get<AdminUser[]>('/admin/users'),
  setUserRole: (id: string, role: 'USER' | 'ADMIN') => api.patch(`/admin/users/${id}/role`, { role }),
}
