import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system'
import { Colors, Fonts, Spacing, Radius } from '../../../constants/theme'
import {
  generateInterviewQuestions,
  transcribeAndEvaluate,
  evaluateAnswer,
  GeminiQuestion,
  SpeechEvaluation,
} from '../../../services/gemini.service'
import {
  saveQuestion,
  unsaveQuestion,
  getSavedQuestions,
  SavedQuestion,
} from '../../../services/savedQuestions.service'

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'generate' | 'voice'

interface QuestionWithSaved extends GeminiQuestion {
  saved?: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'Product Manager',
  'DevOps Engineer',
  'Mobile Developer',
  'UI/UX Designer',
  'QA Engineer',
]

const CATEGORIES = ['Behavioral', 'Technical', 'HR', 'System Design', 'DSA']

const PRACTICE_QUESTIONS = [
  'Tell me about yourself and your background.',
  'What is your greatest technical strength?',
  'Describe a challenging project you worked on.',
  'How do you handle tight deadlines and pressure?',
  'Where do you see yourself in 5 years?',
  'Explain the difference between synchronous and asynchronous programming.',
  'How do you approach debugging a complex issue?',
  'Tell me about a time you disagreed with a teammate.',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const diffColor = (d: string) =>
  d === 'Easy' ? Colors.success : d === 'Medium' ? Colors.warning : Colors.accent

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ─── GenerateTab ──────────────────────────────────────────────────────────────

const GenerateTab = ({ navigation }: { navigation: any }) => {
  const [role, setRole] = useState(ROLES[0])
  const [category, setCategory] = useState(CATEGORIES[0])
  const [count, setCount] = useState(5)
  const [questions, setQuestions] = useState<QuestionWithSaved[]>([])
  const [generating, setGenerating] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [savedCount, setSavedCount] = useState(0)

  // Load saved questions on mount to highlight already-saved ones
  useEffect(() => {
    loadSaved()
  }, [])

  const loadSaved = async () => {
    const saved = await getSavedQuestions()
    setSavedCount(saved.length)
    const texts = new Set(saved.map((q: SavedQuestion) => q.question))
    setSavedIds(texts as Set<string>)
  }

  const generate = async () => {
    setGenerating(true)
    try {
      const qs = await generateInterviewQuestions(role, category, count)
      setQuestions(qs.map(q => ({ ...q, saved: savedIds.has(q.question) })))
    } catch (err: any) {
      Alert.alert(
        'Generation Failed',
        err?.message?.includes('API_KEY')
          ? 'Check your Gemini API key in .env'
          : 'Could not reach Gemini. Check your internet connection.',
      )
    } finally {
      setGenerating(false)
    }
  }

  const generateMore = async () => {
    setLoadingMore(true)
    try {
      const more = await generateInterviewQuestions(role, category, count)
      setQuestions(prev => [
        ...prev,
        ...more.map(q => ({ ...q, saved: savedIds.has(q.question) })),
      ])
    } catch {
      Alert.alert('Error', 'Failed to generate more questions.')
    } finally {
      setLoadingMore(false)
    }
  }

  const toggleSave = async (q: QuestionWithSaved, index: number) => {
    const isSaved = savedIds.has(q.question)
    if (isSaved) {
      // Find and remove
      const all = await getSavedQuestions()
      const match = all.find((s: SavedQuestion) => s.question === q.question)
      if (match) await unsaveQuestion(match.id)
      setSavedIds(prev => {
        const next = new Set(prev)
        next.delete(q.question)
        return next
      })
    } else {
      await saveQuestion({ question: q.question, hint: q.hint, difficulty: q.difficulty, category, role })
      setSavedIds(prev => new Set([...prev, q.question]))
    }
    // Update local list
    setQuestions(prev =>
      prev.map((item, i) => (i === index ? { ...item, saved: !isSaved } : item)),
    )
    const saved = await getSavedQuestions()
    setSavedCount(saved.length)
  }

  return (
    <ScrollView
      contentContainerStyle={genStyles.scroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Saved questions link */}
      {savedCount > 0 && (
        <TouchableOpacity
          style={genStyles.savedLink}
          onPress={() => navigation.navigate('SavedQuestions')}
        >
          <Text style={genStyles.savedLinkText}>⭐ View Saved ({savedCount})</Text>
        </TouchableOpacity>
      )}

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
      <Text style={genStyles.label}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={genStyles.chipScroll}>
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
      </ScrollView>

      {/* Count selector */}
      <Text style={genStyles.label}>Questions per batch</Text>
      <View style={genStyles.chipRow}>
        {[3, 5, 10].map(n => (
          <TouchableOpacity
            key={n}
            style={[genStyles.chip, count === n && genStyles.chipActive]}
            onPress={() => setCount(n)}
          >
            <Text style={[genStyles.chipText, count === n && genStyles.chipTextActive]}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Generate button */}
      <TouchableOpacity
        onPress={generate}
        disabled={generating}
        activeOpacity={0.85}
        style={{ borderRadius: Radius.md, overflow: 'hidden', marginTop: Spacing.sm }}
      >
        <LinearGradient
          colors={['#6C63FF', '#00D4FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={genStyles.genBtn}
        >
          {generating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={genStyles.genBtnText}>✨  Generate Questions</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Count label */}
      {questions.length > 0 && (
        <Text style={genStyles.countLabel}>{questions.length} questions generated</Text>
      )}

      {/* Questions list */}
      {questions.map((q, i) => (
        <View key={`${q.question}-${i}`} style={genStyles.qCard}>
          <View style={genStyles.qTop}>
            <View style={genStyles.qLeft}>
              <Text style={genStyles.qNum}>Q{i + 1}</Text>
              <View
                style={[
                  genStyles.diffBadge,
                  {
                    backgroundColor: diffColor(q.difficulty) + '22',
                    borderColor: diffColor(q.difficulty) + '55',
                  },
                ]}
              >
                <Text style={[genStyles.diffText, { color: diffColor(q.difficulty) }]}>
                  {q.difficulty}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => toggleSave(q, i)} style={genStyles.starBtn}>
              <Text style={genStyles.starIcon}>{savedIds.has(q.question) ? '⭐' : '☆'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={genStyles.qText}>{q.question}</Text>
          <View style={genStyles.hintRow}>
            <Text style={genStyles.hintIcon}>💡</Text>
            <Text style={genStyles.hintText}>{q.hint}</Text>
          </View>
        </View>
      ))}

      {/* Generate More */}
      {questions.length > 0 && (
        <TouchableOpacity
          onPress={generateMore}
          disabled={loadingMore}
          style={genStyles.moreBtn}
          activeOpacity={0.8}
        >
          {loadingMore ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <Text style={genStyles.moreBtnText}>+ Generate {count} More</Text>
          )}
        </TouchableOpacity>
      )}

      {/* Clear All */}
      {questions.length > 0 && (
        <TouchableOpacity onPress={() => setQuestions([])} style={genStyles.clearBtn}>
          <Text style={genStyles.clearBtnText}>Clear All</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  )
}

// ─── VoiceTab ─────────────────────────────────────────────────────────────────

const VoiceTab = () => {
  const [qIndex, setQIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [recording, setRecording] = useState<Audio.Recording | null>(null)
  const [evaluating, setEvaluating] = useState(false)
  const [result, setResult] = useState<SpeechEvaluation | null>(null)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice')
  const [typedAnswer, setTypedAnswer] = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert(
          'Microphone Permission',
          'Microphone access is needed for voice practice. Switching to text mode.',
          [{ text: 'OK', onPress: () => setInputMode('text') }],
        )
        return
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      )
      setRecording(rec)
      setIsRecording(true)
      setRecordSeconds(0)
      setResult(null)

      timerRef.current = setInterval(() => {
        setRecordSeconds(s => s + 1)
      }, 1000)
    } catch (err) {
      Alert.alert('Error', 'Could not start recording. Try text mode instead.')
      setInputMode('text')
    }
  }

  const stopRecording = async () => {
    if (!recording) return

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setIsRecording(false)
    setEvaluating(true)

    try {
      await recording.stopAndUnloadAsync()
      const uri = recording.getURI()
      setRecording(null)

      if (!uri) throw new Error('No recording URI')

      // Read audio as base64
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      })

      // Send to Gemini for transcription + evaluation
      const evalResult = await transcribeAndEvaluate(
        PRACTICE_QUESTIONS[qIndex],
        base64Audio,
        'm4a', // expo records in m4a/aac format
      )

      setResult(evalResult)
    } catch (err: any) {
      Alert.alert(
        'Evaluation Failed',
        err?.message?.includes('audio')
          ? 'Gemini could not process the audio. Try text mode for now.'
          : 'Could not evaluate your answer. Please try again.',
        [{ text: 'OK' }],
      )
    } finally {
      setEvaluating(false)
    }
  }

  const evaluateTyped = async () => {
    if (!typedAnswer.trim()) {
      Alert.alert('Empty Answer', 'Please type your answer before submitting.')
      return
    }
    setEvaluating(true)
    try {
      const evalResult = await evaluateAnswer(PRACTICE_QUESTIONS[qIndex], typedAnswer)
      setResult(evalResult)
    } catch {
      Alert.alert('Error', 'Evaluation failed. Check your internet connection.')
    } finally {
      setEvaluating(false)
    }
  }

  const nextQuestion = () => {
    setQIndex(i => (i + 1) % PRACTICE_QUESTIONS.length)
    setResult(null)
    setTypedAnswer('')
    setRecordSeconds(0)
  }

  const scoreColor = result
    ? result.score >= 80
      ? Colors.success
      : result.score >= 50
        ? Colors.warning
        : Colors.accent
    : Colors.primary

  return (
    <ScrollView
      contentContainerStyle={voiceStyles.scroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Question card */}
      <View style={voiceStyles.questionCard}>
        <View style={voiceStyles.questionHeader}>
          <Text style={voiceStyles.questionLabel}>
            Question {qIndex + 1} of {PRACTICE_QUESTIONS.length}
          </Text>
          <TouchableOpacity onPress={nextQuestion} style={voiceStyles.skipBtn}>
            <Text style={voiceStyles.skipText}>Skip →</Text>
          </TouchableOpacity>
        </View>
        <Text style={voiceStyles.questionText}>{PRACTICE_QUESTIONS[qIndex]}</Text>
      </View>

      {/* Input mode toggle */}
      <View style={voiceStyles.modeToggle}>
        {(['voice', 'text'] as const).map(m => (
          <TouchableOpacity
            key={m}
            style={[voiceStyles.modeBtn, inputMode === m && voiceStyles.modeBtnActive]}
            onPress={() => setInputMode(m)}
          >
            <Text style={[voiceStyles.modeBtnText, inputMode === m && voiceStyles.modeBtnTextActive]}>
              {m === 'voice' ? '🎙️ Voice' : '⌨️ Type'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Voice mode */}
      {inputMode === 'voice' && (
        <View style={voiceStyles.voiceBox}>
          {isRecording && (
            <Text style={voiceStyles.timer}>{formatTime(recordSeconds)}</Text>
          )}
          <TouchableOpacity
            onPress={isRecording ? stopRecording : startRecording}
            disabled={evaluating}
            activeOpacity={0.8}
            style={{ borderRadius: 50, overflow: 'hidden' }}
          >
            <LinearGradient
              colors={isRecording ? ['#FF4B4B', '#FF6B6B'] : ['#6C63FF', '#00D4FF']}
              style={voiceStyles.recordBtn}
            >
              <Text style={voiceStyles.recordIcon}>{isRecording ? '⏹' : '🎙️'}</Text>
              <Text style={voiceStyles.recordLabel}>
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {isRecording && (
            <View style={voiceStyles.recordingIndicator}>
              <View style={voiceStyles.recordingDot} />
              <Text style={voiceStyles.recordingText}>Recording… speak clearly</Text>
            </View>
          )}
        </View>
      )}

      {/* Text mode */}
      {inputMode === 'text' && (
        <View style={voiceStyles.textInputBox}>
          <TextInput
            style={voiceStyles.textAnswer}
            placeholder="Type your answer here..."
            placeholderTextColor={Colors.textMuted}
            value={typedAnswer}
            onChangeText={setTypedAnswer}
            multiline
            numberOfLines={5}
          />
          <TouchableOpacity
            style={[voiceStyles.evalTextBtn, evaluating && { opacity: 0.6 }]}
            onPress={evaluateTyped}
            disabled={evaluating}
          >
            {evaluating ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <Text style={voiceStyles.evalTextBtnText}>Get AI Feedback →</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Evaluating state */}
      {evaluating && (
        <View style={voiceStyles.evaluatingBox}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={voiceStyles.evaluatingText}>
            {inputMode === 'voice'
              ? 'Transcribing and evaluating with Gemini…'
              : 'Evaluating with Gemini AI…'}
          </Text>
        </View>
      )}

      {/* Result */}
      {result && !evaluating && (
        <View style={voiceStyles.resultCard}>
          {/* Score */}
          <View style={voiceStyles.scoreRow}>
            <View
              style={[
                voiceStyles.scoreBadge,
                { backgroundColor: scoreColor + '22', borderColor: scoreColor + '44' },
              ]}
            >
              <Text style={[voiceStyles.scoreNum, { color: scoreColor }]}>{result.score}</Text>
              <Text style={[voiceStyles.scoreLabel, { color: scoreColor }]}>/100</Text>
            </View>
            <Text style={voiceStyles.feedbackText}>{result.feedback}</Text>
          </View>

          {/* Transcript if available */}
          {result.transcript && (
            <View style={voiceStyles.transcriptBox}>
              <Text style={voiceStyles.transcriptLabel}>📝 What you said:</Text>
              <Text style={voiceStyles.transcriptText}>{result.transcript}</Text>
            </View>
          )}

          {/* Tips */}
          <Text style={voiceStyles.tipsLabel}>💡 Tips to improve</Text>
          {result.tips.map((tip, i) => (
            <View key={i} style={voiceStyles.tipRow}>
              <Text style={voiceStyles.tipBullet}>{i + 1}.</Text>
              <Text style={voiceStyles.tipText}>{tip}</Text>
            </View>
          ))}

          {/* Next question */}
          <TouchableOpacity style={voiceStyles.nextBtn} onPress={nextQuestion}>
            <Text style={voiceStyles.nextBtnText}>Next Question →</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const AIScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<Tab>('generate')

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <LinearGradient
        colors={['#6C63FF22', '#00D4FF11']}
        style={styles.headerGrad}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>AI Practice</Text>
            <Text style={styles.subtitle}>Powered by Gemini</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {(['generate', 'voice'] as Tab[]).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'generate' ? '✨ Question Generator' : '🎙️ Voice Practice'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'generate' ? (
          <GenerateTab navigation={navigation} />
        ) : (
          <VoiceTab />
        )}
      </View>
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  headerGrad: { paddingBottom: Spacing.sm },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backIcon: { fontSize: 18, color: Colors.textPrimary },
  title: { fontSize: 22, color: Colors.textPrimary, fontFamily: Fonts.soraBold, textAlign: 'center' },
  subtitle: { fontSize: 12, color: Colors.primary, fontFamily: Fonts.dmSansRegular, textAlign: 'center' },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: Radius.sm, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.primaryLight },
  tabText: { fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.dmSansMedium },
  tabTextActive: { color: Colors.primary, fontFamily: Fonts.dmSansBold },
  content: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
})

const genStyles = StyleSheet.create({
  scroll: { gap: Spacing.md, paddingBottom: Spacing.xxl },
  savedLink: {
    backgroundColor: '#FFD70022',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD70055',
  },
  savedLinkText: { color: '#B8860B', fontFamily: Fonts.dmSansBold, fontSize: 13 },
  label: {
    color: Colors.textSecondary,
    fontFamily: Fonts.dmSansMedium,
    fontSize: 13,
    marginBottom: 4,
  },
  chipScroll: { marginBottom: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  chipText: { fontSize: 12, color: Colors.textSecondary, fontFamily: Fonts.dmSansMedium },
  chipTextActive: { color: Colors.primary, fontFamily: Fonts.dmSansBold },
  genBtn: {
    paddingVertical: 16,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genBtnText: { color: '#fff', fontFamily: Fonts.soraSemiBold, fontSize: 16 },
  countLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: Fonts.dmSansRegular,
    textAlign: 'center',
  },
  qCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  qTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  qLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qNum: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: Fonts.dmSansBold,
    textTransform: 'uppercase',
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  diffText: { fontSize: 10, fontFamily: Fonts.dmSansBold, textTransform: 'uppercase' },
  starBtn: { padding: 4 },
  starIcon: { fontSize: 20 },
  qText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontFamily: Fonts.dmSansMedium,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  hintRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  hintIcon: { fontSize: 13 },
  hintText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Fonts.dmSansRegular,
    lineHeight: 18,
  },
  moreBtn: {
    paddingVertical: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
  },
  moreBtnText: { color: Colors.primary, fontFamily: Fonts.dmSansBold, fontSize: 14 },
  clearBtn: { paddingVertical: 12, alignItems: 'center' },
  clearBtnText: { color: Colors.textMuted, fontFamily: Fonts.dmSansRegular, fontSize: 13 },
})

const voiceStyles = StyleSheet.create({
  scroll: { gap: Spacing.md, paddingBottom: Spacing.xxl },
  questionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  questionLabel: { fontSize: 11, color: Colors.textMuted, fontFamily: Fonts.dmSansBold, textTransform: 'uppercase' },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  skipText: { fontSize: 12, color: Colors.primary, fontFamily: Fonts.dmSansBold },
  questionText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: Fonts.dmSansMedium,
    lineHeight: 24,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  modeBtn: { flex: 1, paddingVertical: 10, borderRadius: Radius.sm, alignItems: 'center' },
  modeBtnActive: { backgroundColor: Colors.primaryLight },
  modeBtnText: { fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.dmSansMedium },
  modeBtnTextActive: { color: Colors.primary, fontFamily: Fonts.dmSansBold },
  voiceBox: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
  timer: {
    fontSize: 32,
    color: Colors.accent,
    fontFamily: Fonts.soraBold,
    letterSpacing: 2,
  },
  recordBtn: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  recordIcon: { fontSize: 36 },
  recordLabel: { fontSize: 11, color: '#fff', fontFamily: Fonts.dmSansBold },
  recordingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  recordingText: { fontSize: 13, color: Colors.accent, fontFamily: Fonts.dmSansMedium },
  textInputBox: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  textAnswer: {
    color: Colors.textPrimary,
    fontFamily: Fonts.dmSansRegular,
    fontSize: 14,
    minHeight: 120,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  evalTextBtn: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  evalTextBtnText: { color: Colors.primary, fontFamily: Fonts.dmSansBold, fontSize: 14 },
  evaluatingBox: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.lg },
  evaluatingText: { fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular, textAlign: 'center' },
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  scoreRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  scoreBadge: {
    width: 72,
    height: 72,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flexShrink: 0,
  },
  scoreNum: { fontSize: 26, fontFamily: Fonts.soraBold },
  scoreLabel: { fontSize: 11, fontFamily: Fonts.dmSansBold },
  feedbackText: { flex: 1, fontSize: 13, color: Colors.textPrimary, fontFamily: Fonts.dmSansRegular, lineHeight: 20 },
  transcriptBox: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary + '33',
    gap: 4,
  },
  transcriptLabel: { fontSize: 11, color: Colors.primary, fontFamily: Fonts.dmSansBold },
  transcriptText: { fontSize: 13, color: Colors.textPrimary, fontFamily: Fonts.dmSansRegular, lineHeight: 20 },
  tipsLabel: { fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.dmSansBold },
  tipRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  tipBullet: { fontSize: 13, color: Colors.primary, fontFamily: Fonts.dmSansBold, width: 16 },
  tipText: { flex: 1, fontSize: 13, color: Colors.textPrimary, fontFamily: Fonts.dmSansRegular, lineHeight: 20 },
  nextBtn: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  nextBtnText: { color: Colors.primary, fontFamily: Fonts.dmSansBold, fontSize: 14 },
})
