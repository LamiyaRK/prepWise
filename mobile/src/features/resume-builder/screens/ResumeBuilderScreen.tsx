import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, ActivityIndicator, Alert,
} from 'react-native'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import { LinearGradient } from 'expo-linear-gradient'
import { resumeService, ResumeData, emptyResumeData, ExperienceEntry, EducationEntry, ProjectEntry } from '../../../services/resume.service'
import { aiToolsService } from '../../../services/aiTools.service'
import { buildResumeHTML } from '../resumeTemplate'
import { Colors, Fonts, Radius, Spacing } from '../../../constants/theme'

const genId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

// ── Small reusable field ────────────────────────────────────────────────────

const Field = ({ label, value, onChangeText, placeholder, multiline = false }: any) => (
  <View style={{ marginBottom: Spacing.md }}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={[styles.fieldInput, multiline && { height: 80, textAlignVertical: 'top', paddingTop: 10 }]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.textMuted}
      multiline={multiline}
    />
  </View>
)

const ImproveBtn = ({ onPress, loading }: { onPress: () => void; loading: boolean }) => (
  <TouchableOpacity onPress={onPress} disabled={loading} style={styles.improveBtn}>
    {loading ? <ActivityIndicator size="small" color={Colors.primary} /> : <Text style={styles.improveBtnText}>✨ Improve with AI</Text>}
  </TouchableOpacity>
)

export const ResumeBuilderScreen = ({ route, navigation }: any) => {
  const resumeId: string | undefined = route.params?.resumeId

  const [title, setTitle] = useState('My Resume')
  const [data, setData] = useState<ResumeData>(emptyResumeData())
  const [loading, setLoading] = useState(!!resumeId)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [improvingKey, setImprovingKey] = useState<string | null>(null)

  useEffect(() => {
    if (!resumeId) return
    resumeService.get(resumeId)
      .then(res => { setTitle(res.data.title); setData(res.data.data) })
      .catch(() => Alert.alert('Error', 'Could not load resume'))
      .finally(() => setLoading(false))
  }, [resumeId])

  const update = (patch: Partial<ResumeData>) => setData(prev => ({ ...prev, ...patch }))

  // ── AI improve helper — works for the summary or any single bullet ───────
  const improve = async (key: string, text: string, context: string, apply: (improved: string) => void) => {
    if (!text?.trim()) {
      Alert.alert('Nothing to improve', 'Write something first, then let AI polish it.')
      return
    }
    setImprovingKey(key)
    try {
      const res = await aiToolsService.improveText(text, context)
      apply(res.data.improved)
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Could not improve text right now')
    } finally {
      setImprovingKey(null)
    }
  }

  // ── Experience ─────────────────────────────────────────────────────────
  const addExperience = () => update({
    experience: [...data.experience, { id: genId(), company: '', role: '', startDate: '', endDate: '', current: false, bullets: [''] }],
  })
  const updateExperience = (id: string, patch: Partial<ExperienceEntry>) =>
    update({ experience: data.experience.map(e => e.id === id ? { ...e, ...patch } : e) })
  const removeExperience = (id: string) => update({ experience: data.experience.filter(e => e.id !== id) })
  const addBullet = (expId: string) =>
    update({ experience: data.experience.map(e => e.id === expId ? { ...e, bullets: [...e.bullets, ''] } : e) })
  const updateBullet = (expId: string, i: number, text: string) =>
    update({ experience: data.experience.map(e => e.id === expId ? { ...e, bullets: e.bullets.map((b, bi) => bi === i ? text : b) } : e) })
  const removeBullet = (expId: string, i: number) =>
    update({ experience: data.experience.map(e => e.id === expId ? { ...e, bullets: e.bullets.filter((_, bi) => bi !== i) } : e) })

  // ── Education ──────────────────────────────────────────────────────────
  const addEducation = () => update({ education: [...data.education, { id: genId(), school: '', degree: '', startDate: '', endDate: '' }] })
  const updateEducation = (id: string, patch: Partial<EducationEntry>) =>
    update({ education: data.education.map(e => e.id === id ? { ...e, ...patch } : e) })
  const removeEducation = (id: string) => update({ education: data.education.filter(e => e.id !== id) })

  // ── Projects ───────────────────────────────────────────────────────────
  const addProject = () => update({ projects: [...data.projects, { id: genId(), name: '', description: '', link: '' }] })
  const updateProject = (id: string, patch: Partial<ProjectEntry>) =>
    update({ projects: data.projects.map(p => p.id === id ? { ...p, ...patch } : p) })
  const removeProject = (id: string) => update({ projects: data.projects.filter(p => p.id !== id) })

  // ── Skills ─────────────────────────────────────────────────────────────
  const [skillDraft, setSkillDraft] = useState('')
  const addSkill = () => {
    const s = skillDraft.trim()
    if (s && !data.skills.includes(s)) update({ skills: [...data.skills, s] })
    setSkillDraft('')
  }
  const removeSkill = (s: string) => update({ skills: data.skills.filter(x => x !== s) })

  // ── Save / Export ──────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!data.fullName.trim()) {
      Alert.alert('Name required', 'Add your full name before saving.')
      return
    }
    setSaving(true)
    try {
      if (resumeId) {
        await resumeService.update(resumeId, title, data)
      } else {
        const res = await resumeService.create(title, data)
        navigation.setParams({ resumeId: res.data.id })
      }
      Alert.alert('Saved', 'Your resume draft has been saved.')
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  const handleExportPDF = async () => {
    if (!data.fullName.trim()) {
      Alert.alert('Name required', 'Add your full name before exporting.')
      return
    }
    setExporting(true)
    try {
      const html = buildResumeHTML(data)
      const { uri } = await Print.printToFileAsync({ html, base64: false })
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: `${data.fullName} - Resume` })
      } else {
        Alert.alert('Exported', `Saved to: ${uri}`)
      }
    } catch (err: any) {
      Alert.alert('Export Failed', 'Could not generate the PDF. Try again.')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}><ActivityIndicator color={Colors.primary} size="large" /></View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Resume title"
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact */}
        <Text style={styles.sectionTitle}>Contact Info</Text>
        <Field label="Full Name" value={data.fullName} onChangeText={(v: string) => update({ fullName: v })} placeholder="Jane Doe" />
        <Field label="Email" value={data.email} onChangeText={(v: string) => update({ email: v })} placeholder="jane@example.com" />
        <Field label="Phone" value={data.phone} onChangeText={(v: string) => update({ phone: v })} placeholder="+880 1XXXXXXXXX" />
        <Field label="Location" value={data.location} onChangeText={(v: string) => update({ location: v })} placeholder="Dhaka, Bangladesh" />
        <Field label="LinkedIn / Portfolio" value={data.linkedin} onChangeText={(v: string) => update({ linkedin: v })} placeholder="linkedin.com/in/janedoe" />

        {/* Summary */}
        <Text style={styles.sectionTitle}>Summary</Text>
        <Field label="" value={data.summary} onChangeText={(v: string) => update({ summary: v })} placeholder="2-3 sentences on who you are and what you're looking for" multiline />
        <ImproveBtn
          loading={improvingKey === 'summary'}
          onPress={() => improve('summary', data.summary, 'professional summary', improved => update({ summary: improved }))}
        />

        {/* Experience */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Experience</Text>
          <TouchableOpacity onPress={addExperience}><Text style={styles.addLink}>+ Add</Text></TouchableOpacity>
        </View>
        {data.experience.map(exp => (
          <View key={exp.id} style={styles.entryCard}>
            <TouchableOpacity onPress={() => removeExperience(exp.id)} style={styles.entryRemove}><Text style={styles.entryRemoveText}>✕</Text></TouchableOpacity>
            <Field label="Company" value={exp.company} onChangeText={(v: string) => updateExperience(exp.id, { company: v })} placeholder="Acme Inc." />
            <Field label="Role" value={exp.role} onChangeText={(v: string) => updateExperience(exp.id, { role: v })} placeholder="Software Engineer" />
            <View style={styles.dateRow}>
              <View style={{ flex: 1 }}><Field label="Start" value={exp.startDate} onChangeText={(v: string) => updateExperience(exp.id, { startDate: v })} placeholder="Jan 2023" /></View>
              <View style={{ flex: 1 }}><Field label="End" value={exp.endDate} onChangeText={(v: string) => updateExperience(exp.id, { endDate: v })} placeholder="Present" /></View>
            </View>
            <Text style={styles.fieldLabel}>Bullet Points</Text>
            {exp.bullets.map((b, i) => (
              <View key={i} style={styles.bulletRow}>
                <TextInput
                  style={[styles.fieldInput, { flex: 1 }]}
                  value={b}
                  onChangeText={(v) => updateBullet(exp.id, i, v)}
                  placeholder="Led migration that reduced load time by 40%"
                  placeholderTextColor={Colors.textMuted}
                  multiline
                />
                <TouchableOpacity onPress={() => removeBullet(exp.id, i)} style={styles.bulletRemove}><Text>✕</Text></TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={() => addBullet(exp.id)}><Text style={styles.addLink}>+ Add bullet</Text></TouchableOpacity>
            {!!exp.bullets.length && (
              <ImproveBtn
                loading={improvingKey === `exp-${exp.id}`}
                onPress={() => improve(`exp-${exp.id}`, exp.bullets.join('. '), 'experience bullet points, one improved sentence per original point separated by newlines', improved => {
                  const lines = improved.split('\n').map(l => l.replace(/^[-•]\s*/, '').trim()).filter(Boolean)
                  updateExperience(exp.id, { bullets: lines.length ? lines : exp.bullets })
                })}
              />
            )}
          </View>
        ))}

        {/* Projects */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Projects</Text>
          <TouchableOpacity onPress={addProject}><Text style={styles.addLink}>+ Add</Text></TouchableOpacity>
        </View>
        {data.projects.map(p => (
          <View key={p.id} style={styles.entryCard}>
            <TouchableOpacity onPress={() => removeProject(p.id)} style={styles.entryRemove}><Text style={styles.entryRemoveText}>✕</Text></TouchableOpacity>
            <Field label="Project Name" value={p.name} onChangeText={(v: string) => updateProject(p.id, { name: v })} placeholder="PrepWise" />
            <Field label="Description" value={p.description} onChangeText={(v: string) => updateProject(p.id, { description: v })} placeholder="What it does and your role" multiline />
            <Field label="Link (optional)" value={p.link} onChangeText={(v: string) => updateProject(p.id, { link: v })} placeholder="github.com/you/project" />
            <ImproveBtn
              loading={improvingKey === `proj-${p.id}`}
              onPress={() => improve(`proj-${p.id}`, p.description, 'project description', improved => updateProject(p.id, { description: improved }))}
            />
          </View>
        ))}

        {/* Education */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Education</Text>
          <TouchableOpacity onPress={addEducation}><Text style={styles.addLink}>+ Add</Text></TouchableOpacity>
        </View>
        {data.education.map(ed => (
          <View key={ed.id} style={styles.entryCard}>
            <TouchableOpacity onPress={() => removeEducation(ed.id)} style={styles.entryRemove}><Text style={styles.entryRemoveText}>✕</Text></TouchableOpacity>
            <Field label="School" value={ed.school} onChangeText={(v: string) => updateEducation(ed.id, { school: v })} placeholder="University name" />
            <Field label="Degree" value={ed.degree} onChangeText={(v: string) => updateEducation(ed.id, { degree: v })} placeholder="B.Sc. in Computer Science" />
            <View style={styles.dateRow}>
              <View style={{ flex: 1 }}><Field label="Start" value={ed.startDate} onChangeText={(v: string) => updateEducation(ed.id, { startDate: v })} placeholder="2021" /></View>
              <View style={{ flex: 1 }}><Field label="End" value={ed.endDate} onChangeText={(v: string) => updateEducation(ed.id, { endDate: v })} placeholder="2025" /></View>
            </View>
          </View>
        ))}

        {/* Skills */}
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.skillInputRow}>
          <TextInput
            style={[styles.fieldInput, { flex: 1 }]}
            value={skillDraft}
            onChangeText={setSkillDraft}
            placeholder="e.g. React, TypeScript"
            placeholderTextColor={Colors.textMuted}
            onSubmitEditing={addSkill}
            returnKeyType="done"
          />
          <TouchableOpacity onPress={addSkill} style={styles.skillAddBtn}><Text style={{ color: '#fff', fontFamily: Fonts.dmSansBold }}>Add</Text></TouchableOpacity>
        </View>
        <View style={styles.skillGrid}>
          {data.skills.map(s => (
            <TouchableOpacity key={s} onPress={() => removeSkill(s)} style={styles.skillChip}>
              <Text style={styles.skillChipText}>{s} ✕</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Actions */}
        <TouchableOpacity onPress={handleSave} disabled={saving} activeOpacity={0.85} style={{ marginTop: Spacing.xl }}>
          <LinearGradient colors={['#6C63FF', '#00D4FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtn}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Save Draft</Text>}
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleExportPDF} disabled={exporting} style={styles.exportBtn}>
          {exporting ? <ActivityIndicator color={Colors.primary} /> : <Text style={styles.exportBtnText}>📄 Export as PDF</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backText: { color: Colors.primary, fontFamily: Fonts.dmSansBold, fontSize: 14, marginBottom: Spacing.sm },
  titleInput: { fontSize: 20, color: Colors.textPrimary, fontFamily: Fonts.soraBold, paddingBottom: Spacing.sm },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  sectionTitle: { fontSize: 16, color: Colors.textPrimary, fontFamily: Fonts.soraSemiBold, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.lg },
  addLink: { color: Colors.primary, fontFamily: Fonts.dmSansBold, fontSize: 13, marginTop: 4, marginBottom: Spacing.sm },
  fieldLabel: { color: Colors.textSecondary, fontFamily: Fonts.dmSansMedium, fontSize: 12, marginBottom: 6 },
  fieldInput: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md,
    minHeight: 46, paddingHorizontal: 14, paddingVertical: 10, color: Colors.textPrimary,
    fontFamily: Fonts.dmSansRegular, fontSize: 14,
  },
  improveBtn: { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: Colors.primaryLight, borderRadius: Radius.full, marginTop: 4, marginBottom: Spacing.md, minHeight: 30, justifyContent: 'center' },
  improveBtnText: { color: Colors.primary, fontFamily: Fonts.dmSansBold, fontSize: 12 },
  dateRow: { flexDirection: 'row', gap: Spacing.sm },
  entryCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, marginBottom: Spacing.md, position: 'relative' },
  entryRemove: { position: 'absolute', top: 10, right: 10, zIndex: 1, padding: 4 },
  entryRemoveText: { color: Colors.textMuted, fontSize: 14 },
  bulletRow: { flexDirection: 'row', gap: 6, marginBottom: 6, alignItems: 'flex-start' },
  bulletRemove: { padding: 10 },
  skillInputRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  skillAddBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  skillGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: { backgroundColor: Colors.primaryLight, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: Colors.primary + '44' },
  skillChipText: { color: Colors.primary, fontFamily: Fonts.dmSansMedium, fontSize: 12 },
  primaryBtn: { height: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontFamily: Fonts.soraSemiBold, fontSize: 16 },
  exportBtn: { height: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm, borderWidth: 1, borderColor: Colors.primary },
  exportBtnText: { color: Colors.primary, fontFamily: Fonts.soraSemiBold, fontSize: 15 },
})
