import React from 'react'
import { View, ViewStyle, StyleSheet } from 'react-native'
import { Colors, Radius } from '../../constants/theme'

interface Props {
  children: React.ReactNode
  style?: ViewStyle
}

export const GlassCard = ({ children, style }: Props) => {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  }
})