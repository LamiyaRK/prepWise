import React, { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Alert,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { companyInsightsService, CompanyInsights, CompanyInsightPost } from '../../../services/companyInsights.service'
import { Colors, Fonts, Radius, Spacing } from '../../../constants/theme'

export const CompanyDetailScreen = ({ route, navigation }: any) => {
  const { company } = route.params
  const [data, setData] = useState<CompanyInsights | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await companyInsightsService.getInsights(company)
      setData(res.data)
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Could not load insights')
      navigation.goBack()
    } finally {
      setLoading(false)
    }
  }, [company])

  React.useEffect(() => { load() }, [load])

  if (loading || !data) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}><ActivityIndicator color={Colors.primary} size="large" /></View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={data.posts}
        keyExtractor={p => p.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            <LinearGradient colors={['#6C63FF', '#00D4FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
              <Text style={styles.heroInitial}>{data.company.charAt(0).toUpperCase()}</Text>
            </LinearGradient>
            <Text style={styles.companyName}>{data.company}</Text>
            <Text style={styles.postCount}>{data.totalPosts} shared interview experience{data.totalPosts !== 1 ? 's' : ''}</Text>

            {!!data.topRoles.length && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Roles People Interviewed For</Text>
                <View style={styles.pillRow}>
                  {data.topRoles.map(r => (
                    <View key={r.label} style={styles.rolePill}>
                      <Text style={styles.rolePillText}>{r.label}</Text>
                      <Text style={styles.rolePillCount}>{r.count}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {!!data.topTags.length && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Common Interview Topics</Text>
                <View style={styles.pillRow}>
                  {data.topTags.map(t => (
                    <View key={t.label} style={styles.tagPill}>
                      <Text style={styles.tagPillText}>#{t.label}</Text>
                      <Text style={styles.tagPillCount}>{t.count}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>All Experiences</Text>
          </>
        }
        renderItem={({ item }) => <ExperienceCard post={item} />}
      />
    </SafeAreaView>
  )
}

const ExperienceCard = ({ post }: { post: CompanyInsightPost }) => (
  <View style={styles.card}>
    <View style={styles.cardTop}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{post.user.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.authorName}>{post.user.name}</Text>
        <Text style={styles.roleTag}>{post.role} · {new Date(post.createdAt).toLocaleDateString()}</Text>
      </View>
    </View>
    <Text style={styles.cardContent} numberOfLines={6}>{post.content}</Text>
    {!!post.tags.length && (
      <View style={styles.cardTags}>
        {post.tags.map(t => (
          <View key={t} style={styles.smallTag}><Text style={styles.smallTagText}>#{t}</Text></View>
        ))}
      </View>
    )}
    <View style={styles.cardFooter}>
      <Text style={styles.footerText}>❤️ {post.likeCount}</Text>
      <Text style={styles.footerText}>💬 {post.commentCount}</Text>
    </View>
  </View>
)

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  backBtn: { marginBottom: Spacing.md },
  backText: { color: Colors.primary, fontFamily: Fonts.dmSansBold, fontSize: 14 },
  hero: { width: 72, height: 72, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 12 },
  heroInitial: { fontSize: 32, fontFamily: Fonts.soraBold, color: '#fff' },
  companyName: { fontSize: 22, color: Colors.textPrimary, fontFamily: Fonts.soraBold, textAlign: 'center' },
  postCount: { fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular, textAlign: 'center', marginTop: 4, marginBottom: Spacing.lg },
  section: { marginBottom: Spacing.md },
  sectionTitle: { fontSize: 14, color: Colors.textPrimary, fontFamily: Fonts.soraSemiBold, marginBottom: Spacing.sm },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rolePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: Radius.full, backgroundColor: Colors.primaryLight, borderWidth: 1, borderColor: Colors.primary + '44',
  },
  rolePillText: { fontSize: 12, color: Colors.primary, fontFamily: Fonts.dmSansBold },
  rolePillCount: { fontSize: 11, color: Colors.primary, fontFamily: Fonts.dmSansRegular, opacity: 0.7 },
  tagPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: Radius.full, backgroundColor: Colors.secondaryLight, borderWidth: 1, borderColor: Colors.secondary + '44',
  },
  tagPillText: { fontSize: 12, color: Colors.secondary, fontFamily: Fonts.dmSansBold },
  tagPillCount: { fontSize: 11, color: Colors.secondary, fontFamily: Fonts.dmSansRegular, opacity: 0.7 },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, marginBottom: Spacing.md },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  avatar: { width: 34, height: 34, borderRadius: Radius.full, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.primary, fontFamily: Fonts.soraBold, fontSize: 14 },
  authorName: { fontSize: 13, color: Colors.textPrimary, fontFamily: Fonts.dmSansBold },
  roleTag: { fontSize: 11, color: Colors.textMuted, fontFamily: Fonts.dmSansRegular },
  cardContent: { fontSize: 13, color: Colors.textPrimary, fontFamily: Fonts.dmSansRegular, lineHeight: 20, marginBottom: Spacing.sm },
  cardTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.sm },
  smallTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, backgroundColor: Colors.secondaryLight },
  smallTagText: { fontSize: 10, color: Colors.secondary, fontFamily: Fonts.dmSansMedium },
  cardFooter: { flexDirection: 'row', gap: Spacing.lg, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  footerText: { fontSize: 12, color: Colors.textSecondary, fontFamily: Fonts.dmSansMedium },
})
