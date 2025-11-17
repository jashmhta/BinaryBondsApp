import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Linking } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Linking.openURL('https://wa.me/1234567890');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.surface, theme.colors.background]}
        style={styles.header}
      >
        <View style={[styles.avatarContainer, { shadowColor: theme.colors.primary }]}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryLight]}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>
              {user?.name.charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
        </View>
        <Text style={[styles.userName, { color: theme.colors.text }]}>
          {user?.name}
        </Text>
        <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
          {user?.email}
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Preferences</Text>
          
          <View style={[styles.settingCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="moon-outline" size={24} color={theme.colors.primary} />
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Dark Mode</Text>
              </View>
              <Switch
                value={theme.isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <View style={[styles.settingCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications-outline" size={24} color={theme.colors.primary} />
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Support</Text>
          
          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={handleContactSupport}
            activeOpacity={0.7}
          >
            <View style={styles.menuRow}>
              <View style={styles.menuInfo}>
                <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                <Text style={[styles.menuLabel, { color: theme.colors.text }]}>Contact Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            activeOpacity={0.7}
          >
            <View style={styles.menuRow}>
              <View style={styles.menuInfo}>
                <Ionicons name="help-circle-outline" size={24} color={theme.colors.primary} />
                <Text style={[styles.menuLabel, { color: theme.colors.text }]}>FAQ</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>About</Text>
          
          <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Version</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>SEBI Compliant</Text>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={[styles.footer, { color: theme.colors.textSecondary }]}>
          Binary Bonds © 2025
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 32, alignItems: 'center' },
  avatarContainer: { shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 20, elevation: 10 },
  avatar: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: '#000' },
  userName: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  userEmail: { fontSize: 14 },
  content: { padding: 20 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  settingCard: { borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingInfo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  settingLabel: { fontSize: 16 },
  menuCard: { borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1 },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  menuInfo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  menuLabel: { fontSize: 16 },
  infoCard: { borderRadius: 12, padding: 16, borderWidth: 1 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: '600' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingVertical: 16, gap: 12, marginTop: 20 },
  logoutText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  footer: { textAlign: 'center', marginTop: 32, marginBottom: 20, fontSize: 12 },
});