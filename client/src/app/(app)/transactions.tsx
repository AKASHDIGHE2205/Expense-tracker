// Updated TransactionScreen component with pull-to-refresh and fixed initial load
import { getAllTran } from '@/services/tranServices';
import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Transaction } from '../types/transaction';
import { useQuery } from '@tanstack/react-query';

interface ApiResponse {
  success: boolean;
  count: number;
  tran_type: string;
  data: Transaction[];
}

// Helper function to render icon based on family and name
const renderIcon = (family: string, name: string, color: string, size: number = 22) => {
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

// Helper function to get icon and background color based on transaction category
const getIconForTransaction = (transaction: Transaction) => {
  const category = transaction.categoryId;

  if (category) {
    const bgColor = `${category.color}20`;

    if (transaction.transactionType === 'Cr') {
      return {
        icon: renderIcon(category.family, category.name, category.color, 22),
        bgColor: '#EBFBF3',
        type: 'income' as const
      };
    } else {
      return {
        icon: renderIcon(category.family, category.name, category.color, 22),
        bgColor: bgColor || '#FFEBEB',
        type: 'expense' as const
      };
    }
  }

  if (transaction.transactionType === 'Cr') {
    return {
      icon: <Ionicons name="briefcase" size={22} color="#00A854" />,
      bgColor: '#EBFBF3',
      type: 'income' as const
    };
  } else {
    return {
      icon: <Ionicons name="trash" size={22} color="#E51A1A" />,
      bgColor: '#FFEBEB',
      type: 'expense' as const
    };
  }
};

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Helper function to format amount
const formatAmount = (amount: number, transactionType: string) => {
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return transactionType === 'Dr' ? `-$${formattedAmount}` : `$${formattedAmount}`;
};

// Helper function to get current month start date
const getCurrentMonthStart = () => {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
};

const formatDateForAPI = (date: Date) => {
  return date.toISOString().split('T')[0];
};

export default function TransactionScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [fromDate, setFromDate] = useState(getCurrentMonthStart());
  const [toDate, setToDate] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['transactions', fromDate, toDate, typeFilter],
    queryFn: async () => {
      const params = {
        fromDate: formatDateForAPI(fromDate),
        toDate: formatDateForAPI(toDate),
        type: typeFilter
      };

      const response = await getAllTran(params) as ApiResponse;

      return response.data;
    },
    refetchOnMount: true,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // this useEffect to handle focus and refetch
  useEffect(() => {
    refetch();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Refetch data when screen comes into focus
      refetch();

      // Optional: Cleanup function
      return () => {
        // Cleanup if needed
      };
    }, [refetch])
  );

  useEffect(() => {
    if (data) {
      setTransactions(data);
      filterTransactionsBySearch(data, searchQuery);
      setLoading(false);
    }
  }, [data, searchQuery]);

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);


  // Filter transactions based on search query
  const filterTransactionsBySearch = (data: Transaction[], query: string) => {
    if (!query) {
      setFilteredTransactions(data);
      return;
    }

    const filtered = data.filter(t =>
      t.notes?.toLowerCase().includes(query.toLowerCase()) ||
      t.categoryId?.label?.toLowerCase().includes(query.toLowerCase()) ||
      t.categoryId?.name?.toLowerCase().includes(query.toLowerCase())
    );

    setFilteredTransactions(filtered);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterTransactionsBySearch(transactions, query);
  };

  // Handle date changes
  const onFromDateChange = (event: any, selectedDate?: Date) => {
    setShowFromDatePicker(false);
    if (selectedDate && selectedDate <= toDate) {
      setFromDate(selectedDate);
    } else if (selectedDate && selectedDate > toDate) {
      alert('From date cannot be later than To date');
    }
  };

  const onToDateChange = (event: any, selectedDate?: Date) => {
    setShowToDatePicker(false);
    if (selectedDate && selectedDate >= fromDate) {
      setToDate(selectedDate);
    } else if (selectedDate && selectedDate < fromDate) {
      alert('To date cannot be earlier than From date');
    }
  };

  // Handle type filter change
  const handleTypeFilterChange = (type: string) => {
    setTypeFilter(type);
  };

  const handleEdit = (item: Transaction) => {
    router.push({
      pathname: "/(app)/expenses/edit-expense",
      params: { id: item._id }
    });
  };

  const renderTransactionRow = ({ item }: { item: Transaction }) => {
    const { icon, bgColor, type } = getIconForTransaction(item);
    const amountColor = type === 'income' ? '#00A854' : '#E54B4B';

    return (
      <TouchableOpacity
        style={styles.rowCard}
        activeOpacity={0.7}
        onPress={() => { handleEdit(item); }}
      >
        <View style={styles.leftInfoBlock}>
          <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
            {icon}
          </View>
          <View style={styles.textMeta}>
            <Text style={styles.itemTitle}>
              {item.categoryId?.label || 'Transaction'}
            </Text>
            <Text style={styles.itemDate}>{formatDate(item.date)}</Text>
            {item.notes && (
              <Text style={styles.itemDescription} numberOfLines={1}>
                {item.notes}
              </Text>
            )}
          </View>
        </View>
        <Text style={[styles.amountText, { color: amountColor }]}>
          {formatAmount(item.amount, item.transactionType)}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={[styles.headerBar, { marginTop: insets.top === 0 ? Platform.OS === 'android' ? 12 : 0 : 0 }]}>
          <TouchableOpacity
            style={styles.backButton} activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={22} color="#1A1D20" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Transactions</Text>
          <View style={styles.headerRightSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00529B" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={[styles.headerBar, { marginTop: insets.top === 0 ? Platform.OS === 'android' ? 12 : 0 : 0 }]}>
          <TouchableOpacity
            style={styles.backButton} activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={22} color="#1A1D20" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Transactions</Text>
          <View style={styles.headerRightSpacer} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#6B7280' }}>Failed to load transactions.</Text>
          <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 8 }}>Please try again later.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header Navigation Row */}
      <View style={[styles.headerBar, { marginTop: insets.top === 0 ? Platform.OS === 'android' ? 12 : 0 : 0 }]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={22} color="#1A1D20" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Transactions</Text>
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.7}
          onPress={() => router.push("/(app)/expenses/add-expense")}
        >
          <Feather name="plus" size={22} color="#00529B" />
        </TouchableOpacity>
      </View>

      {/* Date Range Selection */}
      <View style={styles.dateRangeContainer}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowFromDatePicker(true)}
        >
          <Text style={styles.dateLabel}>Fr</Text>
          <Text style={styles.dateValue}>{formatDateForAPI(fromDate)}</Text>
          <Feather name="calendar" size={16} color="#8E9AA6" />
        </TouchableOpacity>

        <View style={styles.dateSeparator}>
          <Feather name="arrow-right" size={16} color="#8E9AA6" />
        </View>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowToDatePicker(true)}
        >
          <Text style={styles.dateLabel}>To</Text>
          <Text style={styles.dateValue}>{formatDateForAPI(toDate)}</Text>
          <Feather name="calendar" size={16} color="#8E9AA6" />
        </TouchableOpacity>
      </View>

      {/* Type Filter Tabs */}
      <View style={styles.typeFilterContainer}>
        {['All', 'Cr', 'Dr'].map((type) => {
          const isActive = typeFilter === type;
          const typeLabel = type === 'Cr' ? 'Income' : type === 'Dr' ? 'Expenses' : 'All';
          return (
            <TouchableOpacity
              key={type}
              style={[styles.typeFilterItem, isActive && styles.activeTypeFilterItem]}
              onPress={() => handleTypeFilterChange(type)}
              activeOpacity={0.8}
            >
              <Text style={[styles.typeFilterText, isActive && styles.activeTypeFilterText]}>
                {typeLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Search Bar Input */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#8E9AA6" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by notes or category"
          placeholderTextColor="#8E9AA6"
          value={searchQuery}
          onChangeText={handleSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Transactions List with Pull-to-Refresh */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransactionRow}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={filteredTransactions.length === 0 ? styles.emptyListContent : styles.listScrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#00529B']}
            tintColor="#00529B"
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Feather name="folder" size={48} color="#CCCCCC" />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No transactions match your search' : 'No transactions found for selected filters'}
              </Text>
              <Text style={styles.emptySubText}>
                {searchQuery ? 'Try a different search term' : 'Try changing the date range or type filter'}
              </Text>
              <TouchableOpacity
                style={styles.emptyActionButton}
                onPress={() => router.push("/(app)/expenses/add-expense")}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyActionButtonText}>Add Your First Transaction</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      {/* Loading Overlay for Initial Load */}
      {loading && filteredTransactions.length === 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00529B" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      )}

      {/* Date Pickers */}
      {showFromDatePicker && (
        <DateTimePicker
          value={fromDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onFromDateChange}
          maximumDate={toDate}
        />
      )}

      {showToDatePicker && (
        <DateTimePicker
          value={toDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onToDateChange}
          minimumDate={fromDate}
          maximumDate={new Date()}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F4F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F4F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
  },
  headerRightSpacer: {
    width: 40,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E9F0',
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E9F0',
  },
  dateLabel: {
    fontSize: 12,
    color: '#8E9AA6',
    marginRight: 8,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1D20',
    flex: 1,
    marginHorizontal: 8,
  },
  dateSeparator: {
    marginHorizontal: 12,
  },
  typeFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  typeFilterItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F2F4F7',
  },
  activeTypeFilterItem: {
    backgroundColor: '#2563EB',
  },
  typeFilterText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#707070',
  },
  activeTypeFilterText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F4F7',
    borderRadius: 14,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8E9AA6',
  },
  listScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    flexGrow: 1,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  rowCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F7',
  },
  leftInfoBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1D20',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 13,
    color: '#8E9AA6',
  },
  itemDescription: {
    fontSize: 12,
    color: '#8E9AA6',
    marginTop: 2,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1D20',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyActionButton: {
    height: 50,
    backgroundColor: '#00529B',
    borderRadius: 25,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00529B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButton: {
    height: 45,
    backgroundColor: '#00529B',
    borderRadius: 27,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00529B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});