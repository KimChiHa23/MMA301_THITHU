import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { validateLoginForm } from '../utils/validation';

export const LoginScreen = ({ navigation }) => {
  const { login, user, authError, clearAuthError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Lỗi form nội bộ (chỉ kích hoạt sau khi submit)
  const [errors, setErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    clearAuthError();
    if (user) {
      navigation.replace('List');
    }
  }, [user, navigation]);

  // Tự động xóa lỗi khi trường nhập trở nên hợp lệ sau submit
  const handleEmailChange = (text) => {
    setEmail(text);
    if (authError) clearAuthError();
    if (hasSubmitted) {
      const { errors: newErrors } = validateLoginForm(text, password);
      setErrors((prev) => ({
        ...prev,
        email: newErrors.email || undefined,
      }));
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (authError) clearAuthError();
    if (hasSubmitted) {
      const { errors: newErrors } = validateLoginForm(email, text);
      setErrors((prev) => ({
        ...prev,
        password: newErrors.password || undefined,
      }));
    }
  };

  const handleSubmit = async () => {
    setHasSubmitted(true);
    clearAuthError();

    const { isValid, errors: validationErrors } = validateLoginForm(email, password);
    setErrors(validationErrors);

    if (!isValid) {
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigation.replace('List');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Ionicons name="log-in-outline" size={28} color="#4F46E5" />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your BookShelf account</Text>
          </View>

          {/* Firebase Auth Error Banner */}
          {authError ? (
            <View testID="error-auth" style={styles.errorAuthBanner}>
              <Ionicons name="alert-circle" size={20} color="#DC2626" />
              <Text style={styles.errorAuthText}>{authError}</Text>
            </View>
          ) : null}

          {/* Login Form */}
          <View style={styles.form}>
            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.email ? styles.inputWrapperError : null,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={errors.email ? '#EF4444' : '#64748B'}
                  style={styles.inputIcon}
                />
                <TextInput
                  testID="input-email"
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.password ? styles.inputWrapperError : null,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={errors.password ? '#EF4444' : '#64748B'}
                  style={styles.inputIcon}
                />
                <TextInput
                  testID="input-password"
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              testID="btn-login-submit"
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Switch to Register */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.footerLink}> Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 20,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
  },
  errorAuthBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  errorAuthText: {
    flex: 1,
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '500',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  inputWrapperError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    height: '100%',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F46E5',
  },
});
