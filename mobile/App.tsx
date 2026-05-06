import React, { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useAuthStore } from './src/store/authStore'
import { RootNavigator } from './src/navigation/RootNavigator'
import { Colors } from './src/constants/theme'

export default function App() {
  const { loadToken } = useAuthStore()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    loadToken().then(() => setReady(true))
  }, [])

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