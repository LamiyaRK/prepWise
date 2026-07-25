import { create } from 'zustand'
import { storage } from '../services/storage'
import api from '../services/api'
import { UserRole } from '../services/auth.service'

interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, university?: string) => Promise<void>
  logout: () => Promise<void>
  loadToken: () => Promise<void>
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,

  loadToken: async () => {
    const token = await storage.getItem('token')
    const userStr = await storage.getItem('user')
    if (token && userStr) {
      set({ token, user: JSON.parse(userStr) })
    }
  },

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const res = await api.post('/auth/login', { email, password })
      await storage.setItem('token', res.data.token)
      await storage.setItem('user', JSON.stringify(res.data.user))
      set({ token: res.data.token, user: res.data.user })
    } finally {
      set({ isLoading: false })
    }
  },

  register: async (name, email, password, university) => {
    set({ isLoading: true })
    try {
      const res = await api.post('/auth/register', { name, email, password, university })
      await storage.setItem('token', res.data.token)
      await storage.setItem('user', JSON.stringify(res.data.user))
      set({ token: res.data.token, user: res.data.user })
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    await storage.deleteItem('token')
    await storage.deleteItem('user')
    set({ user: null, token: null })
  },

  isAdmin: () => get().user?.role === 'ADMIN',
}))
