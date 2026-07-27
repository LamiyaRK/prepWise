import React from 'react'
import { View, Text, StyleSheet, SafeAreaView } from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { createStackNavigator }          from '@react-navigation/stack'

// Tab screens
import { HomeScreen }      from '../features/home/screens/HomeScreen'
import { JobsScreen }      from '../features/jobs/screens/JobsScreen'
import { TrackerScreen }   from '../features/tracker/screens/TrackerScreen'
import { InterviewScreen } from '../features/interview/screens/InterviewScreen'
import { CommunityScreen } from '../features/community/screens/CommunityScreen'

// Stack (push) screens
import { JobDetailScreen }   from '../features/jobs/screens/JobDetailScreen'
import { MockTestsScreen }   from '../features/mock-tests/screens/MockTestsScreen'
import { TakeTestScreen }    from '../features/mock-tests/screens/TakeTestScreen'
import { AIScreen }          from '../features/ai/screens/AIScreen'
import { AIInterviewScreen } from '../features/ai-interview/screens/AIInterviewScreen'
import { AdminDashboardScreen } from '../features/admin/screens/AdminDashboardScreen'
import { CompanyDetailScreen } from '../features/community/screens/CompanyDetailScreen'
import { PostDetailScreen } from '../features/community/screens/PostDetailScreen'
import { ResumeListScreen } from '../features/resume-builder/screens/ResumeListScreen'
import { ResumeBuilderScreen } from '../features/resume-builder/screens/ResumeBuilderScreen'
import { CvScreen }          from '../features/cv/screens/CvScreen'

import { Colors, Fonts } from '../constants/theme'

// ─── Navigators ───────────────────────────────────────────────────────────────

const Tab   = createMaterialTopTabNavigator()
const Stack = createStackNavigator()

// ─── Top tab navigator (your original style, kept exactly) ───────────────────

function MainTabs() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle:           styles.tabBar,
          tabBarActiveTintColor:   Colors.primary,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarLabelStyle:      styles.tabLabel,
          tabBarIndicatorStyle:  styles.indicator,
          tabBarScrollEnabled:   true,
          tabBarItemStyle:       { width: 80 },
        }}
      >
        <Tab.Screen name="Home"      component={HomeScreen}      />
        <Tab.Screen name="Jobs"      component={JobsScreen}      />
        <Tab.Screen name="Tracker"   component={TrackerScreen}   />
        <Tab.Screen name="Interview" component={InterviewScreen} />
        <Tab.Screen name="Community" component={CommunityScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  )
}

// ─── Root stack — wraps tabs + all push screens ───────────────────────────────

export const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {/* Main tabbed interface */}
    <Stack.Screen name="Main"      component={MainTabs}        />

    {/* Jobs */}
    <Stack.Screen name="JobDetail" component={JobDetailScreen} />

    {/* Mock tests */}
    <Stack.Screen name="MockTests" component={MockTestsScreen} />
    <Stack.Screen name="TakeTest"  component={TakeTestScreen}  />

    {/* AI practice — question generator / voice practice */}
    <Stack.Screen name="AI"          component={AIScreen}          />
    {/* AI practice — multi-turn mock interview with follow-ups */}
    <Stack.Screen name="AIInterview" component={AIInterviewScreen} />

    {/* CV optimizer */}
    <Stack.Screen name="CV"        component={CvScreen}        />

    {/* Admin only — hidden entry point, gated in HomeScreen by role */}
    <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />

    {/* Community — company-aggregated interview insights */}
    <Stack.Screen name="CompanyDetail" component={CompanyDetailScreen} />
    {/* Community — single post, comment thread, report action */}
    <Stack.Screen name="PostDetail" component={PostDetailScreen} />

    {/* Resume builder */}
    <Stack.Screen name="ResumeList" component={ResumeListScreen} />
    <Stack.Screen name="ResumeBuilder" component={ResumeBuilderScreen} />
  </Stack.Navigator>
)

// ─── Styles (your original tab styles, unchanged) ────────────────────────────

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
