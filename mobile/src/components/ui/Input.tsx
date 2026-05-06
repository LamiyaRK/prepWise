import React, { useState } from 'react'
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native'
import { Colors, Fonts, Radius } from '../../constants/theme'

interface Props extends TextInputProps {
  label?: string
  error?: string
}

export const Input = ({ label, error, ...props }: Props) => {
  const [focused, setFocused] = useState(false)

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          focused && styles.focused,
          error ? styles.errorBorder : null
        ]}
        placeholderTextColor={Colors.textMuted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    color: Colors.textSecondary,
    fontFamily: Fonts.dmSansMedium,
    fontSize: 13,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    height: 52,
    paddingHorizontal: 16,
    color: Colors.textPrimary,
    fontFamily: Fonts.dmSansRegular,
    fontSize: 15,
  },
  focused: {
    borderColor: Colors.primary,
  },
  errorBorder: {
    borderColor: Colors.accent,
  },
  error: {
    color: Colors.accent,
    fontFamily: Fonts.dmSansRegular,
    fontSize: 12,
    marginTop: 4,
  }
})