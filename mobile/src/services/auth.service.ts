import api from './api'

export type UserRole = 'USER' | 'ADMIN'

export interface RegisterPayload {
  name: string
  email: string
  password: string
  university?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    name: string
    email: string
    role: UserRole
  }
}

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', payload),

  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', payload),
}
