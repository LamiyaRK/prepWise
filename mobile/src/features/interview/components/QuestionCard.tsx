import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { InterviewQuestion } from '../../../services/interview.service'
import { Colors, Fonts, Radius, Spacing } from '../../../constants/theme'

interface Props {
  question: InterviewQuestion
  isBookmarked: boolean
  onToggleBookmark: () => void
}

const difficultyColors: Record<string, string> = {
  EASY: Colors.success,
  MEDIUM: Colors.warning,
  HARD: Colors.accent,
}

export const QuestionCard = ({ question, isBookmarked, onToggleBookmark }: Props) => {
  const [expanded, setExpanded] = useState(false)
  const diffColor = difficultyColors[question.difficulty] ?? Colors.primary

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: diffColor + '22', borderColor: diffColor + '44' }]}>
            <Text style={[styles.badgeText, { color: diffColor }]}>{question.difficulty}</Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{question.category}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onToggleBookmark} style={styles.bookmarkBtn}>
          <Text style={styles.bookmarkIcon}>{isBookmarked ? '🔖' : '📌'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.question}>{question.question}</Text>

      {question.answer && (
        <TouchableOpacity
          style={styles.answerToggle}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.answerToggleText}>
            {expanded ? '▲ Hide Answer' : '▼ Show Answer'}
          </Text>
        </TouchableOpacity>
      )}

      {expanded && question.answer && (
        <View style={styles.answerBox}>
          <Text style={styles.answerText}>{question.answer}</Text>
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  badges: { flexDirection: 'row', gap: 6 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  badgeText: { fontSize: 10, fontFamily: Fonts.dmSansBold, textTransform: 'uppercase' },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  categoryText: { fontSize: 10, fontFamily: Fonts.dmSansBold, color: Colors.primary, textTransform: 'uppercase' },
  bookmarkBtn: { padding: 4 },
  bookmarkIcon: { fontSize: 18 },
  question: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontFamily: Fonts.dmSansMedium,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  answerToggle: {
    paddingVertical: 6,
  },
  answerToggleText: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: Fonts.dmSansBold,
  },
  answerBox: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary + '33',
  },
  answerText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontFamily: Fonts.dmSansRegular,
    lineHeight: 20,
  },
})