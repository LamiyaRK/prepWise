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

export const RegisterScreen = ({ navigation }: any) => {
  const { register, isLoading } = useAuthStore()
  const [form, setForm] = useState({
    name: '',
    email: '',
    university: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const update = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.name) newErrors.name = 'Name is required'
    if (!form.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email'
    if (!form.password) newErrors.password = 'Password is required'
    else if (form.password.length < 6) newErrors.password = 'Minimum 6 characters'
    if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm password'
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = async () => {
  if (!validate()) return
  try {
    await register(form.name, form.email, form.password, form.university)
  } catch (err: any) {
    console.log('Register error:', JSON.stringify(err?.response?.data))
    console.log('Error message:', err?.message)
    console.log('Error code:', err?.code)
    Alert.alert(
      'Registration Failed',
      err?.response?.data?.error || err?.message || 'Something went wrong'
    )
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
        {/* Gradient Blob */}
        <View style={styles.blobContainer}>
          <LinearGradient
            colors={['#00D4FF33', '#6C63FF22', 'transparent']}
            style={styles.blob}
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <LinearGradient
            colors={['#6C63FF', '#00D4FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoBox}
          >
            <Text style={styles.logoIcon}>⚡</Text>
          </LinearGradient>
          <Text style={styles.appName}>PrepWise</Text>
          <Text style={styles.tagline}>Start your career journey today</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join thousands of job seekers</Text>

          <Input
            label="Full Name"
            placeholder="John Doe"
            value={form.name}
            onChangeText={(v) => update('name', v)}
            error={errors.name}
          />
          <Input
            label="Email"
            placeholder="you@example.com"
            value={form.email}
            onChangeText={(v) => update('email', v)}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          <Input
            label="University (Optional)"
            placeholder="e.g. BUET, DU, BRAC"
            value={form.university}
            onChangeText={(v) => update('university', v)}
          />
          <Input
            label="Password"
            placeholder="••••••••"
            value={form.password}
            onChangeText={(v) => update('password', v)}
            secureTextEntry
            error={errors.password}
          />
          <Input
            label="Confirm Password"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChangeText={(v) => update('confirmPassword', v)}
            secureTextEntry
            error={errors.confirmPassword}
          />

          {/* Terms */}
          <Text style={styles.terms}>
            By creating an account you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>

          <Button
            label="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            style={styles.registerBtn}
          />

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Login Link */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.loginHighlight}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>

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
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 32,
    zIndex: 1,
  },
  backBtn: {
    position: 'absolute',
    left: 0,
    top: 60,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: Colors.textPrimary,
    fontSize: 18,
  },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  logoIcon: {
    fontSize: 24,
  },
  appName: {
    fontSize: 24,
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
    fontSize: 22,
    color: Colors.textPrimary,
    fontFamily: Fonts.soraBold,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: Fonts.dmSansRegular,
    marginBottom: 24,
  },
  terms: {
    color: Colors.textMuted,
    fontFamily: Fonts.dmSansRegular,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 20,
    marginTop: 4,
  },
  termsLink: {
    color: Colors.primary,
    fontFamily: Fonts.dmSansMedium,
  },
  registerBtn: {
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
  loginLink: {
    alignItems: 'center',
  },
  loginText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.dmSansRegular,
    fontSize: 14,
  },
  loginHighlight: {
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