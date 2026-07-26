import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { JobCard } from '../components/JobCard'
import { useJobs } from '../../../hooks/useJobs'
import { Colors, Fonts, Radius, Spacing } from '../../../constants/theme'

// ─── Filter data ──────────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Engineering', 'Design', 'Marketing', 'Finance', 'HR']

const JOB_TYPES = [
  { key: 'All',       label: 'All'        },
  { key: 'FULL_TIME', label: 'Full Time'  },
  { key: 'PART_TIME', label: 'Part Time'  },
  { key: 'INTERNSHIP',label: 'Internship' },
  { key: 'REMOTE',    label: 'Remote'     },
]

// ─── Screen ───────────────────────────────────────────────────────────────────

export const JobsScreen = ({ navigation }: any) => {
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('All')
  const [type,     setType]     = useState('All')

  const filters = {
    ...(category !== 'All' && { category }),
    ...(type     !== 'All' && { type }),
  }

  const { jobs, loading, refetch } = useJobs(filters)

  const filtered = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.company.toLowerCase().includes(search.toLowerCase())
  )

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Job Board</Text>
          <Text style={styles.subtitle}>{filtered.length} opportunities</Text>
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs or companies…"
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Category chips */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={i => i}
          style={styles.chipRow}
          contentContainerStyle={{ gap: 8, paddingHorizontal: Spacing.lg }}
          renderItem={({ item }) => {
            const active = category === item
            return (
              <TouchableOpacity
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setCategory(item)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )
          }}
        />

        {/* Type chips */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={JOB_TYPES}
          keyExtractor={i => i.key}
          style={styles.chipRow}
          contentContainerStyle={{ gap: 8, paddingHorizontal: Spacing.lg }}
          renderItem={({ item }) => {
            const active = type === item.key
            return (
              <TouchableOpacity
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setType(item.key)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )
          }}
        />

        {/* Content */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={Colors.primary} size="large" />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyIcon}>💼</Text>
            <Text style={styles.emptyTitle}>No jobs found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your filters or check back later
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={refetch}
                tintColor={Colors.primary}
              />
            }
            renderItem={({ item }) => (
              <JobCard
                job={item}
                onPress={() => navigation.navigate('JobDetail', { job: item })}
              />
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

  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: 24,
    color: Colors.textPrimary,
    fontFamily: Fonts.soraBold,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: Fonts.dmSansRegular,
    marginTop: 2,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    height: 48,
    gap: Spacing.sm,
  },
  searchIcon:  { fontSize: 16 },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontFamily: Fonts.dmSansRegular,
    fontSize: 14,
  },
  clearBtn: { color: Colors.textMuted, fontSize: 14, padding: 4 },

  // Chips
  chipRow: { minHeight:44,maxHeight: 44, marginBottom: Spacing.sm },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Fonts.dmSansMedium,
  },
  chipTextActive: {
    color: Colors.primary,
    fontFamily: Fonts.dmSansBold,
  },

  // List
  list: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },

  // Empty / loading
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon:  { fontSize: 48, marginBottom: Spacing.sm },
  emptyTitle: {
    fontSize: 18,
    color: Colors.textPrimary,
    fontFamily: Fonts.soraSemiBold,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: Fonts.dmSansRegular,
    textAlign: 'center',
  },
})
