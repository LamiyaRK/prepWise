import axios from 'axios'
import { storage } from './storage'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(async (config) => {
  const token = await storage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api