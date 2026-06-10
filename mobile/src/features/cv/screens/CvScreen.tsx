import React, { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Alert, Modal,
} from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Fonts, Radius, Spacing } from '../../../constants/theme'
import { analyzeCV, CVFeedback } from '../../../services/gemini.service'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CVFile {
  name: string
  uri:  string
  size: number
  mimeType?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Attempts to extract readable text from the file.
 * - For plain text / simple files: reads directly.
 * - For PDF/Word: reads as base64 and sends to Gemini with the raw bytes —
 *   Gemini can parse PDF content natively.
 * Returns { text, base64, mimeType } so we can send whichever Gemini supports.
 */
const extractFileContent = async (
  file: CVFile,
): Promise<{ text: string; base64: string; mimeType: string }> => {
  const isPDF = file.mimeType === 'application/pdf' || file.name.endsWith('.pdf')
  const isDocx =
    file.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.endsWith('.docx')

  const base64 = await FileSystem.readAsStringAsync(file.uri, {
    encoding: FileSystem.EncodingType.Base64,
  })

  const mimeType = isPDF
    ? 'application/pdf'
    : isDocx
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : 'text/plain'

  // Also try reading as plain text (works for .txt, sometimes .docx)
  let text = ''
  try {
    text = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.UTF8,
    })
    // If it's mostly binary garbage, discard
    const printable = text.replace(/[^\x20-\x7E\n\r\t]/g, '').length
    if (printable / text.length < 0.5) text = ''
  } catch {
    text = ''
  }

  return { text, base64, mimeType }
}

// ─── Score Ring ───────────────────────────────────────────────────────────────

const ScoreRing = ({ score }: { score: number }) => {
  const color = score >= 80 ? Colors.success : score >= 60 ? Colors.warning : Colors.accent
  return (
    <View style={[scoreStyles.ring, { borderColor: color }]}>
      <Text style={[scoreStyles.score, { color }]}>{score}</Text>
      <Text style={scoreStyles.label}>/ 100</Text>
    </View>
  )
}

const scoreStyles = StyleSheet.create({
  ring: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 4, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  score: { fontSize: 26, fontFamily: Fonts.soraBold },
  label: { fontSize: 11, color: Colors.textMuted, fontFamily: Fonts.dmSansRegular },
})

// ─── Screen ───────────────────────────────────────────────────────────────────

export const CvScreen = ({ navigation }: any) => {
  const [cvFile,    setCvFile]    = useState<CVFile | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [feedback,  setFeedback]  = useState<CVFeedback | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  const pickCV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ],
        copyToCacheDirectory: true,
      })
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0]
        setCvFile({
          name:     asset.name,
          uri:      asset.uri,
          size:     asset.size ?? 0,
          mimeType: asset.mimeType,
        })
        setFeedback(null)
      }
    } catch {
      Alert.alert('Error', 'Could not pick file. Please try again.')
    }
  }

  const handleAnalyze = async () => {
    if (!cvFile) return
    setAnalyzing(true)
    setStatusMsg('Reading your CV…')

    try {
      const { text, base64, mimeType } = await extractFileContent(cvFile)

      setStatusMsg('Sending to Gemini AI…')

      let result: CVFeedback

      if (text.trim().length > 100) {
        // We have readable text — send as text prompt (most reliable)
        result = await analyzeCV(text)
      } else {
        // Send as base64 document so Gemini reads the PDF/Word natively
        result = await analyzeCVFromFile(base64, mimeType, cvFile.name)
      }

      setFeedback(result)
      setShowModal(true)
    } catch (err: any) {
      const msg = err?.message ?? ''
      Alert.alert(
        'Analysis Failed',
        msg.includes('API_KEY') || msg.includes('403')
          ? 'Invalid Gemini API key. Check gemini.service.ts.'
          : msg.includes('400')
            ? 'Gemini could not read this file format. Try saving your CV as a .txt or copy-paste the text.'
            : 'Could not analyze CV. Check your internet connection and try again.',
      )
    } finally {
      setAnalyzing(false)
      setStatusMsg('')
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>CV Optimizer</Text>
            <Text style={styles.subtitle}>AI-powered resume feedback</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* Upload area */}
        <TouchableOpacity onPress={pickCV} activeOpacity={0.8} style={{ marginBottom: Spacing.md }}>
          <LinearGradient
            colors={
              cvFile
                ? [Colors.primary + '22', Colors.secondary + '11']
                : [Colors.surface, Colors.surface]
            }
            style={[styles.uploadArea, cvFile && styles.uploadAreaFilled]}
          >
            {cvFile ? (
              <View style={styles.fileInfo}>
                <Text style={styles.fileIcon}>📄</Text>
                <View style={styles.fileMeta}>
                  <Text style={styles.fileName} numberOfLines={1}>{cvFile.name}</Text>
                  <Text style={styles.fileSize}>{formatSize(cvFile.size)}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => { setCvFile(null); setFeedback(null) }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.removeFile}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Text style={styles.uploadIcon}>📎</Text>
                <Text style={styles.uploadTitle}>Tap to upload your CV</Text>
                <Text style={styles.uploadHint}>PDF, Word (.docx), or plain text</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Analyze button */}
        {cvFile && !analyzing && (
          <TouchableOpacity onPress={handleAnalyze} activeOpacity={0.85} style={styles.analyzeWrap}>
            <LinearGradient
              colors={['#6C63FF', '#00D4FF']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.analyzeBtn}
            >
              <Text style={styles.analyzeBtnText}>🤖  Analyze with Gemini AI</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Loading state */}
        {analyzing && (
          <View style={styles.analyzingBox}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={styles.analyzingText}>{statusMsg || 'Analyzing…'}</Text>
            <Text style={styles.analyzingSubtext}>This takes 5–10 seconds</Text>
          </View>
        )}

        {/* Score summary card (shown after analysis) */}
        {feedback && !analyzing && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <ScoreRing score={feedback.score} />
              <View style={styles.summaryInfo}>
                <Text style={styles.summaryTitle}>CV Score</Text>
                <Text style={styles.summaryDesc} numberOfLines={3}>{feedback.summary}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.viewFullBtn} onPress={() => setShowModal(true)}>
              <Text style={styles.viewFullText}>View Full Report →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Best practices */}
        <Text style={styles.sectionTitle}>📝 CV Best Practices</Text>
        {[
          { icon: '✅', tip: 'Keep your CV to 1–2 pages maximum.' },
          { icon: '📊', tip: 'Quantify achievements wherever possible (e.g. "Reduced load time by 40%").' },
          { icon: '🔑', tip: 'Mirror keywords from the job description.' },
          { icon: '🎯', tip: 'Tailor your CV for every application.' },
          { icon: '🔗', tip: 'Include links to GitHub, LinkedIn, and portfolio.' },
        ].map(({ icon, tip }) => (
          <View key={tip} style={styles.tipRow}>
            <Text style={styles.tipIcon}>{icon}</Text>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}

        {/* Resume templates */}
        <Text style={styles.sectionTitle}>📋 Resume Templates</Text>
        <View style={styles.templatesGrid}>
          {['Modern', 'Classic', 'Tech', 'Minimal'].map(name => (
            <TouchableOpacity
              key={name}
              style={styles.templateCard}
              activeOpacity={0.75}
              onPress={() =>
                Alert.alert('Coming Soon', `The ${name} template will be available soon!`)
              }
            >
              <LinearGradient
                colors={[Colors.primary + '22', Colors.secondary + '11']}
                style={styles.templatePreview}
              >
                <Text style={styles.templateIcon}>📄</Text>
              </LinearGradient>
              <Text style={styles.templateName}>{name}</Text>
              <Text style={styles.templateBtn}>Use →</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* Full feedback modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        {feedback && (
          <View style={styles.modal}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>AI Feedback Report</Text>
              <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Score */}
              <View style={styles.scoreRow}>
                <ScoreRing score={feedback.score} />
                <Text style={styles.scoreSummary}>{feedback.summary}</Text>
              </View>

              {/* Strengths */}
              <Text style={styles.feedbackSection}>💪 Strengths</Text>
              {feedback.strengths.map((s, i) => (
                <View key={i} style={styles.feedbackItem}>
                  <Text style={[styles.feedbackDot, { color: Colors.success }]}>●</Text>
                  <Text style={styles.feedbackText}>{s}</Text>
                </View>
              ))}

              {/* Improvements */}
              <Text style={styles.feedbackSection}>🔧 Improvements</Text>
              {feedback.improvements.map((item, i) => (
                <View key={i} style={styles.feedbackItem}>
                  <Text style={[styles.feedbackDot, { color: Colors.warning }]}>●</Text>
                  <Text style={styles.feedbackText}>{item}</Text>
                </View>
              ))}

              {/* Keywords */}
              <Text style={styles.feedbackSection}>🔑 Add These Keywords</Text>
              <View style={styles.keywordsRow}>
                {feedback.keywords.map((k, i) => (
                  <View key={i} style={styles.keyword}>
                    <Text style={styles.keywordText}>{k}</Text>
                  </View>
                ))}
              </View>

              {/* Re-analyze button */}
              <TouchableOpacity
                style={styles.reanalyzeBtn}
                onPress={() => { setShowModal(false); setFeedback(null) }}
              >
                <Text style={styles.reanalyzeBtnText}>Upload Different CV</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  )
}

// ─── analyzeCVFromFile — sends base64 doc directly to Gemini ─────────────────
// Defined outside component to keep it clean.
// Gemini 2.0 Flash supports inline PDF documents.

const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE' // same key as gemini.service.ts
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`

const analyzeCVFromFile = async (
  base64: string,
  mimeType: string,
  fileName: string,
): Promise<CVFeedback> => {
  const body = {
    contents: [
      {
        parts: [
          {
            inline_data: { mime_type: mimeType, data: base64 },
          },
          {
            text: `
You are an expert resume reviewer for tech industry jobs. Analyze the CV/resume document above.
File name: ${fileName}

Return ONLY a valid JSON object with no explanation, no markdown, no code blocks:
{
  "score": <integer 0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>", "<improvement 4>"],
  "keywords": ["<keyword 1>", "<keyword 2>", "<keyword 3>", "<keyword 4>", "<keyword 5>"]
}
`.trim(),
          },
        ],
      },
    ],
    generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
  }

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) throw new Error(`Gemini error ${response.status}`)

  const data = await response.json()
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  const cleaned = raw.replace(/```json[\s\S]*?```/g, (m: string) =>
    m.replace(/```json\n?/, '').replace(/```$/, ''),
  ).replace(/```[\s\S]*?```/g, (m: string) =>
    m.replace(/```\n?/, '').replace(/```$/, ''),
  ).trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]+\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Could not parse CV feedback')
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: Radius.full,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  backIcon: { fontSize: 18, color: Colors.textPrimary },
  title: { fontSize: 22, color: Colors.textPrimary, fontFamily: Fonts.soraBold, textAlign: 'center' },
  subtitle: { fontSize: 12, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular, textAlign: 'center' },

  uploadArea: {
    borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border,
    borderStyle: 'dashed', padding: Spacing.xl,
  },
  uploadAreaFilled: { borderStyle: 'solid', borderColor: Colors.primary },
  uploadPlaceholder: { alignItems: 'center', gap: 8 },
  uploadIcon: { fontSize: 36 },
  uploadTitle: { fontSize: 15, color: Colors.textPrimary, fontFamily: Fonts.soraSemiBold },
  uploadHint: { fontSize: 12, color: Colors.textMuted, fontFamily: Fonts.dmSansRegular },
  fileInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  fileIcon: { fontSize: 32 },
  fileMeta: { flex: 1 },
  fileName: { fontSize: 14, color: Colors.textPrimary, fontFamily: Fonts.dmSansBold },
  fileSize: { fontSize: 11, color: Colors.textMuted, fontFamily: Fonts.dmSansRegular, marginTop: 2 },
  removeFile: { color: Colors.accent, fontSize: 18, padding: 4 },

  analyzeWrap: { borderRadius: Radius.md, overflow: 'hidden', marginBottom: Spacing.lg },
  analyzeBtn: { height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.md },
  analyzeBtnText: { color: '#fff', fontFamily: Fonts.soraSemiBold, fontSize: 16 },

  analyzingBox: { alignItems: 'center', gap: 8, paddingVertical: Spacing.xl },
  analyzingText: { fontSize: 14, color: Colors.textSecondary, fontFamily: Fonts.dmSansMedium },
  analyzingSubtext: { fontSize: 12, color: Colors.textMuted, fontFamily: Fonts.dmSansRegular },

  summaryCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.primary + '44', padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  summaryTop: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  summaryInfo: { flex: 1 },
  summaryTitle: { fontSize: 16, color: Colors.textPrimary, fontFamily: Fonts.soraBold, marginBottom: 4 },
  summaryDesc: { fontSize: 12, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular, lineHeight: 18 },
  viewFullBtn: {
    backgroundColor: Colors.primaryLight, borderRadius: Radius.md,
    padding: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.primary + '44',
  },
  viewFullText: { color: Colors.primary, fontFamily: Fonts.dmSansBold, fontSize: 13 },

  sectionTitle: {
    fontSize: 16, color: Colors.textPrimary, fontFamily: Fonts.soraSemiBold,
    marginBottom: Spacing.md, marginTop: Spacing.sm,
  },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: Spacing.sm },
  tipIcon: { fontSize: 16, width: 24 },
  tipText: { flex: 1, fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular, lineHeight: 20 },

  templatesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  templateCard: {
    width: '47%', backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, alignItems: 'center', gap: 6,
  },
  templatePreview: { width: '100%', height: 80, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  templateIcon: { fontSize: 28 },
  templateName: { fontSize: 13, color: Colors.textPrimary, fontFamily: Fonts.soraSemiBold },
  templateBtn: { fontSize: 12, color: Colors.primary, fontFamily: Fonts.dmSansBold },

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
  scoreRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg, alignItems: 'flex-start' },
  scoreSummary: { flex: 1, fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular, lineHeight: 20 },
  feedbackSection: { fontSize: 15, color: Colors.textPrimary, fontFamily: Fonts.soraSemiBold, marginBottom: Spacing.sm, marginTop: Spacing.md },
  feedbackItem: { flexDirection: 'row', gap: 10, marginBottom: 8, alignItems: 'flex-start' },
  feedbackDot: { fontSize: 10, marginTop: 5 },
  feedbackText: { flex: 1, fontSize: 13, color: Colors.textPrimary, fontFamily: Fonts.dmSansRegular, lineHeight: 20 },
  keywordsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.lg },
  keyword: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight, borderWidth: 1, borderColor: Colors.primary + '44',
  },
  keywordText: { fontSize: 12, color: Colors.primary, fontFamily: Fonts.dmSansBold },
  reanalyzeBtn: {
    paddingVertical: 14, borderRadius: Radius.md, borderWidth: 1,
    borderColor: Colors.border, alignItems: 'center', marginTop: Spacing.sm,
  },
  reanalyzeBtnText: { color: Colors.textSecondary, fontFamily: Fonts.dmSansMedium, fontSize: 14 },
})
