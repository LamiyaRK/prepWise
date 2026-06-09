import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native'
import { Job } from '../../../services/jobs.service'
import { Colors, Fonts, Radius, Spacing } from '../../../constants/theme'

interface Props {
  job: Job
  onPress: () => void;
}

const typeColors: Record<string, string> = {
  FULL_TIME: Colors.success,
  PART_TIME: Colors.warning,
  INTERNSHIP: Colors.primary,
  REMOTE: Colors.secondary,
}

export const JobCard = ({ job }: Props) => {
  const color = typeColors[job.type] ?? Colors.primary

  const handleApply = () => {
    if (!job.link) {
      Alert.alert('No Link', 'This job has no application link.')
      return
    }
    Linking.openURL(job.link)
  }

  return (
    <View style={styles.card}>
      {/* Top Row */}
      <View style={styles.topRow}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>
            {job.company.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.jobTitle} numberOfLines={1}>
            {job.title}
          </Text>
          <Text style={styles.company}>{job.company}</Text>
        </View>
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: color + '22', borderColor: color + '55' },
          ]}
        >
          <Text style={[styles.typeText, { color }]}>
            {job.type.replace('_', ' ')}
          </Text>
        </View>
      </View>

      {/* Meta */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>📍</Text>
          <Text style={styles.metaText}>{job.location}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>🏷️</Text>
          <Text style={styles.metaText}>{job.category}</Text>
        </View>
      </View>

      {/* Description */}
      {job.description && (
        <Text style={styles.description} numberOfLines={2}>
          {job.description}
        </Text>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.postedBy}>
          Posted by {job.postedBy.name}
        </Text>
        <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
          <Text style={styles.applyText}>Apply →</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary + '33',
  },
  logoText: {
    fontSize: 20,
    fontFamily: Fonts.soraBold,
    color: Colors.primary,
  },
  titleBlock: { flex: 1 },
  jobTitle: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontFamily: Fonts.soraSemiBold,
  },
  company: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Fonts.dmSansRegular,
    marginTop: 2,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 10,
    fontFamily: Fonts.dmSansBold,
    textTransform: 'uppercase',
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaIcon: { fontSize: 12 },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Fonts.dmSansRegular,
  },
  description: {
    fontSize: 13,
    color: Colors.textMuted,
    fontFamily: Fonts.dmSansRegular,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  postedBy: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: Fonts.dmSansRegular,
  },
  applyBtn: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  applyText: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: Fonts.dmSansBold,
  },
})