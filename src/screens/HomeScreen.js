import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { FeatureCard } from '../components/FeatureCard';

export const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();

  useEffect(() => {
    // Tự động điều hướng vào List Screen khi đã đăng nhập
    if (user) {
      navigation.replace('List');
    }
  }, [user, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="book" size={22} color="#4F46E5" />
          </View>
          <Text style={styles.headerBrand}>BookShelf</Text>
        </View>

        {!user && (
          <View style={styles.authButtons}>
            <TouchableOpacity
              testID="btn-nav-login"
              style={styles.loginBtn}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginBtnText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="btn-nav-register"
              style={styles.registerBtn}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.registerBtnText}>Register</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>Personal Library Manager</Text>
          </View>

          <Text testID="home-title" style={styles.heroTitle}>
            BookShelf
          </Text>

          <Text style={styles.heroSubtitle}>
            Your ultimate reading companion. Organize, track progress, and curate your favorite book collection seamlessly.
          </Text>

          {!user && (
            <View style={styles.heroCtaRow}>
              <TouchableOpacity
                style={styles.primaryCta}
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={styles.primaryCtaText}>Get Started Free</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Feature Cards Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Key Features</Text>

          <FeatureCard
            icon="library-outline"
            title="Track your books"
            description="Keep a comprehensive catalog of your reading journey. Add titles, authors, genres, and personal reading notes."
          />

          <FeatureCard
            icon="options-outline"
            title="Sort by status"
            description="Manage your workflow across To Read, Reading, and Finished states with dynamic sorting and status breakdowns."
          />

          <FeatureCard
            icon="star-outline"
            title="Rate your favorites"
            description="Highlight beloved books with one-tap favorites and numeric ratings from 0 to 5 for quick rediscovery."
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBrand: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  authButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  loginBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  registerBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
  },
  registerBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 12,
  },
  heroBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 14,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 340,
    marginBottom: 20,
  },
  heroCtaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryCtaText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  featuresSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
});
