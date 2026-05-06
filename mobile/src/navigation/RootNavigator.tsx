import React from 'react'
import { useAuthStore } from '../store/authStore'
import { AuthNavigator } from './AuthNavigator'
import { AppNavigator } from './AppNavigator'

export const RootNavigator = () => {
  const { token } = useAuthStore()
  return token ? <AppNavigator /> : <AuthNavigator />
}