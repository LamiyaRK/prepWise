import React from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { View, Text, StyleSheet, SafeAreaView } from 'react-native'
import { Colors, Fonts } from '../constants/theme'
import { TrackerScreen } from '../features/tracker/screens/TrackerScreen'
import { InterviewScreen } from '../features/interview/screens/InterviewScreen'
import { CommunityScreen } from '../features/community/screens/CommunityScreen'
import { JobsScreen } from '../features/jobs/screens/JobsScreen'
import { HomeScreen } from '../features/home/screens/HomeScreen'

const Placeholder = (label: string) => () => (
  <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color: Colors.textPrimary, fontSize: 18 }}>{label}</Text>
  </View>
)

const Tab = createMaterialTopTabNavigator()

export const AppNavigator = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIndicatorStyle: styles.indicator,
          tabBarScrollEnabled: true,
          tabBarItemStyle: { width: 80 },
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Jobs" component={JobsScreen} />
       <Tab.Screen name="Tracker" component={TrackerScreen} />
        <Tab.Screen name="Interview" component={InterviewScreen} />
        <Tab.Screen name="Community" component={CommunityScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 12,
    textTransform: 'capitalize',
    letterSpacing: 0.3,
  },
  indicator: {
    backgroundColor: Colors.primary,
    height: 2,
    borderRadius: 2,
  },
})