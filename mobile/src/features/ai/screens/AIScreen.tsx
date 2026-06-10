import React, { useState, useRef } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Alert, Modal, TextInput,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Audio } from 'expo-av'
import { Colors, Fonts, Radius, Spacing } from '../../../constants/theme'

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'voice' | 'generate'

interface GeneratedQuestion {
  question:   string
  hint:       string
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

// ─── Mock AI calls (swap for real API when backend is ready) ─────────────────

const mockEvaluateSpeech = async (transcript: string): Promise<{
  score: number; feedback: string; tips: string[]
}> => {
  await new Promise(r => setTimeout(r, 2000))
  const words = transcript.trim().split(' ').length
  const score = Math.min(95, 40 + words * 2)
  return {
    score,
    feedback: words < 15
      ? 'Your answer was too brief. Try to elaborate more on your thought process and provide concrete examples.'
      : 'Good structure! Your answer covered the key points. Work on adding more specific examples to strengthen it.',
    tips: [
      'Use the STAR method: Situation, Task, Action, Result.',
      'Aim for 1–2 minute answers — not too short, not too long.',
      'Pause briefly before answering to collect your thoughts.',
    ],
  }
}

const mockGenerateQuestions = async (role: string, category: string): Promise<GeneratedQuestion[]> => {
  await new Promise(r => setTimeout(r, 1800))
  const bank: Record<string, GeneratedQuestion[]> = {
    Behavioral: [
      { question: `Tell me about a time you led a team through a challenge at ${role || 'your company'}.`, hint: 'Use the STAR method.', difficulty: 'Medium' },
      { question: 'Describe a situation where you had to meet a tight deadline.', hint: 'Focus on your process.', difficulty: 'Easy' },
      { question: 'Give an example of when you disagreed with a manager and how you handled it.', hint: 'Show emotional intelligence.', difficulty: 'Hard' },
    ],
    Technical: [
      { question: `What are the most important technical skills for a ${role || 'developer'}?`, hint: 'Mention tools you use daily.', difficulty: 'Easy' },
      { question: 'Explain the difference between synchronous and asynchronous programming.', hint: 'Use a real example.', difficulty: 'Medium' },
      { question: 'How would you design a scalable REST API for a social platform?', hint: 'Cover auth, pagination, caching.', difficulty: 'Hard' },
    ],
    HR: [
      { question: 'Why do you want to work at this company?', hint: 'Research the company first.', difficulty: 'Easy' },
      { question: 'Where do you see yourself in 5 years?', hint: 'Align with the role.', difficulty: 'Easy' },
      { question: 'What is your greatest weakness and how are you working on it?', hint: 'Be honest but show growth.', difficulty: 'Medium' },
    ],
  }
  return bank[category] ?? bank['Behavioral']
}

// ─── Voice Practice Tab ───────────────────────────────────────────────────────

const PRACTICE_QUESTIONS = [
  'Tell me about yourself.',
  'What is your greatest strength?',
  'Why do you want this job?',
  'Describe a difficult situation you handled.',
  'Where do you see yourself in 5 years?',
]

const VoiceTab = () => {
  const [qIndex,      setQIndex]      = useState(0)
  const [recording,   setRecording]   = useState<Audio.Recording | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript,  setTranscript]  = useState('')
  const [evaluating,  setEvaluating]  = useState(false)
  const [result,      setResult]      = useState<{ score: number; feedback: string; tips: string[] } | null>(null)

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Microphone access is required for voice practice.')
        return
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true })
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      )
      setRecording(rec)
      setIsRecording(true)
      setResult(null)
      setTranscript('')
    } catch {
      Alert.alert('Error', 'Could not start recording.')
    }
  }

  const stopRecording = async () => {
    if (!recording) return
    setIsRecording(false)
    await recording.stopAndUnloadAsync()
    setRecording(null)
    // Simulate speech-to-text
    const sampleAnswers = [
      'I am a software developer with 2 years of experience in React Native and Node.js. I enjoy building user-friendly mobile applications.',
      'My greatest strength is problem solving. I approach every challenge systematically and always look for the most efficient solution.',
      'I want this job because your company is known for innovation and I believe my skills in mobile development align well with your product roadmap.',
    ]
    const fakeTranscript = sampleAnswers[qIndex % sampleAnswers.length]
    setTranscript(fakeTranscript)
    setEvaluating(true)
    const eval_ = await mockEvaluateSpeech(fakeTranscript)
    setResult(eval_)
    setEvaluating(false)
  }

  const nextQuestion = () => {
    setQIndex(i => (i + 1) % PRACTICE_QUESTIONS.length)
    setResult(null)
    setTranscript('')
  }

  const scoreColor = result
    ? result.score >= 80 ? Colors.success : result.score >= 60 ? Colors.warning : Colors.accent
    : Colors.primary

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md, paddingBottom: Spacing.xxl }} showsVerticalScrollIndicator={false}>

      {/* Question card */}
      <LinearGradient colors={['#6C63FF22', '#00D4FF11']} style={voiceStyles.questionCard}>
        <View style={voiceStyles.qHeader}>
          <Text style={voiceStyles.qCounter}>{qIndex + 1} / {PRACTICE_QUESTIONS.length}</Text>
          <TouchableOpacity onPress={nextQuestion} style={voiceStyles.skipBtn}>
            <Text style={voiceStyles.skipText}>Skip →</Text>
          </TouchableOpacity>
        </View>
        <Text style={voiceStyles.question}>{PRACTICE_QUESTIONS[qIndex]}</Text>
      </LinearGradient>

      {/* Record button */}
      <View style={voiceStyles.recordArea}>
        <TouchableOpacity
          onPress={isRecording ? stopRecording : startRecording}
          activeOpacity={0.8}
          disabled={evaluating}
        >
          <LinearGradient
            colors={isRecording ? [Colors.accent, '#FF4444'] : ['#6C63FF', '#00D4FF']}
            style={voiceStyles.recordBtn}
          >
            <Text style={voiceStyles.recordIcon}>{isRecording ? '⏹' : '🎙️'}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={voiceStyles.recordLabel}>
          {evaluating ? 'Evaluating…' : isRecording ? 'Tap to stop' : 'Tap to record your answer'}
        </Text>
        {isRecording && (
          <View style={voiceStyles.liveRow}>
            <View style={voiceStyles.liveDot} />
            <Text style={voiceStyles.liveText}>Recording…</Text>
          </View>
        )}
      </View>

      {/* Transcript */}
      {transcript ? (
        <View style={voiceStyles.transcriptBox}>
          <Text style={voiceStyles.transcriptLabel}>Your Answer (Transcribed)</Text>
          <Text style={voiceStyles.transcriptText}>"{transcript}"</Text>
        </View>
      ) : null}

      {/* Evaluating */}
      {evaluating && (
        <View style={voiceStyles.evalBox}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={voiceStyles.evalText}>AI is evaluating your answer…</Text>
        </View>
      )}

      {/* Results */}
      {result && (
        <View style={voiceStyles.resultCard}>
          <View style={voiceStyles.resultTop}>
            <View style={[voiceStyles.scoreCircle, { borderColor: scoreColor }]}>
              <Text style={[voiceStyles.scoreNum, { color: scoreColor }]}>{result.score}</Text>
            </View>
            <Text style={voiceStyles.resultFeedback}>{result.feedback}</Text>
          </View>
          <Text style={voiceStyles.tipsTitle}>💡 Tips to Improve</Text>
          {result.tips.map(tip => (
            <View key={tip} style={voiceStyles.tipRow}>
              <Text style={voiceStyles.tipDot}>•</Text>
              <Text style={voiceStyles.tipText}>{tip}</Text>
            </View>
          ))}
          <TouchableOpacity style={voiceStyles.nextBtn} onPress={nextQuestion}>
            <Text style={voiceStyles.nextBtnText}>Next Question →</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  )
}

const voiceStyles = StyleSheet.create({
  questionCard:  { borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.primary + '33' },
  qHeader:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  qCounter:      { fontSize: 12, color: Colors.textMuted, fontFamily: Fonts.dmSansRegular },
  skipBtn:       {},
  skipText:      { fontSize: 12, color: Colors.primary, fontFamily: Fonts.dmSansBold },
  question:      { fontSize: 18, color: Colors.textPrimary, fontFamily: Fonts.soraBold, lineHeight: 28 },
  recordArea:    { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md },
  recordBtn:     { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  recordIcon:    { fontSize: 32 },
  recordLabel:   { fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular },
  liveRow:       { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent },
  liveText:      { fontSize: 12, color: Colors.accent, fontFamily: Fonts.dmSansBold },
  transcriptBox: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  transcriptLabel:{ fontSize: 11, color: Colors.textMuted, fontFamily: Fonts.dmSansMedium, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  transcriptText: { fontSize: 13, color: Colors.textPrimary, fontFamily: Fonts.dmSansRegular, lineHeight: 20, fontStyle: 'italic' },
  evalBox:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, justifyContent: 'center', padding: Spacing.md },
  evalText:      { fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular },
  resultCard:    { backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md },
  resultTop:     { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  scoreCircle:   { width: 64, height: 64, borderRadius: 32, borderWidth: 3, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  scoreNum:      { fontSize: 22, fontFamily: Fonts.soraBold },
  resultFeedback:{ flex: 1, fontSize: 13, color: Colors.textPrimary, fontFamily: Fonts.dmSansRegular, lineHeight: 20 },
  tipsTitle:     { fontSize: 14, color: Colors.textPrimary, fontFamily: Fonts.soraSemiBold, marginBottom: Spacing.sm },
  tipRow:        { flexDirection: 'row', gap: 8, marginBottom: 6 },
  tipDot:        { color: Colors.primary, fontFamily: Fonts.dmSansBold },
  tipText:       { flex: 1, fontSize: 12, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular, lineHeight: 18 },
  nextBtn:       { marginTop: Spacing.md, backgroundColor: Colors.primaryLight, borderRadius: Radius.md, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.primary + '44' },
  nextBtnText:   { color: Colors.primary, fontFamily: Fonts.dmSansBold, fontSize: 14 },
})

// ─── AI Question Generator Tab ────────────────────────────────────────────────

const ROLES       = ['Software Engineer', 'Data Analyst', 'Product Manager', 'Designer', 'HR Executive', 'Marketing Manager']
const CATEGORIES  = ['Behavioral', 'Technical', 'HR']

const GenerateTab = () => {
  const [role,       setRole]       = useState(ROLES[0])
  const [category,   setCategory]   = useState(CATEGORIES[0])
  const [questions,  setQuestions]  = useState<GeneratedQuestion[]>([])
  const [generating, setGenerating] = useState(false)

  const generate = async () => {
    setGenerating(true)
    try {
      const qs = await mockGenerateQuestions(role, category)
      setQuestions(qs)
    } finally {
      setGenerating(false)
    }
  }

  const diffColor = (d: string) =>
    d === 'Easy' ? Colors.success : d === 'Medium' ? Colors.warning : Colors.accent

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md, paddingBottom: Spacing.xxl }} showsVerticalScrollIndicator={false}>

      {/* Role picker */}
      <Text style={genStyles.label}>Target Role</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={genStyles.chipScroll}>
        <View style={genStyles.chipRow}>
          {ROLES.map(r => (
            <TouchableOpacity
              key={r}
              style={[genStyles.chip, role === r && genStyles.chipActive]}
              onPress={() => setRole(r)}
            >
              <Text style={[genStyles.chipText, role === r && genStyles.chipTextActive]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Category picker */}
      <Text style={genStyles.label}>Question Category</Text>
      <View style={genStyles.chipRow}>
        {CATEGORIES.map(c => (
          <TouchableOpacity
            key={c}
            style={[genStyles.chip, category === c && genStyles.chipActive]}
            onPress={() => setCategory(c)}
          >
            <Text style={[genStyles.chipText, category === c && genStyles.chipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Generate button */}
      <TouchableOpacity onPress={generate} disabled={generating} activeOpacity={0.85} style={genStyles.genWrap}>
        <LinearGradient
          colors={['#6C63FF', '#00D4FF']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={genStyles.genBtn}
        >
          {generating
            ? <ActivityIndicator color="#fff" />
            : <Text style={genStyles.genBtnText}>✨  Generate Questions</Text>
          }
        </LinearGradient>
      </TouchableOpacity>

      {/* Results */}
      {questions.map((q, i) => (
        <View key={i} style={genStyles.qCard}>
          <View style={genStyles.qTop}>
            <Text style={genStyles.qNum}>Q{i + 1}</Text>
            <View style={[genStyles.diffBadge, { backgroundColor: diffColor(q.difficulty) + '22', borderColor: diffColor(q.difficulty) + '55' }]}>
              <Text style={[genStyles.diffText, { color: diffColor(q.difficulty) }]}>{q.difficulty}</Text>
            </View>
          </View>
          <Text style={genStyles.qText}>{q.question}</Text>
          <View style={genStyles.hintRow}>
            <Text style={genStyles.hintIcon}>💡</Text>
            <Text style={genStyles.hintText}>{q.hint}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  )
}

const genStyles = StyleSheet.create({
  label:         { fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.dmSansMedium, letterSpacing: 0.3 },
  chipScroll:    { marginBottom: -Spacing.sm },
  chipRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:          { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  chipActive:    { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  chipText:      { fontSize: 12, color: Colors.textSecondary, fontFamily: Fonts.dmSansMedium },
  chipTextActive:{ color: Colors.primary, fontFamily: Fonts.dmSansBold },
  genWrap:       { borderRadius: Radius.md, overflow: 'hidden' },
  genBtn:        { height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.md },
  genBtnText:    { color: '#fff', fontFamily: Fonts.soraSemiBold, fontSize: 16 },
  qCard:         { backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md },
  qTop:          { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: Spacing.sm },
  qNum:          { fontSize: 12, color: Colors.textMuted, fontFamily: Fonts.dmSansBold, textTransform: 'uppercase', letterSpacing: 0.5 },
  diffBadge:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1 },
  diffText:      { fontSize: 10, fontFamily: Fonts.dmSansBold, textTransform: 'uppercase' },
  qText:         { fontSize: 15, color: Colors.textPrimary, fontFamily: Fonts.dmSansMedium, lineHeight: 22, marginBottom: Spacing.sm },
  hintRow:       { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  hintIcon:      { fontSize: 12, marginTop: 2 },
  hintText:      { flex: 1, fontSize: 12, color: Colors.textMuted, fontFamily: Fonts.dmSansRegular, lineHeight: 18 },
})

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const AIScreen = () => {
  const [activeTab, setActiveTab] = useState<Tab>('voice')

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>AI Practice</Text>
          <Text style={styles.subtitle}>Voice interview practice & question generator</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {([
            { key: 'voice',    label: '🎙️ Voice Practice' },
            { key: 'generate', label: '✨ AI Generator'   },
          ] as { key: Tab; label: string }[]).map(t => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, activeTab === t.key && styles.tabActive]}
              onPress={() => setActiveTab(t.key)}
            >
              <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'voice'    ? <VoiceTab />    : <GenerateTab />}
        </View>

      </View>
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, backgroundColor: Colors.background },
  header:    {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title:    { fontSize: 24, color: Colors.textPrimary, fontFamily: Fonts.soraBold },
  subtitle: { fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular, marginTop: 2 },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: Radius.sm,
    alignItems: 'center',
  },
  tabActive:     { backgroundColor: Colors.primaryLight },
  tabText:       { fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.dmSansMedium },
  tabTextActive: { color: Colors.primary, fontFamily: Fonts.dmSansBold },
  content:       { flex: 1, paddingHorizontal: Spacing.lg },
})
