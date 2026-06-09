import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Alert,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Job } from '../../../services/jobs.service'
import { Colors, Fonts, Radius, Spacing } from '../../../constants/theme'

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  FULL_TIME:   Colors.success,
  PART_TIME:   Colors.warning,
  INTERNSHIP:  Colors.primary,
  REMOTE:      Colors.secondary,
}
const TYPE_LABELS: Record<string, string> = {
  FULL_TIME:   'Full Time',
  PART_TIME:   'Part Time',
  INTERNSHIP:  'Internship',
  REMOTE:      'Remote',
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export const JobDetailScreen = ({ route, navigation }: any) => {
  const job: Job = route.params.job
  const color = TYPE_COLORS[job.type] ?? Colors.primary

  const handleApply = () => {
    if (job.link) {
      Linking.openURL(job.link).catch(() =>
        Alert.alert('Error', 'Could not open the job link')
      )
    } else {
      Alert.alert('No Link', 'This job does not have an application link.')
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Company avatar + name */}
        <View style={styles.hero}>
          <LinearGradient colors={[color + '44', color + '11']} style={styles.heroAvatar}>
            <Text style={styles.heroInitial}>{job.company.charAt(0).toUpperCase()}</Text>
          </LinearGradient>
          <Text style={styles.company}>{job.company}</Text>
          <Text style={styles.title}>{job.title}</Text>

          {/* Type badge */}
          <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color + '55' }]}>
            <Text style={[styles.badgeText, { color }]}>{TYPE_LABELS[job.type]}</Text>
          </View>
        </View>

        {/* Details card */}
        <View style={styles.detailsCard}>
          {[
            { icon: '📍', label: 'Location',  value: job.location },
            { icon: '🏷️', label: 'Category',  value: job.category },
            { icon: '👤', label: 'Posted by', value: job.postedBy?.name ?? 'Anonymous' },
            { icon: '📅', label: 'Date',       value: new Date(job.createdAt).toLocaleDateString() },
          ].map(row => (
            <View key={row.label} style={styles.detailRow}>
              <Text style={styles.detailIcon}>{row.icon}</Text>
              <Text style={styles.detailLabel}>{row.label}</Text>
              <Text style={styles.detailValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* Description */}
        {job.description ? (
          <>
            <Text style={styles.sectionTitle}>About the Role</Text>
            <View style={styles.descCard}>
              <Text style={styles.descText}>{job.description}</Text>
            </View>
          </>
        ) : null}

        {/* Apply button */}
        <TouchableOpacity onPress={handleApply} activeOpacity={0.85} style={styles.applyWrap}>
          <LinearGradient
            colors={['#6C63FF', '#00D4FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.applyBtn}
          >
            <Text style={styles.applyText}>Apply Now →</Text>
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  backBtn: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  backText: {
    color: Colors.primary,
    fontFamily: Fonts.dmSansBold,
    fontSize: 14,
  },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },

  // Hero
  hero: { alignItems: 'center', marginBottom: Spacing.lg },
  heroAvatar: {
    width: 72,
    height: 72,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroInitial: { fontSize: 32, fontFamily: Fonts.soraBold, color: Colors.textPrimary },
  company:     { fontSize: 14, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular, marginBottom: 4 },
  title:       { fontSize: 22, color: Colors.textPrimary, fontFamily: Fonts.soraBold, textAlign: 'center', marginBottom: 12 },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  badgeText: { fontSize: 11, fontFamily: Fonts.dmSansBold, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Details card
  detailsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: 12,
  },
  detailRow:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailIcon:  { fontSize: 16, width: 24 },
  detailLabel: { fontSize: 13, color: Colors.textMuted, fontFamily: Fonts.dmSansRegular, width: 72 },
  detailValue: { fontSize: 13, color: Colors.textPrimary, fontFamily: Fonts.dmSansMedium, flex: 1 },

  // Description
  sectionTitle: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: Fonts.soraSemiBold,
    marginBottom: Spacing.sm,
  },
  descCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  descText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontFamily: Fonts.dmSansRegular,
    lineHeight: 22,
  },

  // Apply
  applyWrap: { borderRadius: Radius.md, overflow: 'hidden' },
  applyBtn: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
  },
  applyText: { color: '#fff', fontFamily: Fonts.soraSemiBold, fontSize: 16 },
})
