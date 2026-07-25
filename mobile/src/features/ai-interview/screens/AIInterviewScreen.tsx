import React, { useState, useRef } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, TextInput, KeyboardAvoidingView, Platform,
  ActivityIndicator, ScrollView, Alert,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { aiInterviewService, RespondInterviewResponse } from '../../../services/aiInterview.service'
import { Colors, Fonts, Radius, Spacing } from '../../../constants/theme'

type Phase = 'setup' | 'chat' | 'result'

interface ChatMessage {
  id: string
  sender: 'AI' | 'USER'
  content: string
}

const CATEGORIES = ['DSA', 'System Design', 'Behavioral', 'Frontend', 'Backend', 'HR']

const scoreColor = (score: number) => {
  if (score >= 80) return Colors.success
  if (score >= 50) return Colors.warning
  return Colors.accent
}

export const AIInterviewScreen = ({ navigation }: any) => {
  const [phase, setPhase] = useState<Phase>('setup')
  const [role, setRole] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [starting, setStarting] = useState(false)

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [progress, setProgress] = useState({ exchange: 1, max: 5 })

  const [result, setResult] = useState<RespondInterviewResponse | null>(null)

  const listRef = useRef<FlatList>(null)

  const scrollToEnd = () => setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)

  const handleStart = async () => {
    if (!role.trim()) {
      Alert.alert('Role required', 'Tell us what role you\u2019re interviewing for.')
      return
    }
    setStarting(true)
    try {
      const res = await aiInterviewService.start(role.trim(), category)
      setSessionId(res.data.sessionId)
      setMessages([{ id: 'q1', sender: 'AI', content: res.data.question }])
      setProgress({ exchange: res.data.exchange, max: res.data.maxExchanges })
      setPhase('chat')
      scrollToEnd()
    } catch (err: any) {
      Alert.alert('Could not start interview', err?.response?.data?.error || 'Something went wrong')
    } finally {
      setStarting(false)
    }
  }

  const handleSend = async () => {
    if (!draft.trim() || !sessionId || sending) return
    const answerText = draft.trim()
    setDraft('')
    setMessages(prev => [...prev, { id: `u-${Date.now()}`, sender: 'USER', content: answerText }])
    scrollToEnd()
    setSending(true)
    try {
      const res = await aiInterviewService.respond(sessionId, answerText)
      if (res.data.done) {
        setResult(res.data)
        setPhase('result')
      } else {
        setMessages(prev => [...prev, { id: `a-${Date.now()}`, sender: 'AI', content: res.data.question! }])
        setProgress({ exchange: res.data.exchange!, max: res.data.maxExchanges! })
        scrollToEnd()
      }
    } catch (err: any) {
      Alert.alert('Something went wrong', err?.response?.data?.error || 'Could not reach the interviewer. Try again.')
    } finally {
      setSending(false)
    }
  }

  const resetAll = () => {
    setPhase('setup')
    setSessionId(null)
    setMessages([])
    setResult(null)
    setDraft('')
  }

  // ── Setup phase ─────────────────────────────────────────────────────────

  if (phase === 'setup') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>AI Mock Interview</Text>
          <Text style={styles.subtitle}>A real back-and-forth — the AI asks follow-ups based on what you say.</Text>
        </View>

        <ScrollView contentContainerStyle={styles.setupContent}>
          <Text style={styles.label}>What role are you preparing for?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Frontend Developer, Data Analyst"
            placeholderTextColor={Colors.textMuted}
            value={role}
            onChangeText={setRole}
          />

          <Text style={[styles.label, { marginTop: Spacing.lg }]}>Focus area</Text>
          <View style={styles.chipGrid}>
            {CATEGORIES.map(cat => {
              const active = category === cat
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              )
            })}
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              You'll get 5 questions total. Each follow-up digs into your previous answer, so answer like you would in a real interview — the more specific you are, the better the follow-ups.
            </Text>
          </View>

          <TouchableOpacity onPress={handleStart} disabled={starting} activeOpacity={0.85}>
            <LinearGradient colors={['#6C63FF', '#00D4FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startBtn}>
              {starting ? <ActivityIndicator color="#fff" /> : <Text style={styles.startBtnText}>Start Interview →</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    )
  }

  // ── Result phase ────────────────────────────────────────────────────────

  if (phase === 'result' && result) {
    const color = scoreColor(result.overallScore ?? 0)
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.resultContent}>
          <Text style={styles.resultTitle}>Interview Complete</Text>

          <View style={[styles.scoreCircle, { borderColor: color }]}>
            <Text style={[styles.scoreValue, { color }]}>{result.overallScore}</Text>
            <Text style={styles.scoreMax}>/ 100</Text>
          </View>

          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackLabel}>Overall Feedback</Text>
            <Text style={styles.feedbackText}>{result.feedback}</Text>
          </View>

          {!!result.strengths?.length && (
            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackLabel}>💪 Strengths</Text>
              {result.strengths.map((s, i) => (
                <Text key={i} style={styles.listItem}>• {s}</Text>
              ))}
            </View>
          )}

          {!!result.improvements?.length && (
            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackLabel}>🎯 To Improve</Text>
              {result.improvements.map((s, i) => (
                <Text key={i} style={styles.listItem}>• {s}</Text>
              ))}
            </View>
          )}

          <TouchableOpacity onPress={resetAll} activeOpacity={0.85} style={{ marginTop: Spacing.lg }}>
            <LinearGradient colors={['#6C63FF', '#00D4FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startBtn}>
              <Text style={styles.startBtnText}>Practice Again</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: Spacing.md, alignItems: 'center' }}>
            <Text style={styles.backText}>Back to Home</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    )
  }

  // ── Chat phase ──────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Exit</Text>
        </TouchableOpacity>
        <Text style={styles.chatProgress}>Question {progress.exchange} of {progress.max}</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id}
          contentContainerStyle={styles.chatList}
          renderItem={({ item }) => (
            <View style={[styles.bubbleRow, item.sender === 'USER' && styles.bubbleRowRight]}>
              <View style={[styles.bubble, item.sender === 'USER' ? styles.bubbleUser : styles.bubbleAI]}>
                <Text style={[styles.bubbleText, item.sender === 'USER' && { color: '#fff' }]}>{item.content}</Text>
              </View>
            </View>
          )}
          ListFooterComponent={sending ? (
            <View style={styles.bubbleRow}>
              <View style={[styles.bubble, styles.bubbleAI]}>
                <ActivityIndicator color={Colors.primary} size="small" />
              </View>
            </View>
          ) : null}
        />

        <View style={styles.composer}>
          <TextInput
            style={styles.composerInput}
            placeholder="Type your answer…"
            placeholderTextColor={Colors.textMuted}
            value={draft}
            onChangeText={setDraft}
            multiline
            editable={!sending}
          />
          <TouchableOpacity onPress={handleSend} disabled={sending || !draft.trim()} style={styles.sendBtn}>
            <Text style={styles.sendBtnText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  backText: { color: Colors.primary, fontFamily: Fonts.dmSansBold, fontSize: 14 },
  title: { fontSize: 24, color: Colors.textPrimary, fontFamily: Fonts.soraBold, marginTop: Spacing.md },
  subtitle: { fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular, marginTop: 4, lineHeight: 19 },

  setupContent: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  label: { color: Colors.textSecondary, fontFamily: Fonts.dmSansMedium, fontSize: 13, marginBottom: 8 },
  input: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, height: 52, paddingHorizontal: 16,
    color: Colors.textPrimary, fontFamily: Fonts.dmSansRegular, fontSize: 15,
  },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: Radius.full,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.dmSansMedium },
  chipTextActive: { color: Colors.primary, fontFamily: Fonts.dmSansBold },
  infoBox: {
    backgroundColor: Colors.primaryLight, borderRadius: Radius.md, padding: Spacing.md,
    marginTop: Spacing.xl, borderWidth: 1, borderColor: Colors.primary + '33',
  },
  infoText: { fontSize: 12, color: Colors.textPrimary, fontFamily: Fonts.dmSansRegular, lineHeight: 18 },
  startBtn: { height: 54, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.xl },
  startBtnText: { color: '#fff', fontFamily: Fonts.soraSemiBold, fontSize: 16 },

  resultContent: { padding: Spacing.lg, paddingBottom: Spacing.xxl, alignItems: 'center' },
  resultTitle: { fontSize: 22, color: Colors.textPrimary, fontFamily: Fonts.soraBold, marginTop: Spacing.md, marginBottom: Spacing.lg },
  scoreCircle: {
    width: 120, height: 120, borderRadius: 60, borderWidth: 4,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg,
  },
  scoreValue: { fontSize: 36, fontFamily: Fonts.soraBold },
  scoreMax: { fontSize: 12, color: Colors.textMuted, fontFamily: Fonts.dmSansRegular },
  feedbackCard: {
    width: '100%', backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, marginBottom: Spacing.md,
  },
  feedbackLabel: { fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.dmSansBold, marginBottom: 6 },
  feedbackText: { fontSize: 14, color: Colors.textPrimary, fontFamily: Fonts.dmSansRegular, lineHeight: 21 },
  listItem: { fontSize: 13, color: Colors.textPrimary, fontFamily: Fonts.dmSansRegular, lineHeight: 20, marginTop: 2 },

  chatHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  chatProgress: { fontSize: 12, color: Colors.textSecondary, fontFamily: Fonts.dmSansMedium },
  chatList: { padding: Spacing.lg, gap: Spacing.sm },
  bubbleRow: { flexDirection: 'row', marginBottom: Spacing.sm },
  bubbleRowRight: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '80%', borderRadius: Radius.lg, padding: Spacing.md },
  bubbleAI: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderTopLeftRadius: 4 },
  bubbleUser: { backgroundColor: Colors.primary, borderTopRightRadius: 4 },
  bubbleText: { fontSize: 14, color: Colors.textPrimary, fontFamily: Fonts.dmSansRegular, lineHeight: 20 },
  composer: {
    flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm,
    padding: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  composerInput: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 10,
    color: Colors.textPrimary, fontFamily: Fonts.dmSansRegular, fontSize: 14, maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: Radius.full, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnText: { color: '#fff', fontSize: 18 },
})
