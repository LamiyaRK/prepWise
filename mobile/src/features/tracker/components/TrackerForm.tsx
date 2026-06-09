import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { TrackerEntry, TrackerStatus, TrackerStage } from '../../../services/tracker.service'
import { Colors, Fonts, Radius, Spacing, StatusColors, StageLabels } from '../../../constants/theme'

interface Props {
  visible: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  editEntry?: TrackerEntry | null
}

const STATUSES: TrackerStatus[] = ['APPLIED', 'IN_REVIEW', 'INTERVIEW', 'OFFER', 'REJECTED']
const STAGES: TrackerStage[] = ['RESUME', 'PHONE_SCREEN', 'TECHNICAL', 'HR', 'FINAL']

export const TrackerForm = ({ visible, onClose, onSubmit, editEntry }: Props) => {
  const [form, setForm] = useState({
    companyName: editEntry?.companyName ?? '',
    jobTitle: editEntry?.jobTitle ?? '',
    jobLink: editEntry?.jobLink ?? '',
    status: (editEntry?.status ?? 'APPLIED') as TrackerStatus,
    stage: (editEntry?.stage ?? 'RESUME') as TrackerStage,
    notes: editEntry?.notes ?? '',
  })
  const [loading, setLoading] = useState(false)

  const update = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (!form.companyName.trim()) {
      Alert.alert('Error', 'Company name is required')
      return
    }
    setLoading(true)
    try {
      await onSubmit(form)
      onClose()
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {editEntry ? 'Edit Application' : 'Track New Job'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Input
            label="Company Name *"
            placeholder="e.g. Google, Meta, Pathao"
            value={form.companyName}
            onChangeText={(v) => update('companyName', v)}
          />
          <Input
            label="Job Title"
            placeholder="e.g. Frontend Developer"
            value={form.jobTitle}
            onChangeText={(v) => update('jobTitle', v)}
          />
          <Input
            label="Job Link"
            placeholder="https://..."
            value={form.jobLink}
            onChangeText={(v) => update('jobLink', v)}
            keyboardType="url"
            autoCapitalize="none"
          />

          {/* Status Selector */}
          <Text style={styles.label}>Application Status</Text>
          <View style={styles.optionsRow}>
            {STATUSES.map((status) => {
              const color = StatusColors[status]
              const isSelected = form.status === status
              return (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor: isSelected ? color + '33' : Colors.surface,
                      borderColor: isSelected ? color : Colors.border,
                    }
                  ]}
                  onPress={() => update('status', status)}
                >
                  <Text style={[
                    styles.optionText,
                    { color: isSelected ? color : Colors.textSecondary }
                  ]}>
                    {status.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Stage Selector */}
          <Text style={styles.label}>Current Stage</Text>
          <View style={styles.optionsRow}>
            {STAGES.map((stage) => {
              const isSelected = form.stage === stage
              return (
                <TouchableOpacity
                  key={stage}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor: isSelected ? Colors.primaryLight : Colors.surface,
                      borderColor: isSelected ? Colors.primary : Colors.border,
                    }
                  ]}
                  onPress={() => update('stage', stage)}
                >
                  <Text style={[
                    styles.optionText,
                    { color: isSelected ? Colors.primary : Colors.textSecondary }
                  ]}>
                    {StageLabels[stage]}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          <Input
            label="Notes"
            placeholder="Any additional notes..."
            value={form.notes}
            onChangeText={(v) => update('notes', v)}
            multiline
            numberOfLines={3}
            style={{ height: 80, paddingTop: 12 }}
          />

          <Button
            label={editEntry ? 'Save Changes' : 'Add Application'}
            onPress={handleSubmit}
            loading={loading}
            style={{ marginTop: Spacing.md }}
          />
        </ScrollView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    color: Colors.textPrimary,
    fontFamily: Fonts.soraBold,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  closeText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  label: {
    color: Colors.textSecondary,
    fontFamily: Fonts.dmSansMedium,
    fontSize: 13,
    marginBottom: Spacing.sm,
    letterSpacing: 0.3,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 11,
    fontFamily: Fonts.dmSansBold,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
})