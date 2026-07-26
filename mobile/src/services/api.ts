import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import { getServerUrl, DEFAULT_SERVER_URL } from './serverConfig'

const api = axios.create({
  baseURL: DEFAULT_SERVER_URL, // overwritten below once the saved value loads
  headers: { 'Content-Type': 'application/json' },
})

// Load the (possibly user-set) server URL as soon as the app starts.
getServerUrl().then(url => {
  api.defaults.baseURL = url
})

/**
 * Call this after changing the server URL in Settings so requests use it
 * immediately, without needing to restart the app.
 */
export const applyServerUrl = (url: string) => {
  api.defaults.baseURL = url
}

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api