import React, { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, Alert,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import {
  SavedQuestion,
  getSavedQuestions,
  unsaveQuestion,
  clearAllSaved,
} from '../../../services/savedQuestions.service'
import { Colors, Fonts, Radius, Spacing } from '../../../constants/theme'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const diffColor = (d: string) =>
  d === 'Easy' ? Colors.success : d === 'Medium' ? Colors.warning : Colors.accent

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })

// ─── Single saved question card ───────────────────────────────────────────────

interface CardProps {
  item:     SavedQuestion
  onRemove: (question: string) => void
}

const SavedCard = ({ item, onRemove }: CardProps) => {
  const [expanded, setExpanded] = useState(false)
  const color = diffColor(item.difficulty)

  return (
    <View style={styles.card}>

      {/* Top row */}
      <View style={styles.cardTop}>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color + '55' }]}>
            <Text style={[styles.badgeText, { color }]}>{item.difficulty}</Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>

        {/* Unstar button */}
        <TouchableOpacity onPress={() => onRemove(item.question)} style={styles.starBtn}>
          <Text style={styles.starIcon}>⭐</Text>
        </TouchableOpacity>
      </View>

      {/* Role tag */}
      <Text style={styles.roleTag}>{item.role}</Text>

      {/* Question */}
      <Text style={styles.questionText}>{item.question}</Text>

      {/* Hint toggle */}
      <TouchableOpacity onPress={() => setExpanded(e => !e)} style={styles.hintToggle}>
        <Text style={styles.hintToggleText}>
          {expanded ? '▲ Hide Hint' : '▼ Show Hint'}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.hintBox}>
          <Text style={styles.hintIcon}>💡</Text>
          <Text style={styles.hintText}>{item.hint}</Text>
        </View>
      )}

      {/* Saved date */}
      <Text style={styles.savedDate}>Saved {formatDate(item.savedAt)}</Text>
    </View>
  )
}

// ─── Filters ─────────────────────────────────────────────────────────────────

const DIFF_FILTERS = ['All', 'Easy', 'Medium', 'Hard']

// ─── Screen ───────────────────────────────────────────────────────────────────

export const SavedQuestionsScreen = ({ navigation }: any) => {
  const [questions, setQuestions] = useState<SavedQuestion[]>([])
  const [filter,    setFilter]    = useState('All')

  // Reload every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      getSavedQuestions().then(setQuestions)
    }, [])
  )

  const handleRemove = async (question: string) => {
    Alert.alert(
      'Remove Question',
      'Remove this question from your saved list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updated = await unsaveQuestion(question)
            setQuestions(updated)
          },
        },
      ]
    )
  }

  const handleClearAll = () => {
    Alert.alert(
      'Clear All',
      'Remove all saved questions? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearAllSaved()
            setQuestions([])
          },
        },
      ]
    )
  }

  const filtered = filter === 'All'
    ? questions
    : questions.filter(q => q.difficulty === filter)

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <Text style={styles.title}>Saved Questions</Text>
            <Text style={styles.subtitle}>{questions.length} saved</Text>
          </View>
          {questions.length > 0 && (
            <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Difficulty filter */}
        {questions.length > 0 && (
          <View style={styles.filterRow}>
            {DIFF_FILTERS.map(f => {
              const active = filter === f
              const color  = f === 'All' ? Colors.primary : diffColor(f)
              return (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterChip, active && { backgroundColor: color + '22', borderColor: color }]}
                  onPress={() => setFilter(f)}
                >
                  <Text style={[styles.filterText, active && { color }]}>{f}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        {/* Empty state */}
        {questions.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>⭐</Text>
            <Text style={styles.emptyTitle}>No saved questions yet</Text>
            <Text style={styles.emptyText}>
              Star questions in the AI Generator to save them here for quick review.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.emptyBtnText}>Go Generate Questions</Text>
            </TouchableOpacity>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No {filter} questions saved</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <SavedCard item={item} onRemove={handleRemove} />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  backBtn:     {},
  backText:    { color: Colors.primary, fontFamily: Fonts.dmSansBold, fontSize: 14 },
  headerRight: { flex: 1 },
  title:       { fontSize: 20, color: Colors.textPrimary, fontFamily: Fonts.soraBold },
  subtitle:    { fontSize: 12, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular },
  clearBtn:    { paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.accent + '66' },
  clearText:   { fontSize: 12, color: Colors.accent, fontFamily: Fonts.dmSansBold },

  // Filter
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
  },
  filterText: {
    fontSize: 12, color: Colors.textSecondary, fontFamily: Fonts.dmSansMedium,
  },

  // List
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },

  // Card
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, marginBottom: Spacing.md,
  },
  cardTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 6,
  },
  badges:       { flexDirection: 'row', gap: 6 },
  badge:        { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1 },
  badgeText:    { fontSize: 10, fontFamily: Fonts.dmSansBold, textTransform: 'uppercase' },
  categoryBadge:{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, backgroundColor: Colors.primaryLight, borderWidth: 1, borderColor: Colors.primary + '44' },
  categoryText: { fontSize: 10, color: Colors.primary, fontFamily: Fonts.dmSansBold, textTransform: 'uppercase' },
  starBtn:      { padding: 4 },
  starIcon:     { fontSize: 20 },
  roleTag:      { fontSize: 11, color: Colors.textMuted, fontFamily: Fonts.dmSansRegular, marginBottom: 8 },
  questionText: { fontSize: 14, color: Colors.textPrimary, fontFamily: Fonts.dmSansMedium, lineHeight: 22, marginBottom: Spacing.sm },
  hintToggle:   { paddingVertical: 4 },
  hintToggleText:{ fontSize: 12, color: Colors.primary, fontFamily: Fonts.dmSansBold },
  hintBox:      { flexDirection: 'row', gap: 6, backgroundColor: Colors.primaryLight, borderRadius: Radius.md, padding: Spacing.sm, marginTop: 6, borderWidth: 1, borderColor: Colors.primary + '33' },
  hintIcon:     { fontSize: 12, marginTop: 2 },
  hintText:     { flex: 1, fontSize: 12, color: Colors.textPrimary, fontFamily: Fonts.dmSansRegular, lineHeight: 18 },
  savedDate:    { fontSize: 11, color: Colors.textMuted, fontFamily: Fonts.dmSansRegular, marginTop: Spacing.sm },

  // Empty
  empty:        { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.xl },
  emptyIcon:    { fontSize: 48, marginBottom: Spacing.sm },
  emptyTitle:   { fontSize: 18, color: Colors.textPrimary, fontFamily: Fonts.soraSemiBold },
  emptyText:    { fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular, textAlign: 'center', lineHeight: 20 },
  emptyBtn:     { marginTop: Spacing.md, backgroundColor: Colors.primaryLight, paddingHorizontal: Spacing.lg, paddingVertical: 12, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.primary },
  emptyBtnText: { color: Colors.primary, fontFamily: Fonts.dmSansBold, fontSize: 14 },
})
