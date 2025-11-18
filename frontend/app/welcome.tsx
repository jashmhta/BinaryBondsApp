import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const features = [
  {
    icon: 'shield-checkmark',
    title: 'Secure & Compliant',
    description: 'SEBI compliant platform with bank-grade security',
    color: '#4CAF50',
  },
  {
    icon: 'analytics',
    title: 'Smart Analytics',
    description: 'Real-time portfolio tracking and performance insights',
    color: '#D4AF37',
  },
  {
    icon: 'document-text',
    title: 'Complete Reports',
    description: 'Tax statements, maturity calendar, and detailed reports',
    color: '#2196F3',
  },
  {
    icon: 'notifications',
    title: 'Smart Alerts',
    description: 'Interest payouts, maturity reminders, and rating updates',
    color: '#FF9800',
  },
];

export default function WelcomeScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('hasSeenWelcome', 'true');
    router.replace('/(tabs)');
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasSeenWelcome', 'true');
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.background, theme.colors.surface, theme.colors.background]}
        style={styles.gradient}
      >
        {/* Skip Button */}
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={[styles.skipText, { color: theme.colors.textSecondary }]}>Skip</Text>
        </TouchableOpacity>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            const page = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentPage(page);
          }}
          scrollEventThrottle={16}
        >
          {/* Page 1: Welcome */}
          <View style={[styles.page, { width }]}>
            <Animated.View entering={FadeInUp.delay(200)} style={styles.content}>
              <View style={[styles.orbContainer, { shadowColor: theme.colors.primary }]}>
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primaryLight]}
                  style={styles.orb}
                >
                  <Ionicons name="trending-up" size={64} color="#000" />
                </LinearGradient>
              </View>

              <Text style={[styles.title, { color: theme.colors.text }]}>
                Welcome to Binary Bonds
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                Your trusted partner for smart bond investments
              </Text>
              <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                Track, manage, and grow your bond portfolio with India's most comprehensive bond investment platform.
              </Text>
            </Animated.View>
          </View>

          {/* Page 2: Features */}
          <View style={[styles.page, { width }]}>
            <Animated.View entering={FadeInDown.delay(300)} style={styles.content}>
              <Text style={[styles.title, { color: theme.colors.text }]}>Why Binary Bonds?</Text>
              <View style={styles.featuresGrid}>
                {features.map((feature, index) => (
                  <Animated.View
                    key={index}
                    entering={FadeInUp.delay(400 + index * 100)}
                    style={[
                      styles.featureCard,
                      { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                    ]}
                  >
                    <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                      <Ionicons name={feature.icon as any} size={32} color={feature.color} />
                    </View>
                    <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                      {feature.title}
                    </Text>
                    <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
                      {feature.description}
                    </Text>
                  </Animated.View>
                ))}
              </View>
            </Animated.View>
          </View>

          {/* Page 3: Get Started */}
          <View style={[styles.page, { width }]}>
            <Animated.View entering={FadeInUp.delay(200)} style={styles.content}>
              <View style={[styles.orbContainer, { shadowColor: theme.colors.primary }]}>
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primaryLight]}
                  style={styles.orb}
                >
                  <Ionicons name="rocket" size={64} color="#000" />
                </LinearGradient>
              </View>

              <Text style={[styles.title, { color: theme.colors.text }]}>Ready to Start?</Text>
              <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                Explore your portfolio, track interest payments, download reports, and make informed investment decisions.
              </Text>

              <View style={styles.benefitsList}>
                {[
                  'Track multiple bonds in one place',
                  'Get interest payout alerts',
                  'Download tax-compliant reports',
                  'Monitor maturity schedules',
                  'View credit ratings & updates',
                ].map((benefit, index) => (
                  <Animated.View
                    key={index}
                    entering={FadeInUp.delay(300 + index * 100)}
                    style={styles.benefitItem}
                  >
                    <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
                    <Text style={[styles.benefitText, { color: theme.colors.text }]}>{benefit}</Text>
                  </Animated.View>
                ))}
              </View>
            </Animated.View>
          </View>
        </ScrollView>

        {/* Page Indicators */}
        <View style={styles.indicators}>
          {[0, 1, 2].map((index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                {
                  backgroundColor:
                    currentPage === index ? theme.colors.primary : theme.colors.border,
                  width: currentPage === index ? 32 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Get Started Button */}
        {currentPage === 2 && (
          <Animated.View entering={FadeInUp.delay(500)} style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={handleGetStarted}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={24} color="#000" />
            </TouchableOpacity>
          </Animated.View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  skipButton: { position: 'absolute', top: 60, right: 20, zIndex: 10, padding: 12 },
  skipText: { fontSize: 16, fontWeight: '600' },
  page: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  content: { alignItems: 'center', maxWidth: 400 },
  orbContainer: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 15,
    marginBottom: 32,
  },
  orb: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  subtitle: { fontSize: 18, textAlign: 'center', marginBottom: 12 },
  description: { fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 24 },
  featureCard: {
    width: (width - 60) / 2,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  featureDescription: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  benefitsList: { gap: 16, width: '100%' },
  benefitItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  benefitText: { fontSize: 16, flex: 1 },
  indicators: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 20 },
  indicator: { height: 8, borderRadius: 4, transition: 'all 0.3s' },
  buttonContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 18,
    gap: 12,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
});
