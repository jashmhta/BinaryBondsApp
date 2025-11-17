import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-gifted-charts';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL;
const { width } = Dimensions.get('window');

interface DashboardData {
  total_invested: number;
  current_value: number;
  total_interest_earned: number;
  profit_loss: number;
  profit_loss_percentage: number;
  total_bonds: number;
  maturity_upcoming_30days: number;
}

interface ChartData {
  date: string;
  value: number;
}

export default function DashboardScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryRes, chartRes] = await Promise.all([
        axios.get(`${API_URL}/api/dashboard/summary`),
        axios.get(`${API_URL}/api/dashboard/chart`),
      ]);
      setDashboardData(summaryRes.data);
      setChartData(chartRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const prepareChartData = () => {
    return chartData.map((item, index) => ({
      value: item.value / 100000, // Convert to lakhs
      label: index % 2 === 0 ? item.date : '',
      dataPointText: '',
    }));
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchDashboardData} tintColor={theme.colors.primary} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.surface, theme.colors.background]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
              Welcome back,
            </Text>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {user?.name}
            </Text>
          </View>
          <View style={[styles.orbContainer, { shadowColor: theme.colors.primary }]}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryLight]}
              style={styles.orb}
            >
              <Ionicons name="trending-up" size={24} color="#000" />
            </LinearGradient>
          </View>
        </View>
      </LinearGradient>

      {/* Portfolio Value Card */}
      <View style={styles.content}>
        <LinearGradient
          colors={[theme.colors.primary, '#C5A028']}
          style={[styles.valueCard, { shadowColor: theme.colors.primary }]}
        >
          <Text style={styles.valueLabel}>Total Portfolio Value</Text>
          <Text style={styles.valueAmount}>
            {dashboardData ? formatCurrency(dashboardData.current_value) : '₹0'}
          </Text>
          <View style={styles.valueRow}>
            <View style={styles.valueItem}>
              <Ionicons name="arrow-up" size={16} color="#000" />
              <Text style={styles.valueSubtext}>
                {dashboardData ? formatCurrency(dashboardData.profit_loss) : '₹0'}
              </Text>
            </View>
            <Text style={styles.valueDivider}>•</Text>
            <Text style={styles.valueSubtext}>
              {dashboardData ? `${dashboardData.profit_loss_percentage.toFixed(2)}%` : '0%'}
            </Text>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Ionicons name="wallet-outline" size={24} color={theme.colors.primary} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {dashboardData ? formatCurrency(dashboardData.total_invested) : '₹0'}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Total Invested
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Ionicons name="cash-outline" size={24} color={theme.colors.success} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {dashboardData ? formatCurrency(dashboardData.total_interest_earned) : '₹0'}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Interest Earned
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Ionicons name="briefcase-outline" size={24} color={theme.colors.primary} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {dashboardData?.total_bonds || 0}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Total Bonds
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Ionicons name="time-outline" size={24} color={theme.colors.error} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {dashboardData?.maturity_upcoming_30days || 0}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Maturing Soon
            </Text>
          </View>
        </View>

        {/* Chart */}
        {chartData.length > 0 && (
          <View style={[styles.chartCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
              Portfolio Growth
            </Text>
            <View style={styles.chartContainer}>
              <LineChart
                data={prepareChartData()}
                width={width - 80}
                height={200}
                spacing={50}
                color={theme.colors.primary}
                thickness={3}
                startFillColor={theme.colors.primary}
                endFillColor={theme.colors.background}
                startOpacity={0.4}
                endOpacity={0.1}
                initialSpacing={10}
                noOfSections={4}
                yAxisColor={theme.colors.border}
                xAxisColor={theme.colors.border}
                yAxisTextStyle={{ color: theme.colors.textSecondary, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: theme.colors.textSecondary, fontSize: 10 }}
                hideDataPoints={false}
                dataPointsColor={theme.colors.primary}
                dataPointsRadius={4}
                curved
                areaChart
              />
            </View>
            <Text style={[styles.chartSubtext, { color: theme.colors.textSecondary }]}>
              Values in lakhs (₹)
            </Text>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Quick Actions
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            >
              <Ionicons name="add-circle-outline" size={32} color={theme.colors.primary} />
              <Text style={[styles.actionText, { color: theme.colors.text }]}>
                Buy Bond
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            >
              <Ionicons name="document-text-outline" size={32} color={theme.colors.primary} />
              <Text style={[styles.actionText, { color: theme.colors.text }]}>
                Reports
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            >
              <Ionicons name="notifications-outline" size={32} color={theme.colors.primary} />
              <Text style={[styles.actionText, { color: theme.colors.text }]}>
                Alerts
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  orbContainer: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  orb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  valueCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  valueLabel: {
    fontSize: 14,
    color: '#000',
    opacity: 0.8,
    marginBottom: 8,
  },
  valueAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  valueDivider: {
    marginHorizontal: 12,
    color: '#000',
    fontSize: 18,
  },
  valueSubtext: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 56) / 2,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  chartCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  chartSubtext: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  actionsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionText: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
});
