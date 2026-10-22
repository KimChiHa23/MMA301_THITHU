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
import { validateRegisterForm } from '../utils/validation';

export const RegisterScreen = ({ navigation }) => {
  const { register, authError, clearAuthError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Lỗi form nội bộ (chỉ kích hoạt sau khi submit)
  const [errors, setErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    clearAuthError();
  }, []);

  const handleEmailChange = (text) => {
    setEmail(text);
    if (authError) clearAuthError();
    if (hasSubmitted) {
      const { errors: newErrors } = validateRegisterForm(text, password, confirmPassword);
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
      const { errors: newErrors } = validateRegisterForm(email, text, confirmPassword);
      setErrors((prev) => ({
        ...prev,
        password: newErrors.password || undefined,
        confirmPassword: newErrors.confirmPassword || undefined,
      }));
    }
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    if (authError) clearAuthError();
    if (hasSubmitted) {
      const { errors: newErrors } = validateRegisterForm(email, password, text);
      setErrors((prev) => ({
        ...prev,
        confirmPassword: newErrors.confirmPassword || undefined,
      }));
    }
  };

  const handleSubmit = async () => {
    setHasSubmitted(true);
    clearAuthError();
    setSuccessMessage('');

    const { isValid, errors: validationErrors } = validateRegisterForm(
      email,
      password,
      confirmPassword
    );
    setErrors(validationErrors);

    if (!isValid) {
      return;
    }

    setLoading(true);
    const result = await register(email, password);
    setLoading(false);

    if (result.success) {
      setSuccessMessage('Registration successful');
      // Tự động chuyển trang sau 2.5s để user kịp nhìn thấy thông báo thành công
      setTimeout(() => {
        navigation.replace('List');
      }, 2500);
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
              <Ionicons name="person-add-outline" size={28} color="#4F46E5" />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join BookShelf to manage your library</Text>
          </View>

          {/* Registration Success Banner */}
          {successMessage ? (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={24} color="#15803D" />
              <View style={styles.successTextContainer}>
                <Text testID="form-success" style={styles.successText}>
                  Registration successful
                </Text>
                <Text style={styles.successVietnameseText}>
                  Đăng ký thành công! Đang chuyển hướng...
                </Text>
              </View>
            </View>
          ) : null}

          {/* Firebase Auth Error Banner */}
          {authError ? (
            <View testID="error-auth" style={styles.errorAuthBanner}>
              <Ionicons name="alert-circle" size={20} color="#DC2626" />
              <Text style={styles.errorAuthText}>{authError}</Text>
            </View>
          ) : null}

          {/* Register Form */}
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
                  placeholder="At least 6 characters"
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

            {/* Confirm Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.confirmPassword ? styles.inputWrapperError : null,
                ]}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={errors.confirmPassword ? '#EF4444' : '#64748B'}
                  style={styles.inputIcon}
                />
                <TextInput
                  testID="input-confirm-password"
                  style={styles.input}
                  placeholder="Re-enter your password"
                  placeholderTextColor="#94A3B8"
                  value={confirmPassword}
                  onChangeText={handleConfirmPasswordChange}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              ) : null}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              testID="btn-register-submit"
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Switch to Login */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.footerLink}> Sign In</Text>
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
    marginBottom: 24,
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
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  successTextContainer: {
    flex: 1,
  },
  successText: {
    fontSize: 15,
    color: '#15803D',
    fontWeight: '700',
  },
  successVietnameseText: {
    fontSize: 13,
    color: '#166534',
    marginTop: 3,
    fontWeight: '500',
  },
  errorAuthBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
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
    marginBottom: 16,
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
