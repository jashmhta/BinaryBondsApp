import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import Constants from 'expo-constants';
import * as DocumentPicker from 'expo-document-picker';
import { format } from 'date-fns';

const API_URL = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL;

interface Bond {
  _id: string;
  name: string;
  isin: string;
  bond_type: string;
  issuer: string;
  face_value: number;
  coupon_rate: number;
  maturity_date: string;
  yield_to_maturity: number;
  category: string;
}

export default function BuyBondScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBond, setSelectedBond] = useState<Bond | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [contractNote, setContractNote] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchBonds();
  }, []);

  useEffect(() => {
    if (selectedBond) {
      setPrice(selectedBond.face_value.toString());
    }
  }, [selectedBond]);

  const fetchBonds = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/portfolio/all-bonds`);
      setBonds(response.data);
    } catch (error) {
      console.error('Error fetching bonds:', error);
      Alert.alert('Error', 'Failed to load bonds');
    } finally {
      setLoading(false);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        // In a real app, you would upload this file
        setContractNote(result.assets[0].name);
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  const handleBuyBond = async () => {
    if (!selectedBond) {
      Alert.alert('Error', 'Please select a bond');
      return;
    }

    if (!quantity || parseInt(quantity) <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/transactions/create`, {
        bond_id: selectedBond._id,
        transaction_type: 'Buy',
        quantity: parseInt(quantity),
        price: parseFloat(price),
        date: purchaseDate,
        contract_note: contractNote,
      });

      Alert.alert(
        'Success! 🎉',
        `Successfully purchased ${quantity} units of ${selectedBond.name}`,
        [
          {
            text: 'View Portfolio',
            onPress: () => router.replace('/(tabs)/portfolio'),
          },
          {
            text: 'Buy More',
            onPress: () => {
              setSelectedBond(null);
              setQuantity('1');
              setPrice('');
              setContractNote(null);
              setShowModal(false);
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to purchase bond');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const calculateTotal = () => {
    const q = parseInt(quantity) || 0;
    const p = parseFloat(price) || 0;
    const total = q * p;
    const gst = total * 0.18;
    return { total, gst, grandTotal: total + gst };
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

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <LinearGradient colors={[theme.colors.surface, theme.colors.background]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Buy Bonds</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Available Bonds */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Available Bonds</Text>
        {bonds.map((bond) => (
          <TouchableOpacity
            key={bond._id}
            onPress={() => {
              setSelectedBond(bond);
              setShowModal(true);
            }}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.bondCard,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              ]}
            >
              <View style={styles.bondHeader}>
                <View style={styles.bondInfo}>
                  <Text style={[styles.bondName, { color: theme.colors.text }]} numberOfLines={2}>
                    {bond.name}
                  </Text>
                  <Text style={[styles.bondIsin, { color: theme.colors.textSecondary }]}>
                    {bond.isin}
                  </Text>
                </View>
                <View
                  style={[
                    styles.typeBadge,
                    { backgroundColor: getBondTypeColor(bond.bond_type) + '20' },
                  ]}
                >
                  <Text style={[styles.typeText, { color: getBondTypeColor(bond.bond_type) }]}>
                    {bond.bond_type}
                  </Text>
                </View>
              </View>

              <View style={styles.bondStats}>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                    Coupon
                  </Text>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {bond.coupon_rate}%
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                    Face Value
                  </Text>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {formatCurrency(bond.face_value)}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                    YTM
                  </Text>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {bond.yield_to_maturity}%
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.buyButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => {
                  setSelectedBond(bond);
                  setShowModal(true);
                }}
              >
                <Text style={styles.buyButtonText}>Buy Now</Text>
                <Ionicons name="arrow-forward" size={20} color="#000" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Purchase Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Purchase Bond</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={28} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedBond && (
                <View
                  style={[
                    styles.selectedBondCard,
                    { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                  ]}
                >
                  <Text style={[styles.selectedBondName, { color: theme.colors.text }]}>
                    {selectedBond.name}
                  </Text>
                  <Text style={[styles.selectedBondIsin, { color: theme.colors.textSecondary }]}>
                    {selectedBond.isin}
                  </Text>
                </View>
              )}

              {/* Quantity */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Quantity</Text>
                <View
                  style={[
                    styles.inputContainer,
                    { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                  ]}
                >
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                    placeholder="Enter quantity"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                  <Text style={[styles.inputUnit, { color: theme.colors.textSecondary }]}>units</Text>
                </View>
              </View>

              {/* Price */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Price per unit</Text>
                <View
                  style={[
                    styles.inputContainer,
                    { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                  ]}
                >
                  <Text style={[styles.inputPrefix, { color: theme.colors.textSecondary }]}>₹</Text>
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                    placeholder="Enter price"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
              </View>

              {/* Contract Note */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  Contract Note (Optional)
                </Text>
                <TouchableOpacity
                  style={[
                    styles.fileButton,
                    { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                  ]}
                  onPress={pickDocument}
                >
                  <Ionicons
                    name="document-attach"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text style={[styles.fileButtonText, { color: theme.colors.text }]}>
                    {contractNote || 'Attach PDF'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Summary */}
              <View
                style={[
                  styles.summaryCard,
                  { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                ]}
              >
                <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>Order Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                    Subtotal
                  </Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                    {formatCurrency(calculateTotal().total)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                    GST (18%)
                  </Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                    {formatCurrency(calculateTotal().gst)}
                  </Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryTotal]}>
                  <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>Total</Text>
                  <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
                    {formatCurrency(calculateTotal().grandTotal)}
                  </Text>
                </View>
              </View>

              {/* Purchase Button */}
              <TouchableOpacity
                style={[styles.purchaseButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleBuyBond}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <Text style={styles.purchaseButtonText}>Confirm Purchase</Text>
                    <Ionicons name="checkmark-circle" size={24} color="#000" />
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  content: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  bondCard: { borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1 },
  bondHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  bondInfo: { flex: 1, marginRight: 12 },
  bondName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  bondIsin: { fontSize: 12 },
  typeBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' },
  typeText: { fontSize: 11, fontWeight: 'bold' },
  bondStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statItem: { flex: 1 },
  statLabel: { fontSize: 11, marginBottom: 4 },
  statValue: { fontSize: 14, fontWeight: 'bold' },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  buyButtonText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: { fontSize: 24, fontWeight: 'bold' },
  modalBody: { padding: 20 },
  selectedBondCard: { borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1 },
  selectedBondName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  selectedBondIsin: { fontSize: 13 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: { flex: 1, fontSize: 16 },
  inputPrefix: { fontSize: 16, marginRight: 8 },
  inputUnit: { fontSize: 14, marginLeft: 8 },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  fileButtonText: { flex: 1, fontSize: 14 },
  summaryCard: { borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1 },
  summaryTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: '600' },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 8,
    paddingTop: 12,
  },
  totalValue: { fontSize: 18, fontWeight: 'bold' },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 12,
    marginBottom: 20,
  },
  purchaseButtonText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
});
