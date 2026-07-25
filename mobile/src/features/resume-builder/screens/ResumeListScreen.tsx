import React, { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Alert,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import { resumeService, ResumeListItem } from '../../../services/resume.service'
import { Colors, Fonts, Radius, Spacing } from '../../../constants/theme'

export const ResumeListScreen = ({ navigation }: any) => {
  const [resumes, setResumes] = useState<ResumeListItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await resumeService.list()
      setResumes(res.data)
    } catch {
      // silently fail, show empty state
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const handleDelete = (id: string) => {
    Alert.alert('Delete Resume', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await resumeService.remove(id)
            setResumes(prev => prev.filter(r => r.id !== id))
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.error || 'Could not delete')
          }
        },
      },
    ])
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Resume Builder</Text>
            <Text style={styles.subtitle}>{resumes.length} saved draft{resumes.length !== 1 ? 's' : ''}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ResumeBuilder', {})} style={styles.addBtn}>
            <LinearGradient colors={[Colors.primary, Colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.addBtnGradient}>
              <Text style={styles.addBtnText}>+ New</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator color={Colors.primary} size="large" /></View>
      ) : resumes.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyTitle}>No resumes yet</Text>
          <Text style={styles.emptyText}>Build one from scratch — AI can help polish your bullet points along the way.</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('ResumeBuilder', {})}>
            <Text style={styles.emptyBtnText}>Start Building</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={resumes}
          keyExtractor={r => r.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ResumeBuilder', { resumeId: item.id })}
            >
              <View style={styles.cardIcon}><Text style={{ fontSize: 20 }}>📄</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardMeta}>Updated {new Date(item.updatedAt).toLocaleDateString()}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                <Text style={{ fontSize: 16 }}>🗑️</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.md },
  backText: { color: Colors.primary, fontFamily: Fonts.dmSansBold, fontSize: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },
  title: { fontSize: 24, color: Colors.textPrimary, fontFamily: Fonts.soraBold },
  subtitle: { fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular, marginTop: 2 },
  addBtn: { borderRadius: Radius.md, overflow: 'hidden' },
  addBtnGradient: { paddingHorizontal: Spacing.md, paddingVertical: 10, borderRadius: Radius.md },
  addBtnText: { color: '#fff', fontFamily: Fonts.soraSemiBold, fontSize: 14 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.xl },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, color: Colors.textPrimary, fontFamily: Fonts.soraSemiBold },
  emptyText: { fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular, textAlign: 'center', lineHeight: 20 },
  emptyBtn: { marginTop: Spacing.md, backgroundColor: Colors.primaryLight, paddingHorizontal: Spacing.lg, paddingVertical: 12, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.primary },
  emptyBtnText: { color: Colors.primary, fontFamily: Fonts.dmSansBold, fontSize: 14 },
  list: { padding: Spacing.lg, paddingTop: 0 },
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, marginBottom: Spacing.md },
  cardIcon: { width: 44, height: 44, borderRadius: Radius.md, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 15, color: Colors.textPrimary, fontFamily: Fonts.soraSemiBold },
  cardMeta: { fontSize: 12, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular, marginTop: 2 },
  deleteBtn: { padding: 4 },
})
