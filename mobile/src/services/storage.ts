import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

// expo-secure-store has no web implementation, so on web we fall back to
// localStorage. This is fine for local dev/testing in a browser; on native
// (iOS/Android) it still uses the OS keychain/keystore as before.
export const storage = {
  getItem: (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return Promise.resolve(window.localStorage.getItem(key))
    }
    return SecureStore.getItemAsync(key)
  },
  setItem: (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      window.localStorage.setItem(key, value)
      return Promise.resolve()
    }
    return SecureStore.setItemAsync(key, value)
  },
  deleteItem: (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      window.localStorage.removeItem(key)
      return Promise.resolve()
    }
    return SecureStore.deleteItemAsync(key)
  },
}
