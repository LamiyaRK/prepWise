import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuthStore } from '../../../store/authStore'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { Colors, Fonts, Spacing } from '../../../constants/theme'

export const LoginScreen = ({ navigation }: any) => {
  const { login, isLoading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {}
    if (!email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email'
    if (!password) newErrors.password = 'Password is required'
    else if (password.length < 6) newErrors.password = 'Minimum 6 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async () => {
    if (!validate()) return
    try {
      await login(email, password)
    } catch (err: any) {
      Alert.alert('Login Failed', err?.response?.data?.error || 'Something went wrong')
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Gradient Blob */}
        <View style={styles.blobContainer}>
          <LinearGradient
            colors={['#6C63FF44', '#00D4FF22', 'transparent']}
            style={styles.blob}
          />
        </View>

        {/* Logo Area */}
        <View style={styles.logoArea}>
          <LinearGradient
            colors={['#6C63FF', '#00D4FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoBox}
          >
            <Text style={styles.logoIcon}>⚡</Text>
          </LinearGradient>
          <TouchableOpacity onLongPress={() => navigation.navigate('ServerSettings')} delayLongPress={1500}>
            <Text style={styles.appName}>PrepWise</Text>
          </TouchableOpacity>
          <Text style={styles.tagline}>Your career intelligence platform</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>

          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
            />

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <Button
              label="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginBtn}
            />
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Register Link */}
          <TouchableOpacity
            style={styles.registerBtn}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerText}>
              Don't have an account?{' '}
              <Text style={styles.registerLink}>Create one</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Tag */}
        <Text style={styles.bottomTag}>
          Built for job seekers. Powered by AI.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  blobContainer: {
    position: 'absolute',
    top: -100,
    left: -100,
    right: -100,
    height: 400,
    zIndex: 0,
  },
  blob: {
    flex: 1,
    borderRadius: 999,
  },
  logoArea: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
    zIndex: 1,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  logoIcon: {
    fontSize: 28,
  },
  appName: {
    fontSize: 28,
    color: Colors.textPrimary,
    fontFamily: Fonts.soraBold,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: Fonts.dmSansRegular,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    color: Colors.textPrimary,
    fontFamily: Fonts.soraBold,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: Fonts.dmSansRegular,
    marginBottom: 28,
  },
  form: {
    gap: 4,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 16,
  },
  forgotText: {
    color: Colors.primary,
    fontFamily: Fonts.dmSansMedium,
    fontSize: 13,
  },
  loginBtn: {
    marginTop: 4,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textMuted,
    fontFamily: Fonts.dmSansRegular,
    fontSize: 13,
  },
  registerBtn: {
    alignItems: 'center',
  },
  registerText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.dmSansRegular,
    fontSize: 14,
  },
  registerLink: {
    color: Colors.primary,
    fontFamily: Fonts.dmSansBold,
  },
  bottomTag: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontFamily: Fonts.dmSansRegular,
    fontSize: 12,
    marginTop: 32,
  }
})