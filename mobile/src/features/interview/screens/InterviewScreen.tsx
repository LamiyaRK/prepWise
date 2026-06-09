import React, { useState } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, ActivityIndicator, RefreshControl,
} from 'react-native'
import { QuestionCard } from '../components/QuestionCard'
import { useInterview } from '../../../hooks/useInterview'
import { Colors, Fonts, Radius, Spacing } from '../../../constants/theme'

const CATEGORIES = ['All', 'DSA', 'System Design', 'Behavioral', 'Frontend', 'Backend', 'HR']
const DIFFICULTIES = ['All', 'EASY', 'MEDIUM', 'HARD']

export const InterviewScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')
  const [showBookmarks, setShowBookmarks] = useState(false)

  const filters = {
    ...(selectedCategory !== 'All' && { category: selectedCategory }),
    ...(selectedDifficulty !== 'All' && { difficulty: selectedDifficulty as any }),
  }

  const { questions, bookmarks, loading, refetch, toggleBookmark } = useInterview(filters)

  const bookmarkedIds = new Set(bookmarks.map(q => q.id))
  const displayData = showBookmarks ? bookmarks : questions

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Interview Prep</Text>
            <Text style={styles.subtitle}>{questions.length} questions</Text>
          </View>
          <TouchableOpacity
            style={[styles.bookmarkToggle, showBookmarks && styles.bookmarkToggleActive]}
            onPress={() => setShowBookmarks(!showBookmarks)}
          >
            <Text style={styles.bookmarkToggleText}>
              {showBookmarks ? '📚 All' : '🔖 Saved'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Filter */}
        {!showBookmarks && (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIES}
            keyExtractor={i => i}
            style={styles.filterRow}
            contentContainerStyle={{ gap: 8, paddingHorizontal: Spacing.lg }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.chip, selectedCategory === item && styles.chipActive]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text style={[styles.chipText, selectedCategory === item && styles.chipTextActive]}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Difficulty Filter */}
        {!showBookmarks && (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={DIFFICULTIES}
            keyExtractor={i => i}
            style={styles.filterRow}
            contentContainerStyle={{ gap: 8, paddingHorizontal: Spacing.lg }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.chip, selectedDifficulty === item && styles.chipActive]}
                onPress={() => setSelectedDifficulty(item)}
              >
                <Text style={[styles.chipText, selectedDifficulty === item && styles.chipTextActive]}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Questions List */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={Colors.primary} size="large" />
          </View>
        ) : displayData.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyIcon}>{showBookmarks ? '🔖' : '🧠'}</Text>
            <Text style={styles.emptyTitle}>
              {showBookmarks ? 'No bookmarks yet' : 'No questions found'}
            </Text>
            <Text style={styles.emptyText}>
              {showBookmarks
                ? 'Bookmark questions to review them later'
                : 'Try changing your filters'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={displayData}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={refetch} tintColor={Colors.primary} />
            }
            renderItem={({ item }) => (
              <QuestionCard
                question={item}
                isBookmarked={bookmarkedIds.has(item.id)}
                onToggleBookmark={() => toggleBookmark(item.id)}
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: { fontSize: 24, color: Colors.textPrimary, fontFamily: Fonts.soraBold },
  subtitle: { fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular, marginTop: 2 },
  bookmarkToggle: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bookmarkToggleActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  bookmarkToggleText: { fontSize: 12, color: Colors.textPrimary, fontFamily: Fonts.dmSansBold },
  filterRow: { maxHeight: 44, marginBottom: Spacing.sm },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  chipText: { fontSize: 12, color: Colors.textSecondary, fontFamily: Fonts.dmSansMedium },
  chipTextActive: { color: Colors.primary, fontFamily: Fonts.dmSansBold },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.sm },
  emptyTitle: { fontSize: 18, color: Colors.textPrimary, fontFamily: Fonts.soraSemiBold },
  emptyText: { fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular, textAlign: 'center' },
})