import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { CommunityPost } from '../../../services/community.service'
import { Colors, Fonts, Radius, Spacing } from '../../../constants/theme'
import { useAuthStore } from '../../../store/authStore'

interface Props {
  post: CommunityPost
  onLike: () => void
  onPress: () => void
  onDelete: () => void
}

export const PostCard = ({ post, onLike, onPress, onDelete }: Props) => {
  const { user } = useAuthStore()
  const isLiked = user ? post.likes.includes(user.id) : false
  const isOwner = user?.id === post.userId

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <View style={styles.card}>
        {/* Author */}
        <View style={styles.authorRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{post.user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{post.user.name}</Text>
            <Text style={styles.date}>{new Date(post.createdAt).toLocaleDateString()}</Text>
          </View>
          {isOwner && (
            <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Company + Role */}
        <View style={styles.roleRow}>
          <Text style={styles.company}>{post.company}</Text>
          <Text style={styles.roleSep}>·</Text>
          <Text style={styles.role}>{post.role}</Text>
        </View>

        {/* Content */}
        <Text style={styles.content} numberOfLines={4}>{post.content}</Text>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <View style={styles.tags}>
            {post.tags.slice(0, 4).map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerBtn} onPress={onLike}>
            <Text style={styles.footerIcon}>{isLiked ? '❤️' : '🤍'}</Text>
            <Text style={[styles.footerText, isLiked && { color: Colors.accent }]}>
              {post.likes.length}
            </Text>
          </TouchableOpacity>
          <View style={styles.footerBtn}>
            <Text style={styles.footerIcon}>💬</Text>
            <Text style={styles.footerText}>{post.comments.length}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.primary, fontFamily: Fonts.soraBold, fontSize: 16 },
  authorInfo: { flex: 1 },
  authorName: { fontSize: 13, color: Colors.textPrimary, fontFamily: Fonts.dmSansBold },
  date: { fontSize: 11, color: Colors.textMuted, fontFamily: Fonts.dmSansRegular },
  deleteBtn: { padding: 4 },
  deleteIcon: { fontSize: 16 },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  company: { fontSize: 13, color: Colors.primary, fontFamily: Fonts.dmSansBold },
  roleSep: { fontSize: 13, color: Colors.textMuted },
  role: { fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular },
  content: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontFamily: Fonts.dmSansRegular,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.sm },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: Colors.secondaryLight,
    borderWidth: 1,
    borderColor: Colors.secondary + '33',
  },
  tagText: { fontSize: 10, color: Colors.secondary, fontFamily: Fonts.dmSansMedium },
  footer: {
    flexDirection: 'row',
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerIcon: { fontSize: 14 },
  footerText: { fontSize: 12, color: Colors.textSecondary, fontFamily: Fonts.dmSansMedium },
})