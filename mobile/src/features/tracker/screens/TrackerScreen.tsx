import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { TrackerCard } from '../components/TrackerCard'
import { TrackerForm } from '../components/TrackerForm'
import { useTracker } from '../../../hooks/useTracker'
import { TrackerEntry } from '../../../services/tracker.service'
import { Colors, Fonts, Radius, Spacing, StatusColors } from '../../../constants/theme'

const STATUS_FILTERS = ['All', 'APPLIED', 'IN_REVIEW', 'INTERVIEW', 'OFFER', 'REJECTED']

export const TrackerScreen = () => {
  const { entries, loading, create, update, remove, refetch } = useTracker()
  const [showForm, setShowForm] = useState(false)
  const [editEntry, setEditEntry] = useState<TrackerEntry | null>(null)
  const [selectedStatus, setSelectedStatus] = useState('All')

  const filtered = selectedStatus === 'All'
    ? entries
    : entries.filter(e => e.status === selectedStatus)

  const stats = {
    total: entries.length,
    interviews: entries.filter(e => e.status === 'INTERVIEW').length,
    offers: entries.filter(e => e.status === 'OFFER').length,
    rejected: entries.filter(e => e.status === 'REJECTED').length,
  }

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this application?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => remove(id) }
      ]
    )
  }

  const handleEdit = (entry: TrackerEntry) => {
    setEditEntry(entry)
    setShowForm(true)
  }

  const handleSubmit = async (data: any) => {
    if (editEntry) {
      await update(editEntry.id, data)
    } else {
      await create(data)
    }
    setEditEntry(null)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditEntry(null)
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Job Tracker</Text>
            <Text style={styles.subtitle}>{entries.length} applications</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowForm(true)}
            style={styles.addBtn}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.addBtnGradient}
            >
              <Text style={styles.addBtnText}>+ Add</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Total', value: stats.total, color: Colors.primary },
            { label: 'Interviews', value: stats.interviews, color: Colors.secondary },
            { label: 'Offers', value: stats.offers, color: Colors.success },
            { label: 'Rejected', value: stats.rejected, color: Colors.accent },
          ].map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: stat.color }]}>
                {stat.value}
              </Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Status Filter */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_FILTERS}
          keyExtractor={(item) => item}
          style={styles.filterList}
          contentContainerStyle={{ gap: 8, paddingHorizontal: Spacing.lg }}
          renderItem={({ item }) => {
            const color = item === 'All' ? Colors.primary : StatusColors[item]
            const isSelected = selectedStatus === item
            return (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? color + '22' : Colors.surface,
                    borderColor: isSelected ? color : Colors.border,
                  }
                ]}
                onPress={() => setSelectedStatus(item)}
              >
                <Text style={[
                  styles.filterChipText,
                  { color: isSelected ? color : Colors.textSecondary }
                ]}>
                  {item.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            )
          }}
        />

        {/* List */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={Colors.primary} size="large" />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No applications yet</Text>
            <Text style={styles.emptyText}>
              Tap "+ Add" to start tracking your job applications
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => setShowForm(true)}
            >
              <Text style={styles.emptyBtnText}>Track First Job</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
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
              <TrackerCard
                entry={item}
                onPress={() => handleEdit(item)}
                onDelete={() => handleDelete(item.id)}
              />
            )}
          />
        )}
      </View>

      {/* Form Modal */}
      <TrackerForm
        visible={showForm}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        editEntry={editEntry}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
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
  addBtn: {
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  addBtnGradient: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  addBtnText: {
    color: '#fff',
    fontFamily: Fonts.soraSemiBold,
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 20,
    fontFamily: Fonts.soraBold,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontFamily: Fonts.dmSansRegular,
    marginTop: 2,
  },
  filterList: {
    maxHeight: 44,
    marginBottom: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 11,
    fontFamily: Fonts.dmSansBold,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
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
    lineHeight: 20,
  },
  emptyBtn: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  emptyBtnText: {
    color: Colors.primary,
    fontFamily: Fonts.dmSansBold,
    fontSize: 14,
  },
})