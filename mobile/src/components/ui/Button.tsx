import React from 'react'
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Fonts, Radius } from '../../constants/theme'

interface Props {
  label: string
  onPress: () => void
  loading?: boolean
  variant?: 'primary' | 'outline' | 'ghost'
  style?: ViewStyle
}

export const Button = ({ label, onPress, loading, variant = 'primary', style }: Props) => {
  if (variant === 'primary') {
    return (
      <TouchableOpacity onPress={onPress} disabled={loading} style={style}>
        <LinearGradient
          colors={['#6C63FF', '#00D4FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primary}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.primaryText}>{label}</Text>
          }
        </LinearGradient>
      </TouchableOpacity>
    )
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity onPress={onPress} disabled={loading} style={[styles.outline, style]}>
        {loading
          ? <ActivityIndicator color={Colors.primary} />
          : <Text style={styles.outlineText}>{label}</Text>
        }
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={loading} style={[styles.ghost, style]}>
      <Text style={styles.ghostText}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  primary: {
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#fff',
    fontFamily: Fonts.soraSemiBold,
    fontSize: 16,
  },
  outline: {
    height: 52,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineText: {
    color: Colors.primary,
    fontFamily: Fonts.soraSemiBold,
    fontSize: 16,
  },
  ghost: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.dmSansRegular,
    fontSize: 15,
  }
})