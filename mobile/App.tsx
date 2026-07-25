import React, { useEffect, useState } from 'react'
import { View, ActivityIndicator, Platform } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useAuthStore } from './src/store/authStore'
import { RootNavigator } from './src/navigation/RootNavigator'
import { Colors } from './src/constants/theme'
import { scheduleDailyStreakReminder } from './src/services/notifications.service'

// react-native-web quirk: browsers give every flex child a default
// `min-height: auto`, meaning it refuses to shrink below its content size.
// Every screen in this app nests flex:1 containers (SafeAreaView > ScrollView),
// which works fine on native (Yoga doesn't have this default) but on web it
// means each screen just grows to fit ALL its content instead of being capped
// to the viewport — so nothing ever becomes scrollable. This resets that
// default globally, web-only; it's a no-op on iOS/Android.
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    html, body, #root { height: 100%; }
    * { min-height: 0; }
  `
  document.head.appendChild(style)
}

export default function App() {
  const { loadToken, token } = useAuthStore()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    loadToken().then(() => setReady(true))
  }, [])

  useEffect(() => {
    // Only schedule once we know the user is actually logged in — no point
    // nudging someone who hasn't created an account yet.
    if (ready && token) {
      scheduleDailyStreakReminder().catch(() => {})
    }
  }, [ready, token])

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  )
}
