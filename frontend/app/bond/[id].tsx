import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import Constants from 'expo-constants';
import { format } from 'date-fns';

const API_URL = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL;

interface BondRatings {
  crisil?: string;
  icra?: string;
  care?: string;
  india_ratings?: string;
}

interface Bond {
  _id: string;
  isin: string;
  name: string;
  bond_type: string;
  issuer: string;
  face_value: number;
  coupon_rate: number;
  maturity_date: string;
  ratings: BondRatings;
  interest_frequency: string;
  is_secured: boolean;
  category: string;
  yield_to_maturity: number;
  description: string;
}

interface UserBond {
  _id: string;
  quantity: number;
  purchase_date: string;
  purchase_price: number;
  invested_amount: number;
  current_value: number;
  profit_loss: number;
  interest_accrued: number;
}

export default function BondDetailScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [bond, setBond] = useState<Bond | null>(null);
  const [userBond, setUserBond] = useState<UserBond | null>(null);

  useEffect(() => {
    fetchBondDetails();
  }, [id]);

  const fetchBondDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/portfolio/bond/${id}`);
      setBond(response.data.bond);
      setUserBond(response.data.user_bond);
    } catch (error) {
      console.error('Error fetching bond details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const getRatingColor = (rating?: string) => {
    if (!rating) return theme.colors.textSecondary;
    if (rating.includes('AAA')) return '#4CAF50';
    if (rating.includes('AA')) return '#8BC34A';
    if (rating.includes('A')) return '#FFC107';
    return theme.colors.textSecondary;
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

  if (!bond) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.text }]}>Bond not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Bond Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Bond Name Card */}
        <LinearGradient
          colors={[theme.colors.primary, '#C5A028']}
          style={styles.nameCard}
        >
          <Text style={styles.bondName}>{bond.name}</Text>
          <Text style={styles.bondIsin}>{bond.isin}</Text>
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{bond.bond_type}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{bond.category}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Owned Section */}
        {userBond && (
          <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your Holdings</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Quantity</Text>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{userBond.quantity}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Invested</Text>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {formatCurrency(userBond.invested_amount)}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Current Value</Text>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {formatCurrency(userBond.current_value)}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>P&L</Text>
                <Text style={[styles.statValue, { color: userBond.profit_loss >= 0 ? theme.colors.success : theme.colors.error }]}>
                  {formatCurrency(Math.abs(userBond.profit_loss))}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Bond Details */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Bond Information</Text>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Issuer</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>{bond.issuer}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Face Value</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>{formatCurrency(bond.face_value)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Coupon Rate</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>{bond.coupon_rate}% p.a.</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Interest Frequency</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>{bond.interest_frequency}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Maturity Date</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {format(new Date(bond.maturity_date), 'dd MMM yyyy')}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Yield to Maturity</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>{bond.yield_to_maturity}%</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Security</Text>
            <View style={styles.securityBadge}>
              <Ionicons
                name={bond.is_secured ? 'shield-checkmark' : 'shield-outline'}
                size={16}
                color={bond.is_secured ? theme.colors.success : theme.colors.textSecondary}
              />
              <Text style={[styles.securityText, { color: theme.colors.text }]}>
                {bond.is_secured ? 'Secured' : 'Unsecured'}
              </Text>
            </View>
          </View>
        </View>

        {/* Credit Ratings */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Credit Ratings</Text>
          <View style={styles.ratingsGrid}>
            {bond.ratings.crisil && (
              <View style={styles.ratingBox}>
                <Text style={[styles.ratingAgency, { color: theme.colors.textSecondary }]}>CRISIL</Text>
                <Text style={[styles.rating, { color: getRatingColor(bond.ratings.crisil) }]}>
                  {bond.ratings.crisil}
                </Text>
              </View>
            )}
            {bond.ratings.icra && (
              <View style={styles.ratingBox}>
                <Text style={[styles.ratingAgency, { color: theme.colors.textSecondary }]}>ICRA</Text>
                <Text style={[styles.rating, { color: getRatingColor(bond.ratings.icra) }]}>
                  {bond.ratings.icra}
                </Text>
              </View>
            )}
            {bond.ratings.care && (
              <View style={styles.ratingBox}>
                <Text style={[styles.ratingAgency, { color: theme.colors.textSecondary }]}>CARE</Text>
                <Text style={[styles.rating, { color: getRatingColor(bond.ratings.care) }]}>
                  {bond.ratings.care}
                </Text>
              </View>
            )}
            {bond.ratings.india_ratings && (
              <View style={styles.ratingBox}>
                <Text style={[styles.ratingAgency, { color: theme.colors.textSecondary }]}>India Ratings</Text>
                <Text style={[styles.rating, { color: getRatingColor(bond.ratings.india_ratings) }]}>
                  {bond.ratings.india_ratings}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Description</Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {bond.description}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20 },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, padding: 20 },
  nameCard: { borderRadius: 20, padding: 24, marginBottom: 20 },
  bondName: { fontSize: 20, fontWeight: 'bold', color: '#000', marginBottom: 8 },
  bondIsin: { fontSize: 14, color: '#000', opacity: 0.7, marginBottom: 16 },
  badgeContainer: { flexDirection: 'row', gap: 8 },
  badge: { backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: '#000' },
  section: { borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statBox: { width: '47%' },
  statLabel: { fontSize: 12, marginBottom: 8 },
  statValue: { fontSize: 18, fontWeight: 'bold' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  detailLabel: { fontSize: 14 },
  detailValue: { fontSize: 14, fontWeight: '600' },
  securityBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  securityText: { fontSize: 14, fontWeight: '600' },
  ratingsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  ratingBox: { width: '47%', padding: 16, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', alignItems: 'center' },
  ratingAgency: { fontSize: 12, marginBottom: 8 },
  rating: { fontSize: 24, fontWeight: 'bold' },
  description: { fontSize: 14, lineHeight: 22 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 18, marginTop: 16 },
});
