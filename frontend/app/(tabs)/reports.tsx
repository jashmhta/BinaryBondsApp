import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';
import { format } from 'date-fns';

const API_URL = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL;

interface MaturityItem {
  bond_name: string;
  isin: string;
  maturity_date: string;
  days_remaining: number;
  maturity_amount: number;
}

export default function ReportsScreen() {
  const { theme } = useTheme();
  const [maturityCalendar, setMaturityCalendar] = useState<MaturityItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMaturityCalendar();
  }, []);

  const fetchMaturityCalendar = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/reports/maturity-calendar`);
      setMaturityCalendar(response.data);
    } catch (error) {
      console.error('Error fetching maturity calendar:', error);
    }
  };

  const downloadReport = async (reportType: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/reports/${reportType}`, {
        responseType: 'blob'
      });
      Alert.alert('Success', 'Report downloaded successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to download report');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const reports = [
    { id: 'portfolio-summary', title: 'Portfolio Summary', icon: 'briefcase-outline', description: 'Complete portfolio overview with all holdings' },
    { id: 'interest-statement', title: 'Interest Statement', icon: 'cash-outline', description: 'Detailed interest earnings report' },
    { id: 'capital-gains', title: 'Capital Gains Report', icon: 'trending-up-outline', description: 'Tax year capital gains and losses' },
    { id: 'maturity-calendar', title: 'Maturity Calendar', icon: 'calendar-outline', description: 'Upcoming bond maturities schedule' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Reports</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>Download & view reports</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Available Reports</Text>
        
        {reports.map((report) => (
          <TouchableOpacity
            key={report.id}
            style={[styles.reportCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={() => downloadReport(report.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
              <Ionicons name={report.icon as any} size={28} color={theme.colors.primary} />
            </View>
            <View style={styles.reportInfo}>
              <Text style={[styles.reportTitle, { color: theme.colors.text }]}>{report.title}</Text>
              <Text style={[styles.reportDescription, { color: theme.colors.textSecondary }]}>
                {report.description}
              </Text>
            </View>
            <Ionicons name="download-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 32 }]}>Maturity Calendar</Text>
        
        {maturityCalendar.length > 0 ? (
          maturityCalendar.slice(0, 5).map((item, index) => (
            <View
              key={index}
              style={[styles.maturityCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            >
              <View style={styles.maturityHeader}>
                <Text style={[styles.maturityBondName, { color: theme.colors.text }]} numberOfLines={1}>
                  {item.bond_name}
                </Text>
                <View style={[styles.daysBadge, { backgroundColor: item.days_remaining < 90 ? theme.colors.error + '20' : theme.colors.primary + '20' }]}>
                  <Text style={[styles.daysText, { color: item.days_remaining < 90 ? theme.colors.error : theme.colors.primary }]}>
                    {item.days_remaining} days
                  </Text>
                </View>
              </View>
              <View style={styles.maturityDetails}>
                <View style={styles.maturityRow}>
                  <Text style={[styles.maturityLabel, { color: theme.colors.textSecondary }]}>Maturity Date</Text>
                  <Text style={[styles.maturityValue, { color: theme.colors.text }]}>
                    {format(new Date(item.maturity_date), 'dd MMM yyyy')}
                  </Text>
                </View>
                <View style={styles.maturityRow}>
                  <Text style={[styles.maturityLabel, { color: theme.colors.textSecondary }]}>Maturity Amount</Text>
                  <Text style={[styles.maturityValue, { color: theme.colors.text, fontWeight: 'bold' }]}>
                    {formatCurrency(item.maturity_amount)}
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No upcoming maturities</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  headerSubtitle: { fontSize: 14 },
  content: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  reportCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  iconContainer: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  reportInfo: { flex: 1 },
  reportTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  reportDescription: { fontSize: 13 },
  maturityCard: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  maturityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  maturityBondName: { flex: 1, fontSize: 15, fontWeight: 'bold', marginRight: 12 },
  daysBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  daysText: { fontSize: 12, fontWeight: 'bold' },
  maturityDetails: { gap: 8 },
  maturityRow: { flexDirection: 'row', justifyContent: 'space-between' },
  maturityLabel: { fontSize: 13 },
  maturityValue: { fontSize: 13 },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14 },
});