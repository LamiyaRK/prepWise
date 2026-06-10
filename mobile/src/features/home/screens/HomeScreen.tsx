import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuthStore } from '../../../store/authStore'
import { Colors, Fonts, Spacing, Radius } from '../../../constants/theme'

// ─── Sub-components ──────────────────────────────────────────────────────────

interface QuickActionProps {
  icon: string
  label: string
  color: string
  onPress: () => void
}

const QuickAction = ({ icon, label, color, onPress }: QuickActionProps) => (
  <TouchableOpacity style={styles.qaCard} onPress={onPress} activeOpacity={0.75}>
    <LinearGradient colors={[color + '33', color + '11']} style={styles.qaIcon}>
      <Text style={styles.qaEmoji}>{icon}</Text>
    </LinearGradient>
    <Text style={styles.qaLabel}>{label}</Text>
  </TouchableOpacity>
)

interface StatCardProps {
  label: string
  value: string
  color: string
}

const StatCard = ({ label, value, color }: StatCardProps) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
)

// ─── Screen ──────────────────────────────────────────────────────────────────

export const HomeScreen = ({ navigation }: any) => {
  const { user, logout } = useAuthStore()

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good Morning'
    if (h < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

 const quickActions: QuickActionProps[] = [
    { icon: '💼', label: 'Browse Jobs',  color: Colors.primary,   onPress: () => navigation.navigate('Jobs')      },
    { icon: '📊', label: 'Tracker',      color: Colors.secondary, onPress: () => navigation.navigate('Tracker')   },
    { icon: '🧠', label: 'Interview',    color: Colors.success,   onPress: () => navigation.navigate('Interview') },
    { icon: '📝', label: 'Mock Test',    color: Colors.warning,   onPress: () => navigation.navigate('MockTests') },
    { icon: '👥', label: 'Community',    color: Colors.accent,    onPress: () => navigation.navigate('Community') },
    { icon: '🎙️', label: 'AI Practice',  color: Colors.secondary, onPress: () => navigation.navigate('AI')        },
    { icon: '📄', label: 'CV Helper',    color: Colors.primary,   onPress: () => navigation.navigate('CV')        },
  ]

  const stats: StatCardProps[] = [
    { label: 'Applied',    value: '0', color: Colors.primary   },
    { label: 'Interviews', value: '0', color: Colors.success   },
    { label: 'Offers',     value: '0', color: Colors.warning   },
  ]

  const tips = [
    'Customize your CV for each job — tailored resumes get 3× more callbacks.',
    'Follow up within 5 days of applying. It shows initiative.',
    'Research the company before every interview. It always shows.',
  ]
  const tip = tips[new Date().getDay() % tips.length]

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()} 👋</Text>
            <Text style={styles.userName}>{user?.name ?? 'Job Seeker'}</Text>
          </View>
          <TouchableOpacity onPress={logout} activeOpacity={0.8}>
            <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user?.name ?? 'U').charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ── Hero Banner ── */}
        <LinearGradient
          colors={['#6C63FF', '#00D4FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <View style={styles.bannerBody}>
            <Text style={styles.bannerTitle}>Ready to land your dream job?</Text>
            <Text style={styles.bannerSub}>
              Track applications, prep for interviews, and connect with peers.
            </Text>
            <TouchableOpacity
              style={styles.bannerBtn}
              onPress={() => navigation.navigate('Jobs')}
            >
              <Text style={styles.bannerBtnText}>Browse Jobs →</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.bannerEmoji}>🚀</Text>
        </LinearGradient>

        {/* ── Stats ── */}
        <Text style={styles.sectionTitle}>Your Progress</Text>
        <View style={styles.statsRow}>
          {stats.map(s => <StatCard key={s.label} {...s} />)}
        </View>

        {/* ── Quick Actions ── */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.qaGrid}>
          {quickActions.map(a => <QuickAction key={a.label} {...a} />)}
        </View>

        {/* ── Daily Tip ── */}
        <Text style={styles.sectionTitle}>💡 Daily Tip</Text>
        <LinearGradient
          colors={[Colors.primary + '22', Colors.secondary + '11']}
          style={styles.tipCard}
        >
          <Text style={styles.tipText}>{tip}</Text>
          <Text style={styles.tipAuthor}>— PrepWise Career Tips</Text>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: Fonts.dmSansRegular,
  },
  userName: {
    fontSize: 22,
    color: Colors.textPrimary,
    fontFamily: Fonts.soraBold,
    marginTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontFamily: Fonts.soraBold, fontSize: 18 },

  // Banner
  banner: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerBody: { flex: 1, paddingRight: Spacing.md },
  bannerTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: Fonts.soraBold,
    marginBottom: 6,
  },
  bannerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.82)',
    fontFamily: Fonts.dmSansRegular,
    lineHeight: 18,
    marginBottom: 12,
  },
  bannerBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  bannerBtnText: { color: '#fff', fontFamily: Fonts.dmSansBold, fontSize: 12 },
  bannerEmoji: { fontSize: 48 },

  // Section title
  sectionTitle: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: Fonts.soraSemiBold,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: { fontSize: 24, fontFamily: Fonts.soraBold, marginBottom: 4 },
  statLabel: { fontSize: 11, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular },

  // Quick Actions
  qaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  qaCard: {
    width: '30%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  qaIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qaEmoji: { fontSize: 22 },
  qaLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: Fonts.dmSansMedium,
    textAlign: 'center',
  },

  // Tip
  tipCard: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  tipText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontFamily: Fonts.dmSansRegular,
    lineHeight: 22,
    marginBottom: 8,
  },
  tipAuthor: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Fonts.dmSansMedium,
  },
})
