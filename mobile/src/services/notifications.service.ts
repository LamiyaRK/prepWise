import * as Notifications from 'expo-notifications'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

const DAILY_STREAK_ID = 'daily-streak-reminder'
const followUpId = (trackerId: string) => `tracker-followup-${trackerId}`

export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status: existing } = await Notifications.getPermissionsAsync()
  if (existing === 'granted') return true

  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

/**
 * Schedules (or re-schedules) a single repeating daily reminder to keep the
 * user's streak alive. Safe to call every app launch — cancels any existing
 * one with the same identifier first so it never duplicates.
 */
export const scheduleDailyStreakReminder = async (hour = 19, minute = 0) => {
  const granted = await requestNotificationPermissions()
  if (!granted) return

  await Notifications.cancelScheduledNotificationAsync(DAILY_STREAK_ID).catch(() => {})

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_STREAK_ID,
    content: {
      title: '🔥 Keep your streak alive',
      body: "You haven't practiced today — a quick mock question keeps your streak going.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  })
}

export const cancelDailyStreakReminder = () =>
  Notifications.cancelScheduledNotificationAsync(DAILY_STREAK_ID).catch(() => {})

/**
 * Schedules a one-time reminder N days after applying to a job, tied to the
 * tracker entry's id so it can be cancelled if the entry is deleted or its
 * status changes away from APPLIED.
 */
export const scheduleFollowUpReminder = async (
  trackerId: string,
  companyName: string,
  daysFromNow = 5,
) => {
  const granted = await requestNotificationPermissions()
  if (!granted) return

  const seconds = daysFromNow * 24 * 60 * 60

  await Notifications.scheduleNotificationAsync({
    identifier: followUpId(trackerId),
    content: {
      title: '📋 Time to follow up',
      body: `It's been ${daysFromNow} days since you applied to ${companyName}. A short follow-up email can help.`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      repeats: false,
    },
  })
}

export const cancelFollowUpReminder = (trackerId: string) =>
  Notifications.cancelScheduledNotificationAsync(followUpId(trackerId)).catch(() => {})