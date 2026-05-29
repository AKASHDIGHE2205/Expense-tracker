import { getRecentTransactions, getTransactionSummary } from '@/services/tranServices';
import { getUser } from '@/utils/secureStorage';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { User } from '../types/user';
import { useQuery } from '@tanstack/react-query';

interface Category {
  _id: string;
  name: string;
  label: string;
  color: string;
  family: string;
}

interface Transaction {
  _id: string;
  amount: number;
  transactionType: 'Cr' | 'Dr';
  notes?: string;
  date: string;
  categoryId: Category;
}

interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
}

interface ApiResponse {
  success: boolean;
  count: number;
  data: Transaction[];
}

interface SummaryApiResponse {
  success: boolean;
  data: SummaryData;
}

// Helper functions remain the same
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

const formatAmount = (amount: number, transactionType: string) => {
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return transactionType === 'Dr' ? `-₹${formattedAmount}` : `+₹${formattedAmount}`;
};

const renderIcon = (family: string, name: string, color: string, size: number = 28) => {
  switch (family) {
    case 'Ionicons':
      return <Ionicons name={name as any} size={size} color={color} />;
    case 'FontAwesome5':
      return <FontAwesome5 name={name as any} size={size} color={color} />;
    case 'MaterialCommunityIcons':
      return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
    default:
      return <Ionicons name="apps" size={size} color={color} />;
  }
};

export default function HomeScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [user, setUser] = useState<User | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // React Query for transaction summary
  const {
    data: summaryData,
    isLoading: summaryLoading,
    isError: summaryError,
    refetch: refetchSummary
  } = useQuery<SummaryApiResponse>({
    queryKey: ['transactionSummary', selectedPeriod],
    queryFn: () => getTransactionSummary(selectedPeriod),
    refetchOnMount: true,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // React Query for recent transactions
  const {
    data: recentTransactionsData,
    isLoading: transactionsLoading,
    isError: transactionsError,
    refetch: refetchTransactions
  } = useQuery<ApiResponse>({
    queryKey: ['recentTransactions'],
    queryFn: getRecentTransactions,
    refetchOnMount: true,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Load user data
  const loadUser = async () => {
    try {
      const storedUser = await getUser();
      if (storedUser) {
        setUser(storedUser);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Refetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadUser();
      refetchSummary();
      refetchTransactions();

      return () => {
        // Cleanup if needed
      };
    }, [selectedPeriod, refetchSummary, refetchTransactions])
  );

  // Handle period change
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    // React Query will automatically refetch when queryKey changes
  };

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await Promise.all([
        refetchSummary(),
        refetchTransactions(),
        loadUser()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchSummary, refetchTransactions]);

  // Extract data from React Query responses
  const summary: SummaryData = summaryData?.data || {
    totalIncome: 0,
    totalExpense: 0,
    currentBalance: 0
  };

  const recentTransactions: Transaction[] = recentTransactionsData?.data || [];

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isIncome = item.transactionType === 'Cr';
    const amountColor = isIncome ? '#10b92c' : '#fa3e3e';
    const bgColor = isIncome ? 'rgba(16, 185, 129, 0.1)' : 'rgba(249, 115, 22, 0.1)';

    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() => router.push(`/(app)/expenses/edit-expense?id=${item._id}`)}
        activeOpacity={0.7}
      >
        <View style={[styles.transactionIcon, { backgroundColor: bgColor }]}>
          {/* <Ionicons name={iconName} size={24} color={amountColor} /> */}
          {renderIcon(item.categoryId?.family, item.categoryId?.name, isIncome ? '#10b92c' : '#fa3e3e',24)}
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle}>
            {item.categoryId?.label || (isIncome ? 'Income' : 'Expense')}
          </Text>
          {item.notes && (
            <Text style={styles.transactionCategory} numberOfLines={1}>
              {item.notes}
            </Text>
          )}
          <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
        </View>
        <Text style={[styles.transactionAmount, { color: amountColor }]}>
          {formatAmount(item.amount, item.transactionType)}
        </Text>
      </TouchableOpacity>
    );
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'day': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return 'This Period';
    }
  };

  // Combined loading state
  const isLoading = summaryLoading || transactionsLoading;
  if (transactionsError || summaryError) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 16, color: '#F97316' }}>Error loading data. Please try again.</Text>
        <TouchableOpacity onPress={onRefresh} style={{ marginTop: 16 }}>
          <LinearGradient
            colors={['#2563EB', '#14B8A6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>Retry</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563EB']}
            tintColor="#2563EB"
          />
        }
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={['#2563EB', '#14B8A6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View style={styles.userDetails}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
            </View>
          </View>

          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>
              {getPeriodLabel()} Balance
            </Text>
            {isLoading && !refreshing ? (
              <ActivityIndicator size="large" color="#FFFFFF" style={styles.balanceLoader} />
            ) : (
              <>
                <Text style={styles.balanceAmount}>
                  ₹{summary.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>

                <View style={styles.balanceStats}>
                  <View style={styles.statItem}>
                    <View style={[styles.statIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                      <Ionicons name="arrow-up" size={16} color="#10b92c" />
                    </View>
                    <View>
                      <Text style={styles.statLabel}>Income</Text>
                      <Text style={styles.statAmount}>
                        ₹{summary.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <View style={[styles.statIconBg, { backgroundColor: 'rgba(249, 115, 22, 0.2)' }]}>
                      <Ionicons name="arrow-down" size={16} color="#F97316" />
                    </View>
                    <View>
                      <Text style={styles.statLabel}>Expenses</Text>
                      <Text style={styles.statAmount}>
                        ₹{summary.totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          </View>
        </LinearGradient>

        {/* Period Selector */}
        <View style={styles.periodContainer}>
          {['day', 'week', 'month', 'year'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[styles.periodButton, selectedPeriod === period && styles.periodButtonActive]}
              onPress={() => handlePeriodChange(period)}
            >
              <Text style={[styles.periodText, selectedPeriod === period && styles.periodTextActive]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(app)/expenses/add-expense')}
            >
              <LinearGradient
                colors={['#2563EB', '#14B8A6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionGradient}
              >
                <View style={styles.actionIconBg}>
                  <Ionicons name="add-circle-outline" size={28} color="#FFFFFF" />
                </View>
                <Text style={styles.actionText}>Add Expense</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(app)/analytics')}
            >
              <View style={[styles.actionGradient, { backgroundColor: '#FFFFFF' }]}>
                <View style={[styles.actionIconBg, { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}>
                  <Ionicons name="stats-chart-outline" size={28} color="#2563EB" />
                </View>
                <Text style={[styles.actionText, { color: '#1E293B' }]}>Analytics</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(app)/transactions')}
            >
              <View style={[styles.actionGradient, { backgroundColor: '#FFFFFF' }]}>
                <View style={[styles.actionIconBg, { backgroundColor: 'rgba(20, 184, 166, 0.1)' }]}>
                  <Ionicons name="swap-horizontal" size={28} color="#14B8A6" />
                </View>
                <Text style={[styles.actionText, { color: '#1E293B' }]}>Transactions</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(app)/category/categories')}
            >
              <View style={[styles.actionGradient, { backgroundColor: '#FFFFFF' }]}>
                <View style={[styles.actionIconBg, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
                  <Ionicons name="list-outline" size={28} color="#F97316" />
                </View>
                <Text style={[styles.actionText, { color: '#1E293B' }]}>Categories</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/transactions')}>
              <View style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>See All</Text>
                <Ionicons name="chevron-forward" size={16} color="#2563EB" />
              </View>
            </TouchableOpacity>
          </View>

          {recentTransactions.length > 0 ? (
            <FlatList
              data={recentTransactions.slice(0, 5)}
              renderItem={renderTransaction}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              contentContainerStyle={styles.recentTransactionsList}
            />
          ) : (
            <View style={styles.emptyTransactions}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="receipt-outline" size={48} color="#2563EB" />
              </View>
              <Text style={styles.emptyTransactionsText}>No recent transactions</Text>
              <Text style={styles.emptyTransactionsSubtext}>Start adding your first transaction</Text>
              <TouchableOpacity
                style={styles.addTransactionButton}
                onPress={() => router.push('/(app)/expenses/add-expense')}
              >
                <LinearGradient
                  colors={['#2563EB', '#14B8A6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.addTransactionGradient}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.addTransactionButtonText}>Add Transaction</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

// Styles remain the same...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  userDetails: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 24,
    padding: 24
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  balanceLoader: {
    marginVertical: 40,
  },
  balanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
  },
  statAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  periodContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginTop: -16,
    marginBottom: 24,
    padding: 4,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  periodButtonActive: {
    backgroundColor: '#2563EB',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  actionGradient: {
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  recentTransactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyTransactions: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTransactionsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  emptyTransactionsSubtext: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
  },
  addTransactionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addTransactionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  addTransactionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});