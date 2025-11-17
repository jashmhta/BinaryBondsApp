import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL;

interface Bond {
  id: string;
  isin: string;
  name: string;
  bond_type: string;
  issuer: string;
  coupon_rate: number;
  maturity_date: string;
}

interface UserBond {
  id: string;
  bond: Bond;
  quantity: number;
  current_value: number;
  invested_amount: number;
  profit_loss: number;
  profit_loss_percentage: number;
}

export default function PortfolioScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [bonds, setBonds] = useState<UserBond[]>([]);
  const [filteredBonds, setFilteredBonds] = useState<UserBond[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPortfolio();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = bonds.filter(
        (item) =>
          item.bond.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.bond.isin.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBonds(filtered);
    } else {
      setFilteredBonds(bonds);
    }
  }, [searchQuery, bonds]);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/portfolio/list`);
      setBonds(response.data);
      setFilteredBonds(response.data);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const getBondTypeColor = (type: string) => {
    switch (type) {
      case 'G-Sec':
        return '#4CAF50';
      case 'Corporate':
        return '#2196F3';
      case 'SDL':
        return '#FF9800';
      case 'Tax-Free':
        return '#9C27B0';
      default:
        return theme.colors.primary;
    }
  };

  const renderBondCard = ({ item }: { item: UserBond }) => (
    <TouchableOpacity
      onPress={() => router.push(`/bond/${item.bond.id}`)}
      activeOpacity={0.7}
    >
      <View style={[styles.bondCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={styles.bondHeader}>
          <View style={styles.bondInfo}>
            <Text style={[styles.bondName, { color: theme.colors.text }]} numberOfLines={2}>
              {item.bond.name}
            </Text>
            <Text style={[styles.bondIsin, { color: theme.colors.textSecondary }]}>
              {item.bond.isin}
            </Text>
          </View>
          <View style={[styles.typeBadge, { backgroundColor: getBondTypeColor(item.bond.bond_type) + '20' }]}>
            <Text style={[styles.typeText, { color: getBondTypeColor(item.bond.bond_type) }]}>
              {item.bond.bond_type}
            </Text>
          </View>
        </View>

        <View style={styles.bondStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Coupon Rate
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {item.bond.coupon_rate}%
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Quantity
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {item.quantity}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Current Value
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {formatCurrency(item.current_value)}
            </Text>
          </View>
        </View>

        <View style={styles.bondFooter}>
          <View style={styles.profitLossContainer}>
            <Ionicons
              name={item.profit_loss >= 0 ? 'trending-up' : 'trending-down'}
              size={16}
              color={item.profit_loss >= 0 ? theme.colors.success : theme.colors.error}
            />
            <Text
              style={[
                styles.profitLoss,
                { color: item.profit_loss >= 0 ? theme.colors.success : theme.colors.error },
              ]}
            >
              {formatCurrency(Math.abs(item.profit_loss))} ({item.profit_loss_percentage.toFixed(2)}%)
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          My Portfolio
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          {bonds.length} Bonds
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search bonds..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <FlatList
        data={filteredBonds}
        renderItem={renderBondCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchPortfolio} tintColor={theme.colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {searchQuery ? 'No bonds found' : 'No bonds in portfolio'}
            </Text>
          </View>
        }
      />
    </View>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  listContent: {
    padding: 20,
    paddingTop: 8,
  },
  bondCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  bondHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bondInfo: {
    flex: 1,
    marginRight: 12,
  },
  bondName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bondIsin: {
    fontSize: 12,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  typeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  bondStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  bondFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  profitLossContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  profitLoss: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});
