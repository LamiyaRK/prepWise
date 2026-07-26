import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { LoginScreen } from '../features/auth/screens/LoginScreen'
import { RegisterScreen } from '../features/auth/screens/RegisterScreen'
import { ServerSettingsScreen } from '../features/settings/screens/ServerSettingsScreen'

const Stack = createStackNavigator()

export const AuthNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ServerSettings" component={ServerSettingsScreen} />
        </Stack.Navigator>
    )
}
