import React, { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Alert, RefreshControl,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import {
  adminService, PendingJob, ReportedPost, PlatformStats,
} from '../../../services/admin.service'
import { Colors, Fonts, Radius, Spacing } from '../../../constants/theme'

type Tab = 'jobs' | 'reports' | 'stats'

// ── Stat tile ────────────────────────────────────────────────────────────────

const StatTile = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <View style={[styles.statTile, { borderLeftColor: color }]}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
)

export const AdminDashboardScreen = ({ navigation }: any) => {
  const [tab, setTab] = useState<Tab>('jobs')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [pendingJobs, setPendingJobs] = useState<PendingJob[]>([])
  const [reportedPosts, setReportedPosts] = useState<ReportedPost[]>([])
  const [stats, setStats] = useState<PlatformStats | null>(null)

  const loadAll = useCallback(async () => {
    try {
      const [jobsRes, postsRes, statsRes] = await Promise.all([
        adminService.getPendingJobs(),
        adminService.getReportedPosts(),
        adminService.getStats(),
      ])
      setPendingJobs(jobsRes.data)
      setReportedPosts(postsRes.data)
      setStats(statsRes.data)
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to load admin data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { loadAll() }, [loadAll]))

  const onRefresh = () => { setRefreshing(true); loadAll() }

  // ── Job actions ────────────────────────────────────────────────────────

  const handleApprove = async (id: string) => {
    try {
      await adminService.approveJob(id)
      setPendingJobs(prev => prev.filter(j => j.id !== id))
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Could not approve job')
    }
  }

  const handleReject = async (id: string) => {
    Alert.alert('Reject Job', 'This job will not appear publicly. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject', style: 'destructive', onPress: async () => {
          try {
            await adminService.rejectJob(id)
            setPendingJobs(prev => prev.filter(j => j.id !== id))
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.error || 'Could not reject job')
          }
        },
      },
    ])
  }

  // ── Post moderation actions ────────────────────────────────────────────

  const handleRemovePost = (id: string) => {
    Alert.alert('Remove Post', 'This post will be hidden from the community feed. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          try {
            await adminService.removePost(id)
            setReportedPosts(prev => prev.filter(p => p.id !== id))
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.error || 'Could not remove post')
          }
        },
      },
    ])
  }

  const handleDismissReports = async (id: string) => {
    try {
      await adminService.dismissReports(id)
      setReportedPosts(prev => prev.filter(p => p.id !== id))
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Could not dismiss reports')
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Admin Dashboard</Text>
      </View>

      <View style={styles.tabRow}>
        {([
          { key: 'jobs', label: `📋 Jobs${pendingJobs.length ? ` (${pendingJobs.length})` : ''}` },
          { key: 'reports', label: `🚩 Reports${reportedPosts.length ? ` (${reportedPosts.length})` : ''}` },
          { key: 'stats', label: '📊 Stats' },
        ] as const).map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator color={Colors.primary} size="large" /></View>
      ) : tab === 'jobs' ? (
        pendingJobs.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyText}>No jobs waiting for review</Text>
          </View>
        ) : (
          <FlatList
            data={pendingJobs}
            keyExtractor={i => i.id}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSub}>{item.company} · {item.location}</Text>
                <Text style={styles.cardMeta}>Posted by {item.postedBy.name} ({item.postedBy.email})</Text>
                {!!item.description && <Text style={styles.cardDesc} numberOfLines={3}>{item.description}</Text>}
                <View style={styles.actionRow}>
                  <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={() => handleApprove(item.id)}>
                    <Text style={styles.approveText}>✓ Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleReject(item.id)}>
                    <Text style={styles.rejectText}>✕ Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )
      ) : tab === 'reports' ? (
        reportedPosts.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyText}>No reported posts</Text>
          </View>
        ) : (
          <FlatList
            data={reportedPosts}
            keyExtractor={i => i.id}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardSub}>{item.company} · {item.role} — by {item.user.name}</Text>
                <Text style={styles.cardDesc} numberOfLines={4}>{item.content}</Text>
                <Text style={styles.reportCount}>🚩 {item.reports.length} report{item.reports.length !== 1 ? 's' : ''}</Text>
                {item.reports.slice(0, 2).map(r => (
                  <Text key={r.id} style={styles.reportReason}>• {r.user.name}{r.reason ? `: ${r.reason}` : ''}</Text>
                ))}
                <View style={styles.actionRow}>
                  <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={() => handleDismissReports(item.id)}>
                    <Text style={styles.approveText}>Dismiss</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleRemovePost(item.id)}>
                    <Text style={styles.rejectText}>Remove Post</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )
      ) : (
        stats && (
          <View style={styles.statsGrid}>
            <StatTile label="Total Users" value={stats.users.total} color={Colors.primary} />
            <StatTile label="Admins" value={stats.users.admins} color={Colors.secondary} />
            <StatTile label="Pending Jobs" value={stats.jobs.pending} color={Colors.warning} />
            <StatTile label="Verified Jobs" value={stats.jobs.verified} color={Colors.success} />
            <StatTile label="Community Posts" value={stats.community.posts} color={Colors.accent} />
            <StatTile label="Reported Posts" value={stats.community.reportedPosts} color={Colors.accent} />
            <StatTile label="Tracker Entries" value={stats.engagement.trackerEntries} color={Colors.primary} />
            <StatTile label="Tests Completed" value={stats.engagement.testsCompleted} color={Colors.secondary} />
            <StatTile label="AI Interviews" value={stats.engagement.aiInterviews} color={Colors.success} />
          </View>
        )
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  backText: { color: Colors.primary, fontFamily: Fonts.dmSansBold, fontSize: 14 },
  title: { fontSize: 22, color: Colors.textPrimary, fontFamily: Fonts.soraBold, marginTop: Spacing.sm },
  tabRow: { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  tab: { flex: 1, paddingVertical: 10, borderRadius: Radius.md, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  tabText: { fontSize: 11, color: Colors.textSecondary, fontFamily: Fonts.dmSansBold },
  tabTextActive: { color: Colors.primary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 14, color: Colors.textSecondary, fontFamily: Fonts.dmSansMedium },
  list: { padding: Spacing.lg, paddingTop: 0, gap: Spacing.md },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, marginBottom: Spacing.md },
  cardTitle: { fontSize: 15, color: Colors.textPrimary, fontFamily: Fonts.soraSemiBold },
  cardSub: { fontSize: 12, color: Colors.textSecondary, fontFamily: Fonts.dmSansMedium, marginTop: 2 },
  cardMeta: { fontSize: 11, color: Colors.textMuted, fontFamily: Fonts.dmSansRegular, marginTop: 4 },
  cardDesc: { fontSize: 12, color: Colors.textPrimary, fontFamily: Fonts.dmSansRegular, marginTop: 8, lineHeight: 18 },
  reportCount: { fontSize: 12, color: Colors.accent, fontFamily: Fonts.dmSansBold, marginTop: 8 },
  reportReason: { fontSize: 11, color: Colors.textMuted, fontFamily: Fonts.dmSansRegular, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: Radius.md, alignItems: 'center', borderWidth: 1 },
  approveBtn: { backgroundColor: Colors.successLight, borderColor: Colors.success },
  approveText: { color: Colors.success, fontFamily: Fonts.dmSansBold, fontSize: 13 },
  rejectBtn: { backgroundColor: Colors.accentLight, borderColor: Colors.accent },
  rejectText: { color: Colors.accent, fontFamily: Fonts.dmSansBold, fontSize: 13 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, padding: Spacing.lg },
  statTile: { width: '47%', backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, borderLeftWidth: 3, padding: Spacing.md },
  statValue: { fontSize: 26, fontFamily: Fonts.soraBold },
  statLabel: { fontSize: 11, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular, marginTop: 4 },
})
