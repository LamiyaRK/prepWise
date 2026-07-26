import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native'
import { getServerUrl, setServerUrl } from '../../../services/serverConfig'
import { applyServerUrl } from '../../../services/api'
import { Colors, Fonts, Radius, Spacing } from '../../../constants/theme'

export const ServerSettingsScreen = ({ navigation }: any) => {
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getServerUrl().then(setUrl)
  }, [])

  const handleSave = async () => {
    if (!url.trim()) {
      Alert.alert('Empty URL', 'Enter a server address first.')
      return
    }
    setSaving(true)
    try {
      await setServerUrl(url)
      applyServerUrl(url.trim().replace(/\/+$/, ''))
      Alert.alert('Saved', 'Server address updated. Try logging in now.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ])
    } finally {
      setSaving(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Server Settings</Text>
          <Text style={styles.subtitle}>
            Set this to your backend's current address — e.g. http://192.168.1.23:5000/api.
            Find your laptop's IP with `ipconfig` (Windows) on whatever network you're on right now.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="http://192.168.1.23:5000/api"
            placeholderTextColor={Colors.textMuted}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save & Use This Server'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: Spacing.lg },
  back: { color: Colors.primary, fontFamily: Fonts.dmSansBold, fontSize: 14, marginBottom: Spacing.lg },
  title: { fontSize: 22, color: Colors.textPrimary, fontFamily: Fonts.soraBold, marginBottom: Spacing.sm },
  subtitle: { fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.dmSansRegular, lineHeight: 19, marginBottom: Spacing.lg },
  input: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, height: 52, paddingHorizontal: 16,
    color: Colors.textPrimary, fontFamily: Fonts.dmSansRegular, fontSize: 15, marginBottom: Spacing.lg,
  },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    height: 52, alignItems: 'center', justifyContent: 'center',
  },
  saveBtnText: { color: '#fff', fontFamily: Fonts.soraSemiBold, fontSize: 16 },
})
