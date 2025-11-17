import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';
import { format } from 'date-fns';

const API_URL = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL;

interface Transaction {
  id: string;
  bond_name: string;
  isin: string;
  transaction_type: string;
  quantity: number;
  price: number;
  total_amount: number;
  date: string;
}

export default function TransactionsScreen() {
  const { theme } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/transactions/list`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={[styles.transactionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={styles.transactionHeader}>
        <View style={[styles.typeIcon, { backgroundColor: item.transaction_type === 'Buy' ? theme.colors.success + '20' : theme.colors.error + '20' }]}>
          <Ionicons
            name={item.transaction_type === 'Buy' ? 'add-circle' : 'remove-circle'}
            size={24}
            color={item.transaction_type === 'Buy' ? theme.colors.success : theme.colors.error}
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={[styles.bondName, { color: theme.colors.text }]} numberOfLines={1}>
            {item.bond_name}
          </Text>
          <Text style={[styles.isin, { color: theme.colors.textSecondary }]}>
            {item.isin}
          </Text>
        </View>
        <Text style={[styles.type, { color: item.transaction_type === 'Buy' ? theme.colors.success : theme.colors.error }]}>
          {item.transaction_type}
        </Text>
      </View>

      <View style={styles.transactionDetails}>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Quantity</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>{item.quantity}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Price per unit</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>{formatCurrency(item.price)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Total Amount</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text, fontWeight: 'bold' }]}>
            {formatCurrency(item.total_amount)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Date</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>
            {format(new Date(item.date), 'dd MMM yyyy')}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Transactions</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          {transactions.length} Records
        </Text>
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchTransactions} tintColor={theme.colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="swap-horizontal-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No transactions yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  headerSubtitle: { fontSize: 14 },
  listContent: { padding: 20 },
  transactionCard: { borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1 },
  transactionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  typeIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  transactionInfo: { flex: 1 },
  bondName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  isin: { fontSize: 12 },
  type: { fontSize: 14, fontWeight: 'bold' },
  transactionDetails: { gap: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: 14 },
  detailValue: { fontSize: 14 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, marginTop: 16 },
});