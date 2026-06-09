import api from './api'

export interface Comment {
  id: string
  postId: string
  userId: string
  user: { id: string; name: string; avatar?: string }
  content: string
  createdAt: string
}

export interface CommunityPost {
  id: string
  userId: string
  user: { id: string; name: string; avatar?: string }
  company: string
  role: string
  content: string
  tags: string[]
  likes: string[]
  comments: Comment[]
  createdAt: string
}

export interface CreatePostPayload {
  company: string
  role: string
  content: string
  tags?: string[]
}

export const communityService = {
  getAll: () =>
    api.get<CommunityPost[]>('/community'),

  getById: (id: string) =>
    api.get<CommunityPost>(`/community/${id}`),

  create: (payload: CreatePostPayload) =>
    api.post<CommunityPost>('/community', payload),

  like: (id: string) =>
    api.post<{ liked: boolean; totalLikes: number }>(`/community/${id}/like`),

  comment: (id: string, content: string) =>
    api.post<Comment>(`/community/${id}/comment`, { content }),

  remove: (id: string) =>
    api.delete(`/community/${id}`),
}