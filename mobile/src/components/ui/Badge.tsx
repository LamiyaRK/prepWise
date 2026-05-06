import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Radius, Fonts } from '../../constants/theme'

interface Props {
  label: string
  color: string
}

export const Badge = ({ label, color }: Props) => {
  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color + '44' }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontFamily: Fonts.dmSansBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  }
})