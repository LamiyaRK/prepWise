import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'prepwise:server_url'

// Fallback used only if nothing has been saved yet — update this to
// whatever your current default is, but once you set one in-app, this
// default is never used again on that device.
export const DEFAULT_SERVER_URL = 'https://prep-wise-omega-lime.vercel.app/api'

export const getServerUrl = async (): Promise<string> => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY)
    return saved || DEFAULT_SERVER_URL
  } catch {
    return DEFAULT_SERVER_URL
  }
}

export const setServerUrl = async (url: string): Promise<void> => {
  const trimmed = url.trim().replace(/\/+$/, '') // strip trailing slashes
  await AsyncStorage.setItem(STORAGE_KEY, trimmed)
}
