import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Alert, Modal, ScrollView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { mockTestsService, MockTest, TestResult } from '../../../services/mockTests.service'
import { Colors, Fonts, Radius, Spacing } from '../../../constants/theme'

export const MockTestsScreen = ({ navigation }: any) => {
  const [tests, setTests] = useState<MockTest[]>([])
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [testsRes, resultsRes] = await Promise.all([
        mockTestsService.getAll(),
        mockTestsService.getMyResults(),
      ])
      setTests(testsRes.data)
      setResults(resultsRes.data)
    } catch (err) {
      // silently fail, show empty state
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return Colors.success
    if (pct >= 50) return Colors.warning
    return Colors.accent
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Mock Tests</Text>
            <Text style={styles.subtitle}>{tests.length} available tests</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggleBtn, showResults && styles.toggleBtnActive]}
            onPress={() => setShowResults(!showResults)}
          >
            <Text style={styles.toggleBtnText}>{showResults ? '📋 Tests' : '📊 My Results'}</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={Colors.primary} size="large" />
          </View>
        ) : showResults ? (
          // Results View
          results.length === 0 ? (
            <View style={styles.centered}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyTitle}>No results yet</Text>
              <Text style={styles.emptyText}>Complete a test to see your results here</Text>
            </View>
          ) : (
            <FlatList
              data={results}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const scoreColor = getScoreColor(item.percentage)
                return (
                  <View style={styles.resultCard}>
                    <View style={styles.resultLeft}>
                      <Text style={styles.resultTestName}>{item.test.title}</Text>
                      <Text style={styles.resultCategory}>{item.test.category}</Text>
                      <Text style={styles.resultDate}>
                        {new Date(item.completedAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={[styles.scoreBadge, { backgroundColor: scoreColor + '22', borderColor: scoreColor + '44' }]}>
                      <Text style={[styles.scoreText, { color: scoreColor }]}>{item.percentage}%</Text>
                      <Text style={[styles.scoreDetail, { color: scoreColor }]}>{item.score}/{item.total}</Text>
                    </View>
                  </View>
                )
              }}
            />
          )
        ) : (
          // Tests View
          tests.length === 0 ? (
            <View style={styles.centered}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyTitle}>No tests available</Text>
              <Text style={styles.emptyText}>Tests will appear here once added</Text>
            </View>
          ) : (
            <FlatList
              data={tests}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => navigation.navigate('TakeTest', { test: item })}
                  activeOpacity={0.8}
                >
                  <View style={styles.testCard}>
                    <LinearGradient
                      colors={[Colors.primary + '22', Colors.secondary + '11']}
                      style={styles.testIconBox}
                    >
                      <Text style={styles.testIcon}>📝</Text>
                    </LinearGradient>
                    <View style={styles.testInfo}>
                      <Text style={styles.testTitle}>{item.title}</Text>
                      <Text style={styles.testMeta}>
                        {item.questions.length} questions · {item.duration} min
                      </Text>
                      <View style={styles.categoryChip}>
                        <Text style={styles.categoryChipText}>{item.category}</Text>
                      </View>
                    </View>
                    <Text style={styles.arrow}>›</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md,
  },
  title: { fontSize: 24, color: Colors.textPrimary, fontFamily: Fonts.soraBold },
  subtitle: { fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular, marginTop: 2 },
  toggleBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: Radius.full, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
  },
  toggleBtnActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  toggleBtnText: { fontSize: 12, color: Colors.textPrimary, fontFamily: Fonts.dmSansBold },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.sm },
  emptyTitle: { fontSize: 18, color: Colors.textPrimary, fontFamily: Fonts.soraSemiBold },
  emptyText: { fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular, textAlign: 'center' },
  testCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1,
    borderColor: Colors.border, padding: Spacing.md, marginBottom: Spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
  },
  testIconBox: { width: 50, height: 50, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  testIcon: { fontSize: 24 },
  testInfo: { flex: 1 },
  testTitle: { fontSize: 15, color: Colors.textPrimary, fontFamily: Fonts.soraSemiBold, marginBottom: 4 },
  testMeta: { fontSize: 12, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular, marginBottom: 6 },
  categoryChip: {
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: Radius.full, backgroundColor: Colors.primaryLight,
    borderWidth: 1, borderColor: Colors.primary + '44',
  },
  categoryChipText: { fontSize: 10, color: Colors.primary, fontFamily: Fonts.dmSansBold, textTransform: 'uppercase' },
  arrow: { fontSize: 22, color: Colors.textMuted },
  resultCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1,
    borderColor: Colors.border, padding: Spacing.md, marginBottom: Spacing.md,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  resultLeft: { flex: 1 },
  resultTestName: { fontSize: 14, color: Colors.textPrimary, fontFamily: Fonts.soraSemiBold, marginBottom: 3 },
  resultCategory: { fontSize: 12, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular, marginBottom: 3 },
  resultDate: { fontSize: 11, color: Colors.textMuted, fontFamily: Fonts.dmSansRegular },
  scoreBadge: {
    width: 64, height: 64, borderRadius: Radius.md, alignItems: 'center',
    justifyContent: 'center', borderWidth: 1,
  },
  scoreText: { fontSize: 18, fontFamily: Fonts.soraBold },
  scoreDetail: { fontSize: 10, fontFamily: Fonts.dmSansMedium },
})