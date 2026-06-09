import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { TrackerEntry } from '../../../services/tracker.service'
import { Colors, Fonts, Radius, Spacing, StatusColors, StageLabels } from '../../../constants/theme'

interface Props {
  entry: TrackerEntry
  onPress: () => void
  onDelete: () => void
}

export const TrackerCard = ({ entry, onPress, onDelete }: Props) => {
  const statusColor = StatusColors[entry.status] ?? Colors.primary

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={styles.card}>
        {/* Top Row */}
        <View style={styles.top}>
          <View style={styles.companyAvatar}>
            <Text style={styles.companyInitial}>
              {entry.companyName.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.info}>
            <Text style={styles.company}>{entry.companyName}</Text>
            {entry.jobTitle && (
              <Text style={styles.role}>{entry.jobTitle}</Text>
            )}
          </View>

          {/* Status Badge */}
          <View style={[styles.badge, {
            backgroundColor: statusColor + '22',
            borderColor: statusColor + '44'
          }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {entry.status.replace('_', ' ')}
            </Text>
          </View>
        </View>

        {/* Stage */}
        {entry.stage && (
          <View style={styles.stageRow}>
            <Text style={styles.stageIcon}>📍</Text>
            <Text style={styles.stageText}>
              {StageLabels[entry.stage]}
            </Text>
          </View>
        )}

        {/* Notes */}
        {entry.notes && (
          <Text style={styles.notes} numberOfLines={2}>
            {entry.notes}
          </Text>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.date}>
            Applied {new Date(entry.appliedAt).toLocaleDateString()}
          </Text>
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
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
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  companyAvatar: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyInitial: {
    fontSize: 18,
    fontFamily: Fonts.soraBold,
    color: Colors.primary,
  },
  info: {
    flex: 1,
  },
  company: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontFamily: Fonts.soraSemiBold,
  },
  role: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Fonts.dmSansRegular,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: Fonts.dmSansBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  stageIcon: {
    fontSize: 12,
  },
  stageText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Fonts.dmSansMedium,
  },
  notes: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: Fonts.dmSansRegular,
    lineHeight: 18,
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
  date: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: Fonts.dmSansRegular,
  },
  deleteBtn: {
    padding: 4,
  },
  deleteText: {
    fontSize: 16,
  },
})