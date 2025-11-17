import React, { useEffect } from 'react';
import { View, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function IndexScreen() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading]);

  return (
    <LinearGradient
      colors={[theme.colors.background, theme.colors.surface]}
      style={styles.container}
    >
      <Image
        source={{ uri: 'https://customer-assets.emergentagent.com/job_c1754347-3918-4dfe-a5e7-7e780303eeac/artifacts/4kclnvfq_cropped-cropped-c772297acc5500801168334cd6e2e5dd.png' }}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 80,
    marginBottom: 30,
  },
  loader: {
    marginTop: 20,
  },
});