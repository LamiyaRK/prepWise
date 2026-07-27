import React, { useState } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native'
import { communityService, CommunityPost, Comment } from '../../../services/community.service'
import { useAuthStore } from '../../../store/authStore'
import { Colors, Fonts, Radius, Spacing } from '../../../constants/theme'

export const PostDetailScreen = ({ route, navigation }: any) => {
  const initialPost: CommunityPost = route.params.post
  const { user } = useAuthStore()

  const [post, setPost] = useState<CommunityPost>(initialPost)
  const [commentText, setCommentText] = useState('')
  const [posting, setPosting] = useState(false)

  const isLiked = user ? post.likes.includes(user.id) : false

  const handleLike = async () => {
    // Optimistic update, same pattern as the feed list
    const wasLiked = isLiked
    setPost(prev => ({
      ...prev,
      likes: wasLiked ? prev.likes.filter(id => id !== user?.id) : [...prev.likes, user!.id],
    }))
    try {
      await communityService.like(post.id)
    } catch (err: any) {
      // revert on failure
      setPost(prev => ({
        ...prev,
        likes: wasLiked ? [...prev.likes, user!.id] : prev.likes.filter(id => id !== user?.id),
      }))
      Alert.alert('Error', err?.response?.data?.error || 'Could not update like')
    }
  }

  const handleComment = async () => {
    const content = commentText.trim()
    if (!content) return
    setPosting(true)
    try {
      const res = await communityService.comment(post.id, content)
      setPost(prev => ({ ...prev, comments: [...prev.comments, res.data] }))
      setCommentText('')
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Could not post comment')
    } finally {
      setPosting(false)
    }
  }

  const handleReport = () => {
    Alert.alert(
      'Report this post',
      'Why are you reporting this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Spam', onPress: () => submitReport('Spam or irrelevant content') },
        { text: 'Inappropriate', onPress: () => submitReport('Inappropriate or offensive content') },
        { text: 'Misleading', onPress: () => submitReport('Misleading or false information') },
      ]
    )
  }

  const submitReport = async (reason: string) => {
    try {
      await communityService.report(post.id, reason)
      Alert.alert('Reported', 'Thanks — our team will review this post.')
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Could not report this post')
    }
  }

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentRow}>
      <View style={styles.commentAvatar}>
        <Text style={styles.commentAvatarText}>{item.user.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.commentBubble}>
        <Text style={styles.commentAuthor}>{item.user.name}</Text>
        <Text style={styles.commentText}>{item.content}</Text>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={post.comments}
          keyExtractor={c => c.id}
          renderItem={renderComment}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <>
              <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                  <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleReport} style={styles.reportBtn}>
                  <Text style={styles.reportText}>🚩 Report</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.card}>
                <View style={styles.authorRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{post.user.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.authorName}>{post.user.name}</Text>
                    <Text style={styles.date}>{new Date(post.createdAt).toLocaleDateString()}</Text>
                  </View>
                </View>

                <View style={styles.roleRow}>
                  <Text style={styles.company}>{post.company}</Text>
                  <Text style={styles.roleSep}>·</Text>
                  <Text style={styles.role}>{post.role}</Text>
                </View>

                <Text style={styles.content}>{post.content}</Text>

                {post.tags?.length > 0 && (
                  <View style={styles.tags}>
                    {post.tags.map(tag => (
                      <View key={tag} style={styles.tag}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.footer}>
                  <TouchableOpacity style={styles.footerBtn} onPress={handleLike}>
                    <Text style={styles.footerIcon}>{isLiked ? '❤️' : '🤍'}</Text>
                    <Text style={[styles.footerText, isLiked && { color: Colors.accent }]}>{post.likes.length}</Text>
                  </TouchableOpacity>
                  <View style={styles.footerBtn}>
                    <Text style={styles.footerIcon}>💬</Text>
                    <Text style={styles.footerText}>{post.comments.length}</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.commentsTitle}>
                {post.comments.length > 0 ? `Comments (${post.comments.length})` : 'No comments yet'}
              </Text>
            </>
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>Be the first to comment.</Text>
          }
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Write a comment…"
            placeholderTextColor={Colors.textMuted}
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!commentText.trim() || posting) && styles.sendBtnDisabled]}
            onPress={handleComment}
            disabled={!commentText.trim() || posting}
          >
            <Text style={styles.sendText}>{posting ? '…' : 'Post'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.md, paddingBottom: Spacing.xl },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  backBtn: {},
  backText: { color: Colors.primary, fontFamily: Fonts.dmSansBold, fontSize: 14 },
  reportBtn: { paddingHorizontal: 10, paddingVertical: 4 },
  reportText: { color: Colors.accent, fontFamily: Fonts.dmSansBold, fontSize: 13 },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.sm },
  avatar: { width: 40, height: 40, borderRadius: Radius.full, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.primary, fontFamily: Fonts.soraBold, fontSize: 16 },
  authorName: { fontSize: 14, color: Colors.textPrimary, fontFamily: Fonts.dmSansBold },
  date: { fontSize: 11, color: Colors.textMuted, fontFamily: Fonts.dmSansRegular },
  roleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.sm },
  company: { fontSize: 13, color: Colors.primary, fontFamily: Fonts.dmSansBold },
  roleSep: { fontSize: 13, color: Colors.textMuted },
  role: { fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular },
  content: { fontSize: 14, color: Colors.textPrimary, fontFamily: Fonts.dmSansRegular, lineHeight: 21, marginBottom: Spacing.sm },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.sm },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, backgroundColor: Colors.secondaryLight, borderWidth: 1, borderColor: Colors.secondary + '33' },
  tagText: { fontSize: 10, color: Colors.secondary, fontFamily: Fonts.dmSansMedium },
  footer: { flexDirection: 'row', gap: Spacing.lg, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  footerBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerIcon: { fontSize: 14 },
  footerText: { fontSize: 12, color: Colors.textSecondary, fontFamily: Fonts.dmSansMedium },

  commentsTitle: { fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.dmSansBold, marginBottom: Spacing.sm },
  emptyText: { fontSize: 13, color: Colors.textMuted, fontFamily: Fonts.dmSansRegular, textAlign: 'center', marginTop: Spacing.md },

  commentRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  commentAvatar: { width: 30, height: 30, borderRadius: Radius.full, backgroundColor: Colors.secondaryLight, alignItems: 'center', justifyContent: 'center' },
  commentAvatarText: { color: Colors.secondary, fontFamily: Fonts.soraBold, fontSize: 13 },
  commentBubble: { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, padding: Spacing.sm },
  commentAuthor: { fontSize: 12, color: Colors.textPrimary, fontFamily: Fonts.dmSansBold, marginBottom: 2 },
  commentText: { fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular, lineHeight: 18 },

  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm,
    padding: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  input: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, color: Colors.textPrimary,
    fontFamily: Fonts.dmSansRegular, fontSize: 14, maxHeight: 100,
  },
  sendBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  sendBtnDisabled: { backgroundColor: Colors.border },
  sendText: { color: '#fff', fontFamily: Fonts.dmSansBold, fontSize: 14 },
})
