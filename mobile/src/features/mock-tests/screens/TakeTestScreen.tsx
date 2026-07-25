import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Alert, BackHandler,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { mockTestsService, MockTest, SubmitResult } from '../../../services/mockTests.service'
import { Colors, Fonts, Radius, Spacing } from '../../../constants/theme'

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'intro' | 'quiz' | 'result'

// ─── Timer display ────────────────────────────────────────────────────────────

const Timer = ({ seconds }: { seconds: number }) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
  const secs = (seconds % 60).toString().padStart(2, '0')
  const isUrgent = seconds <= 60
  return (
    <View style={[timerStyles.box, isUrgent && timerStyles.boxUrgent]}>
      <Text style={[timerStyles.text, isUrgent && timerStyles.textUrgent]}>
        ⏱ {mins}:{secs}
      </Text>
    </View>
  )
}
const timerStyles = StyleSheet.create({
  box:       { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  boxUrgent: { backgroundColor: Colors.accent + '22', borderColor: Colors.accent },
  text:      { fontSize: 14, color: Colors.textPrimary, fontFamily: Fonts.soraBold },
  textUrgent:{ color: Colors.accent },
})

// ─── Progress bar ─────────────────────────────────────────────────────────────

const ProgressBar = ({ current, total }: { current: number; total: number }) => (
  <View style={progressStyles.track}>
    <View style={[progressStyles.fill, { width: `${(current / total) * 100}%` as any }]} />
  </View>
)
const progressStyles = StyleSheet.create({
  track: { height: 4, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden' },
  fill:  { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
})

// ─── Screen ───────────────────────────────────────────────────────────────────

export const TakeTestScreen = ({ route, navigation }: any) => {
  const test: MockTest = route.params.test

  const [phase,       setPhase]       = useState<Phase>('intro')
  const [qIndex,      setQIndex]      = useState(0)
  const [answers,     setAnswers]      = useState<string[]>(Array(test.questions.length).fill(''))
  const [timeLeft,    setTimeLeft]    = useState(test.duration * 60)
  const [submitting,  setSubmitting]  = useState(false)
  const [result,      setResult]      = useState<SubmitResult | null>(null)
  const [submitError, setSubmitError] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Timer ──────────────────────────────────────────────────────────────────

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          stopTimer()
          submitAnswers(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
  }, [])

  useEffect(() => {
    return () => stopTimer()
  }, [])

  // ── Back handler during quiz ───────────────────────────────────────────────

  useEffect(() => {
    if (phase !== 'quiz') return
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert('Exit Test?', 'Your progress will be lost.', [
        { text: 'Stay', style: 'cancel' },
        { text: 'Exit',  style: 'destructive', onPress: () => { stopTimer(); navigation.goBack() } },
      ])
      return true
    })
    return () => handler.remove()
  }, [phase])

  // ── Helpers ────────────────────────────────────────────────────────────────

  const startQuiz = () => {
    setPhase('quiz')
    startTimer()
  }

  const selectAnswer = (option: string) => {
    setAnswers(prev => {
      const next = [...prev]
      next[qIndex] = option
      return next
    })
  }

  const submitAnswers = async (auto = false) => {
    stopTimer()
    if (!auto) {
      const unanswered = answers.filter(a => !a).length
      if (unanswered > 0) {
        const proceed = await new Promise<boolean>(resolve =>
          Alert.alert(
            `${unanswered} Unanswered`,
            'You have unanswered questions. Submit anyway?',
            [
              { text: 'Go Back', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Submit',  onPress: () => resolve(true) },
            ]
          )
        )
        if (!proceed) {
          startTimer()
          return
        }
      }
    }
    setSubmitting(true)
    setSubmitError(false)
    try {
      // Scoring and correct answers live server-side only — the client
      // never has the answer key before this point, so there is no local
      // fallback to compute a score from.
      const res = await mockTestsService.submit(test.id, answers)
      setResult(res.data)
      setPhase('result')
    } catch {
      setSubmitError(true)
      Alert.alert(
        'Submission Failed',
        'We could not reach the server to grade your test. Check your connection and try again — your answers are still saved.',
        [{ text: 'Retry', onPress: () => submitAnswers(auto) }],
      )
    } finally {
      setSubmitting(false)
    }
  }

  const currentQ = test.questions[qIndex]
  const answered  = answers.filter(Boolean).length

  // ─────────────────────────────────────────────────────────────────────────
  // INTRO PHASE
  // ─────────────────────────────────────────────────────────────────────────

  if (phase === 'intro') {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.introContent}>
          <LinearGradient colors={['#6C63FF22', '#00D4FF11']} style={styles.introIcon}>
            <Text style={styles.introEmoji}>📝</Text>
          </LinearGradient>
          <Text style={styles.introTitle}>{test.title}</Text>
          <Text style={styles.introCategory}>{test.category}</Text>

          <View style={styles.introStats}>
            {[
              { icon: '❓', label: 'Questions', value: `${test.questions.length}` },
              { icon: '⏱', label: 'Duration',  value: `${test.duration} min`    },
              { icon: '🏆', label: 'Passing',   value: '60%'                      },
            ].map(s => (
              <View key={s.label} style={styles.introStat}>
                <Text style={styles.introStatIcon}>{s.icon}</Text>
                <Text style={styles.introStatValue}>{s.value}</Text>
                <Text style={styles.introStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.introRules}>
            <Text style={styles.introRulesTitle}>Rules</Text>
            {[
              'Timer starts as soon as you begin.',
              'All questions are multiple choice.',
              'You can change answers before submitting.',
              'Test auto-submits when time runs out.',
            ].map(r => (
              <View key={r} style={styles.introRule}>
                <Text style={styles.introRuleDot}>•</Text>
                <Text style={styles.introRuleText}>{r}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={startQuiz} activeOpacity={0.85} style={styles.startWrap}>
            <LinearGradient colors={['#6C63FF', '#00D4FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startBtn}>
              <Text style={styles.startBtnText}>Start Test →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // QUIZ PHASE
  // ─────────────────────────────────────────────────────────────────────────

  if (phase === 'quiz') {
    return (
      <SafeAreaView style={styles.safe}>
        {/* Top bar */}
        <View style={styles.quizTopBar}>
          <Text style={styles.quizProgress}>{qIndex + 1} / {test.questions.length}</Text>
          <Timer seconds={timeLeft} />
          <Text style={styles.quizAnswered}>{answered} done</Text>
        </View>

        <ProgressBar current={qIndex + 1} total={test.questions.length} />

        <ScrollView contentContainerStyle={styles.quizContent} showsVerticalScrollIndicator={false}>

          {/* Question */}
          <Text style={styles.questionText}>{currentQ.question}</Text>

          {/* Options */}
          <View style={styles.optionsGroup}>
            {currentQ.options.map((opt, i) => {
              const selected = answers[qIndex] === opt
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.optionBtn, selected && styles.optionBtnSelected]}
                  onPress={() => selectAnswer(opt)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.optionLetter, selected && styles.optionLetterSelected]}>
                    <Text style={[styles.optionLetterText, selected && styles.optionLetterTextSelected]}>
                      {String.fromCharCode(65 + i)}
                    </Text>
                  </View>
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{opt}</Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Nav buttons */}
          <View style={styles.navRow}>
            <TouchableOpacity
              style={[styles.navBtn, qIndex === 0 && styles.navBtnDisabled]}
              onPress={() => setQIndex(i => i - 1)}
              disabled={qIndex === 0}
            >
              <Text style={styles.navBtnText}>← Prev</Text>
            </TouchableOpacity>

            {qIndex < test.questions.length - 1 ? (
              <TouchableOpacity
                style={styles.navBtnNext}
                onPress={() => setQIndex(i => i + 1)}
              >
                <Text style={styles.navBtnNextText}>Next →</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.navBtnNext, styles.submitBtn]}
                onPress={() => submitAnswers(false)}
                disabled={submitting}
              >
                <Text style={styles.navBtnNextText}>
                  {submitting ? 'Submitting…' : 'Submit ✓'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Question dots */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dotsScroll}>
            <View style={styles.dots}>
              {test.questions.map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setQIndex(i)}>
                  <View style={[
                    styles.dot,
                    i === qIndex && styles.dotCurrent,
                    answers[i]   && styles.dotAnswered,
                  ]} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </ScrollView>
      </SafeAreaView>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RESULT PHASE
  // ─────────────────────────────────────────────────────────────────────────

  if (phase === 'result' && result) {
    const passed     = result.percentage >= 60
    const scoreColor = result.percentage >= 80 ? Colors.success : result.percentage >= 60 ? Colors.warning : Colors.accent

    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.resultContent} showsVerticalScrollIndicator={false}>

          <LinearGradient
            colors={passed ? ['#00E09622', '#00D4FF11'] : ['#FF6B6B22', '#FF444411']}
            style={styles.resultHero}
          >
            <Text style={styles.resultEmoji}>{passed ? '🏆' : '💪'}</Text>
            <Text style={styles.resultTitle}>{passed ? 'Well done!' : 'Keep Practising!'}</Text>
          </LinearGradient>

          {/* Score circle */}
          <View style={styles.resultScoreWrap}>
            <View style={[styles.resultScoreCircle, { borderColor: scoreColor }]}>
              <Text style={[styles.resultScoreNum, { color: scoreColor }]}>{result.percentage}%</Text>
              <Text style={styles.resultScoreLabel}>{result.score}/{result.total} correct</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.resultStats}>
            {[
              { label: 'Correct',   value: result.score,               color: Colors.success },
              { label: 'Wrong',     value: result.total - result.score, color: Colors.accent  },
              { label: 'Score',     value: `${result.percentage}%`,    color: scoreColor     },
            ].map(s => (
              <View key={s.label} style={styles.resultStat}>
                <Text style={[styles.resultStatValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.resultStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Review answers — correct answers only exist here, in the
              server's post-submission response */}
          <Text style={styles.reviewTitle}>Answer Review</Text>
          {result.review.map((item, i) => (
            <View
              key={item.questionId}
              style={[styles.reviewCard, item.isCorrect ? styles.reviewCorrect : styles.reviewWrong]}
            >
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewQNum}>Q{i + 1}</Text>
                <Text style={styles.reviewIcon}>{item.isCorrect ? '✅' : '❌'}</Text>
              </View>
              <Text style={styles.reviewQuestion}>{item.question}</Text>
              {!item.isCorrect && item.userAnswer && (
                <Text style={[styles.reviewAnswer, { color: Colors.accent }]}>Your answer: {item.userAnswer}</Text>
              )}
              <Text style={[styles.reviewAnswer, { color: Colors.success }]}>Correct: {item.correctAnswer}</Text>
            </View>
          ))}

          {/* Actions */}
          <View style={styles.resultActions}>
            <TouchableOpacity style={styles.retryBtn} onPress={() => {
              setAnswers(Array(test.questions.length).fill(''))
              setQIndex(0)
              setTimeLeft(test.duration * 60)
              setResult(null)
              setPhase('intro')
            }}>
              <Text style={styles.retryBtnText}>Retry Test</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.85} style={styles.doneWrap}>
              <LinearGradient colors={['#6C63FF', '#00D4FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.doneBtn}>
                <Text style={styles.doneBtnText}>Done ✓</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  return null
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.background },
  backBtn: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  backText:{ color: Colors.primary, fontFamily: Fonts.dmSansBold, fontSize: 14 },

  // Intro
  introContent: { padding: Spacing.lg, alignItems: 'center', paddingBottom: Spacing.xxl },
  introIcon:    { width: 80, height: 80, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  introEmoji:   { fontSize: 36 },
  introTitle:   { fontSize: 24, color: Colors.textPrimary, fontFamily: Fonts.soraBold, textAlign: 'center', marginBottom: 4 },
  introCategory:{ fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular, marginBottom: Spacing.lg },
  introStats:   { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg, width: '100%', justifyContent: 'center' },
  introStat:    { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, alignItems: 'center', gap: 4 },
  introStatIcon:{ fontSize: 20 },
  introStatValue:{ fontSize: 18, color: Colors.textPrimary, fontFamily: Fonts.soraBold },
  introStatLabel:{ fontSize: 11, color: Colors.textMuted, fontFamily: Fonts.dmSansRegular },
  introRules:   { width: '100%', backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, marginBottom: Spacing.lg },
  introRulesTitle:{ fontSize: 14, color: Colors.textPrimary, fontFamily: Fonts.soraSemiBold, marginBottom: Spacing.sm },
  introRule:    { flexDirection: 'row', gap: 8, marginBottom: 6 },
  introRuleDot: { color: Colors.primary, fontFamily: Fonts.dmSansBold },
  introRuleText:{ flex: 1, fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular, lineHeight: 20 },
  startWrap:    { width: '100%', borderRadius: Radius.md, overflow: 'hidden' },
  startBtn:     { height: 54, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.md },
  startBtnText: { color: '#fff', fontFamily: Fonts.soraSemiBold, fontSize: 16 },

  // Quiz
  quizTopBar:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  quizProgress: { fontSize: 13, color: Colors.textMuted, fontFamily: Fonts.dmSansMedium },
  quizAnswered: { fontSize: 13, color: Colors.textMuted, fontFamily: Fonts.dmSansMedium },
  quizContent:  { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  questionText: { fontSize: 18, color: Colors.textPrimary, fontFamily: Fonts.soraSemiBold, lineHeight: 28, marginVertical: Spacing.lg },
  optionsGroup: { gap: Spacing.sm, marginBottom: Spacing.lg },
  optionBtn:    { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md },
  optionBtnSelected: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  optionLetter: { width: 32, height: 32, borderRadius: Radius.full, backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  optionLetterSelected: { backgroundColor: Colors.primary },
  optionLetterText:     { fontSize: 13, fontFamily: Fonts.soraBold, color: Colors.textSecondary },
  optionLetterTextSelected: { color: '#fff' },
  optionText:   { flex: 1, fontSize: 14, color: Colors.textPrimary, fontFamily: Fonts.dmSansRegular, lineHeight: 20 },
  optionTextSelected: { color: Colors.primary, fontFamily: Fonts.dmSansMedium },
  navRow:       { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  navBtn:       { flex: 1, paddingVertical: 14, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText:   { fontSize: 14, color: Colors.textSecondary, fontFamily: Fonts.dmSansBold },
  navBtnNext:   { flex: 1, paddingVertical: 14, borderRadius: Radius.md, backgroundColor: Colors.primaryLight, borderWidth: 1, borderColor: Colors.primary, alignItems: 'center' },
  submitBtn:    { backgroundColor: Colors.success + '22', borderColor: Colors.success },
  navBtnNextText: { fontSize: 14, color: Colors.primary, fontFamily: Fonts.dmSansBold },
  dotsScroll:   { marginTop: Spacing.sm },
  dots:         { flexDirection: 'row', gap: 6, paddingVertical: 4 },
  dot:          { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.border },
  dotCurrent:   { backgroundColor: Colors.primary, width: 20 },
  dotAnswered:  { backgroundColor: Colors.success },

  // Result
  resultContent:     { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  resultHero:        { borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.lg },
  resultEmoji:       { fontSize: 48, marginBottom: Spacing.sm },
  resultTitle:       { fontSize: 24, color: Colors.textPrimary, fontFamily: Fonts.soraBold },
  resultScoreWrap:   { alignItems: 'center', marginBottom: Spacing.lg },
  resultScoreCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface },
  resultScoreNum:    { fontSize: 28, fontFamily: Fonts.soraBold },
  resultScoreLabel:  { fontSize: 11, color: Colors.textMuted, fontFamily: Fonts.dmSansRegular },
  resultStats:       { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  resultStat:        { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, alignItems: 'center' },
  resultStatValue:   { fontSize: 22, fontFamily: Fonts.soraBold, marginBottom: 2 },
  resultStatLabel:   { fontSize: 11, color: Colors.textMuted, fontFamily: Fonts.dmSansRegular },
  reviewTitle:       { fontSize: 16, color: Colors.textPrimary, fontFamily: Fonts.soraSemiBold, marginBottom: Spacing.md },
  reviewCard:        { borderRadius: Radius.md, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm },
  reviewCorrect:     { backgroundColor: Colors.success + '11', borderColor: Colors.success + '44' },
  reviewWrong:       { backgroundColor: Colors.accent + '11', borderColor: Colors.accent + '44' },
  reviewHeader:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  reviewQNum:        { fontSize: 11, color: Colors.textMuted, fontFamily: Fonts.dmSansBold, textTransform: 'uppercase' },
  reviewIcon:        { fontSize: 14 },
  reviewQuestion:    { fontSize: 13, color: Colors.textPrimary, fontFamily: Fonts.dmSansMedium, lineHeight: 18, marginBottom: 6 },
  reviewAnswer:      { fontSize: 12, fontFamily: Fonts.dmSansRegular, lineHeight: 18 },
  resultActions:     { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
  retryBtn:          { flex: 1, paddingVertical: 14, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  retryBtnText:      { fontSize: 14, color: Colors.textSecondary, fontFamily: Fonts.dmSansBold },
  doneWrap:          { flex: 1, borderRadius: Radius.md, overflow: 'hidden' },
  doneBtn:           { height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.md },
  doneBtnText:       { color: '#fff', fontFamily: Fonts.soraSemiBold, fontSize: 16 },
})
