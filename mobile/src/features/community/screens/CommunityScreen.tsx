import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, ActivityIndicator, RefreshControl, Modal,
  ScrollView, Alert, TextInput,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { PostCard } from '../components/PostCard'
import { useCommunity } from '../../../hooks/useCommunity'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { Colors, Fonts, Radius, Spacing } from '../../../constants/theme'
import { companyInsightsService, CompanyListItem } from '../../../services/companyInsights.service'

const TAGS = ['DSA', 'System Design', 'Behavioral', 'Offer', 'Rejection', 'Internship', 'Negotiation']

export const CommunityScreen = ({ navigation }: any) => {
  const { posts, loading, refetch, create, like, remove } = useCommunity()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ company: '', role: '', content: '', tags: [] as string[] })
  const [submitting, setSubmitting] = useState(false)

  // ── Feed vs Companies toggle ──────────────────────────────────────────
  const [view, setView] = useState<'feed' | 'companies'>('feed')
  const [companySearch, setCompanySearch] = useState('')
  const [companies, setCompanies] = useState<CompanyListItem[]>([])
  const [companiesLoading, setCompaniesLoading] = useState(false)

  const loadCompanies = useCallback(async (search?: string) => {
    setCompaniesLoading(true)
    try {
      const res = await companyInsightsService.list(search)
      setCompanies(res.data)
    } catch {
      // silently fail, show empty state
    } finally {
      setCompaniesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (view === 'companies') loadCompanies(companySearch)
  }, [view])

  useEffect(() => {
    if (view !== 'companies') return
    const t = setTimeout(() => loadCompanies(companySearch), 350)
    return () => clearTimeout(t)
  }, [companySearch])

  const toggleTag = (tag: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
    }))
  }

  const handleSubmit = async () => {
    if (!form.company || !form.role || !form.content) {
      Alert.alert('Missing Fields', 'Company, role, and content are required')
      return
    }
    setSubmitting(true)
    try {
      await create(form)
      setShowForm(false)
      setForm({ company: '', role: '', content: '', tags: [] })
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to post')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = (id: string) => {
    Alert.alert('Delete Post', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove(id) },
    ])
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Community</Text>
            <Text style={styles.subtitle}>Share your interview experiences</Text>
          </View>
          <TouchableOpacity onPress={() => setShowForm(true)} style={styles.addBtn}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.addBtnGradient}
            >
              <Text style={styles.addBtnText}>+ Post</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Feed / Companies toggle */}
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.viewToggleBtn, view === 'feed' && styles.viewToggleBtnActive]}
            onPress={() => setView('feed')}
          >
            <Text style={[styles.viewToggleText, view === 'feed' && styles.viewToggleTextActive]}>📰 Feed</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggleBtn, view === 'companies' && styles.viewToggleBtnActive]}
            onPress={() => setView('companies')}
          >
            <Text style={[styles.viewToggleText, view === 'companies' && styles.viewToggleTextActive]}>🏢 Companies</Text>
          </TouchableOpacity>
        </View>

        {view === 'companies' ? (
          <>
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search companies…"
                placeholderTextColor={Colors.textMuted}
                value={companySearch}
                onChangeText={setCompanySearch}
              />
            </View>

            {companiesLoading ? (
              <View style={styles.centered}>
                <ActivityIndicator color={Colors.primary} size="large" />
              </View>
            ) : companies.length === 0 ? (
              <View style={styles.centered}>
                <Text style={styles.emptyIcon}>🏢</Text>
                <Text style={styles.emptyTitle}>No companies yet</Text>
                <Text style={styles.emptyText}>Interview experiences will show up here once shared.</Text>
              </View>
            ) : (
              <FlatList
                data={companies}
                keyExtractor={c => c.company}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.companyCard}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('CompanyDetail', { company: item.company })}
                  >
                    <View style={styles.companyAvatar}>
                      <Text style={styles.companyAvatarText}>{item.company.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.companyName}>{item.company}</Text>
                      <Text style={styles.companyMeta}>{item.postCount} experience{item.postCount !== 1 ? 's' : ''} shared</Text>
                    </View>
                    <Text style={styles.companyArrow}>›</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </>
        ) : loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={Colors.primary} size="large" />
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptyText}>Be the first to share your experience!</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowForm(true)}>
              <Text style={styles.emptyBtnText}>Share Experience</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={refetch} tintColor={Colors.primary} />
            }
            renderItem={({ item }) => (
              <PostCard
                post={item}
                onLike={() => like(item.id)}
                onPress={() => navigation.navigate('PostDetail', { post: item })}
                onDelete={() => handleDelete(item.id)}
              />
            )}
          />
        )}
      </View>

      {/* Create Post Modal */}
      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowForm(false)}>
        <View style={styles.modal}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Share Your Experience</Text>
            <TouchableOpacity onPress={() => setShowForm(false)} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Input label="Company *" placeholder="e.g. Google, Pathao" value={form.company}
              onChangeText={v => setForm(p => ({ ...p, company: v }))} />
            <Input label="Role *" placeholder="e.g. Software Engineer" value={form.role}
              onChangeText={v => setForm(p => ({ ...p, role: v }))} />
            <Input label="Your Experience *" placeholder="Share what happened in your interview..."
              value={form.content} onChangeText={v => setForm(p => ({ ...p, content: v }))}
              multiline numberOfLines={5} style={{ height: 120, paddingTop: 12 }} />

            <Text style={styles.tagLabel}>Tags</Text>
            <View style={styles.tagGrid}>
              {TAGS.map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tagChip, form.tags.includes(tag) && styles.tagChipActive]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={[styles.tagChipText, form.tags.includes(tag) && styles.tagChipTextActive]}>
                    #{tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button label="Publish Post" onPress={handleSubmit} loading={submitting} style={{ marginTop: Spacing.md }} />
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  viewToggle: { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  viewToggleBtn: { flex: 1, paddingVertical: 10, borderRadius: Radius.md, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  viewToggleBtnActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  viewToggleText: { fontSize: 12, color: Colors.textSecondary, fontFamily: Fonts.dmSansBold },
  viewToggleTextActive: { color: Colors.primary },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
    height: 48, gap: Spacing.sm,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, color: Colors.textPrimary, fontFamily: Fonts.dmSansRegular, fontSize: 14 },
  companyCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, marginBottom: Spacing.md,
  },
  companyAvatar: { width: 44, height: 44, borderRadius: Radius.md, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  companyAvatarText: { fontSize: 18, fontFamily: Fonts.soraBold, color: Colors.primary },
  companyName: { fontSize: 15, color: Colors.textPrimary, fontFamily: Fonts.soraSemiBold },
  companyMeta: { fontSize: 12, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular, marginTop: 2 },
  companyArrow: { fontSize: 22, color: Colors.textMuted },
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md,
  },
  title: { fontSize: 24, color: Colors.textPrimary, fontFamily: Fonts.soraBold },
  subtitle: { fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular, marginTop: 2 },
  addBtn: { borderRadius: Radius.md, overflow: 'hidden' },
  addBtnGradient: { paddingHorizontal: Spacing.md, paddingVertical: 10, borderRadius: Radius.md },
  addBtnText: { color: '#fff', fontFamily: Fonts.soraSemiBold, fontSize: 14 },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.sm },
  emptyTitle: { fontSize: 18, color: Colors.textPrimary, fontFamily: Fonts.soraSemiBold },
  emptyText: { fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular, textAlign: 'center' },
  emptyBtn: {
    marginTop: Spacing.md, backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.lg, paddingVertical: 12,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.primary,
  },
  emptyBtnText: { color: Colors.primary, fontFamily: Fonts.dmSansBold, fontSize: 14 },
  modal: { flex: 1, backgroundColor: Colors.background },
  modalHandle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginTop: 12 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  modalTitle: { fontSize: 18, color: Colors.textPrimary, fontFamily: Fonts.soraBold },
  closeBtn: {
    width: 32, height: 32, borderRadius: Radius.full, backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  closeText: { color: Colors.textSecondary, fontSize: 14 },
  modalContent: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  tagLabel: { color: Colors.textSecondary, fontFamily: Fonts.dmSansMedium, fontSize: 13, marginBottom: Spacing.sm },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.lg },
  tagChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  tagChipActive: { backgroundColor: Colors.secondaryLight, borderColor: Colors.secondary },
  tagChipText: { fontSize: 12, color: Colors.textSecondary, fontFamily: Fonts.dmSansMedium },
  tagChipTextActive: { color: Colors.secondary, fontFamily: Fonts.dmSansBold },
})