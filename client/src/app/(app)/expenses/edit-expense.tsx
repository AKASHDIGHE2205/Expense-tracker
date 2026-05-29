import { addExpenses, deleteTransaction, getTransactionById, updateExpenses } from '@/services/tranServices';
import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { TransactionType } from './add-expense';
import { Category } from '@/app/types/category';
import { getAllCategories } from '@/services/categoryServices';
import DateTimePicker from "@react-native-community/datetimepicker";
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function EditExpenseScreen() {
  const { id } = useLocalSearchParams();
  const [amount, setAmount] = useState('0.00');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>('Dr');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();

  // React Query for fetching categories
  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError
  } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: getAllCategories,
    refetchOnMount: true,
    staleTime: 0,
  });

  // Fetch transaction details
  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id]);

  const fetchDetails = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      if (!id) {
        return Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'No transaction ID provided'
        });
      }
      const response = await getTransactionById(id as string);
      if (response && response?.success) {
        const transactionData = response?.data;
        setAmount(transactionData.amount.toString());

        // Handle categoryId - it might be an object or string
        const categoryId = typeof transactionData.categoryId === 'object'
          ? transactionData.categoryId._id
          : transactionData.categoryId;

        setSelectedCategory(categoryId);
        setNotes(transactionData.notes || '');
        setSelectedDate(new Date(transactionData.date));
        setTransactionType(transactionData.transactionType);
      }
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load transaction details'
      });
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchDetails(true),
        queryClient.invalidateQueries({ queryKey: ['categories'] })
      ]);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, [id, queryClient]);

  // Transaction types data
  const transactionTypes = [
    {
      id: 'Dr',
      label: 'Debit',
      description: 'Money going out (Expense)',
      icon: 'arrow-up-circle',
      color: '#FF4D4D',
      backgroundColor: '#FFF0F0'
    },
    {
      id: 'Cr',
      label: 'Credit',
      description: 'Money coming in (Income)',
      icon: 'arrow-down-circle',
      color: '#4CAF50',
      backgroundColor: '#F0FFF0'
    },
  ];

  // Render icon based on family and name
  const renderIcon = (family: string, name: string, color: string, size: number = 24) => {
    switch (family) {
      case 'Ionicons':
        return <Ionicons name={name as any} size={size} color={color} />;
      case 'FontAwesome5':
        return <FontAwesome5 name={name as any} size={size} color={color} />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
      case 'MaterialIcons':
        return <MaterialIcons name={name as any} size={size} color={color} />;
      default:
        return <Ionicons name="apps" size={size} color={color} />;
    }
  };

  // Handle date change
  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    // Update date if selected, otherwise keep current
    if (date) {
      setSelectedDate(date);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Handle amount input formatting
  const handleAmountChange = (text: string) => {
    let cleaned = text.replace(/[^0-9.]/g, '');

    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      cleaned = parts[0] + '.' + parts[1].substring(0, 2);
    }

    setAmount(cleaned);
  };

  const handleUpdate = async () => {
    // Validate inputs
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return Toast.show({
        type: 'error',
        text1: 'Invalid Amount',
        text2: 'Please enter a valid amount greater than 0'
      });
    }
    if (!selectedCategory) {
      return Toast.show({
        type: 'error',
        text1: 'No Category Selected',
        text2: 'Please select a category for the transaction'
      });
    }

    const body = {
      id: id,
      amount: parseFloat(amount),
      categoryId: selectedCategory,
      notes,
      date: selectedDate.toISOString(),
      transactionType,
    };

    try {
      const response = await updateExpenses(body);
      if (response && response?.success) {
        // Invalidate queries to refresh data
        await queryClient.invalidateQueries({
          queryKey: ['transactions']
        });
        await queryClient.invalidateQueries({
          queryKey: ['expenses']
        });
        await queryClient.invalidateQueries({
          queryKey: ['recentTransactions']
        });
        await queryClient.invalidateQueries({
          queryKey: ['transactionSummary']
        });

        Toast.show({
          type: 'success',
          text1: 'Transaction Updated',
          text2: 'Your transaction has been updated successfully'
        });

        setTimeout(() => {
          router.replace("/(app)/transactions");
        }, 500);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Update Failed',
          text2: response?.message || 'Failed to update transaction'
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error?.message || 'Failed to update transaction'
      });
    }
  };

  const handleDelete = async () => {
    if (!id) {
      return Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No transaction ID provided'
      });
    }
    try {
      const response = await deleteTransaction(id as string);
      if (response && response?.success) {
        // Invalidate queries to refresh data
        await queryClient.invalidateQueries({
          queryKey: ['transactions']
        });
        await queryClient.invalidateQueries({
          queryKey: ['expenses']
        });
        await queryClient.invalidateQueries({
          queryKey: ['recentTransactions']
        });
        await queryClient.invalidateQueries({
          queryKey: ['transactionSummary']
        });

        Toast.show({
          type: 'success',
          text1: 'Transaction Deleted',
          text2: response?.data?.message || 'Your transaction has been deleted successfully'
        });

        setTimeout(() => {
          router.replace("/(app)/transactions");
        }, 500);
      }
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      Toast.show({
        type: 'error',
        text1: 'Delete Failed',
        text2: error?.message || 'Failed to delete transaction'
      });
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // Show loading screen while fetching data
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading transaction...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/* 1. Top Header Bar */}
      <View style={[styles.headerBar, { marginTop: insets.top === 0 ? Platform.OS === 'android' ? 12 : 0 : 0 }]}>
        <TouchableOpacity
          style={styles.backButton} activeOpacity={0.7}
          onPress={handleCancel}
        >
          <Feather name="arrow-left" size={22} color="#1A1D20" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Edit Transaction</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563EB']}
            tintColor="#2563EB"
          />
        }
      >
        {/* 2. Transaction Type Selector */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Transaction Type</Text>
          <View style={styles.typeSelectorRow}>
            {transactionTypes.map((type) => {
              const isSelected = transactionType === type.id;
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeButton,
                    isSelected && {
                      backgroundColor: type.backgroundColor,
                      borderColor: type.color,
                    }
                  ]}
                  onPress={() => setTransactionType(type.id as TransactionType)}
                  activeOpacity={0.7}
                >
                  <Feather
                    name={type.icon as any}
                    size={20}
                    color={isSelected ? type.color : '#8E9AA6'}
                  />
                  <View style={styles.typeTextContainer}>
                    <Text style={[
                      styles.typeLabel,
                      isSelected && { color: type.color }
                    ]}>
                      {type.label}
                    </Text>
                    <Text style={[
                      styles.typeDescription,
                      isSelected && { color: type.color }
                    ]}>
                      ({type.id})
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 3. Primary Amount Input Display Box */}
        <View style={[
          styles.amountCard,
          transactionType === 'Dr' ? styles.debitAmountCard : styles.creditAmountCard
        ]}>
          <View style={styles.amountHeaderRow}>
            <Text style={[
              styles.amountLabel,
              { color: transactionType === 'Dr' ? '#FF4D4D' : '#4CAF50' }
            ]}>
              {transactionType === 'Dr' ? 'Debit Amount' : 'Credit Amount'}
            </Text>
            <View style={[
              styles.typeBadge,
              { backgroundColor: transactionType === 'Dr' ? '#FFF0F0' : '#F0FFF0' }
            ]}>
              <Text style={[
                styles.typeBadgeText,
                { color: transactionType === 'Dr' ? '#FF4D4D' : '#4CAF50' }
              ]}>
                {transactionType}
              </Text>
            </View>
          </View>
          <View style={styles.amountInputRow}>
            <Text style={[
              styles.currencySymbol,
              { color: transactionType === 'Dr' ? '#FF4D4D' : '#4CAF50' }
            ]}>
              {transactionType === 'Dr' ? '-' : '+'}₹
            </Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0.00"
              placeholderTextColor="#1A1D20"
              selectTextOnFocus
            />
          </View>
        </View>

        {/* 4. Category Grid Selection - Using React Query data */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Category</Text>
          {categoriesLoading ? (
            <View style={styles.emptyCategories}>
              <ActivityIndicator size="small" color="#2563EB" />
              <Text style={styles.emptyText}>Loading categories...</Text>
            </View>
          ) : categoriesError ? (
            <View style={styles.emptyCategories}>
              <Feather name="alert-circle" size={24} color="#FF4D4D" />
              <Text style={styles.emptyText}>Failed to load categories</Text>
            </View>
          ) : !categories || categories.length === 0 ? (
            <View style={styles.emptyCategories}>
              <Feather name="folder" size={24} color="#CCCCCC" />
              <Text style={styles.emptyText}>No categories available</Text>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {categories.map((item) => {
                const isSelected = selectedCategory === item._id;
                return (
                  <TouchableOpacity
                    key={item._id}
                    style={[
                      styles.gridItem,
                      isSelected && styles.activeGridItem
                    ]}
                    onPress={() => setSelectedCategory(item._id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.iconWrapper}>
                      {renderIcon(item.family, item.name, item.color)}
                    </View>
                    <Text style={[styles.gridItemLabel, isSelected && styles.activeGridItemLabel]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* 5. Date Picker Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Date</Text>
          <TouchableOpacity
            style={styles.dateSelector}
            activeOpacity={0.7}
            onPress={() => setShowDatePicker(true)}
          >
            <View style={styles.dateLeftBlock}>
              <Feather name="calendar" size={20} color="#00529B" style={styles.dateIcon} />
              <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#8E9AA6" />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          {/* For iOS, add a done button to dismiss the picker */}
          {Platform.OS === 'ios' && showDatePicker && (
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 6. Notes Descriptive Text Input Area */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <View style={styles.notesContainer}>
            <TextInput
              style={styles.notesInput}
              placeholder="Add notes (optional)"
              placeholderTextColor="#8E9AA6"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
              maxLength={200}
            />
            <Text style={styles.characterCount}>{notes.length}/200</Text>
          </View>
        </View>

        {/* 7. Form Submission Layout Action Button */}
        <View style={{ flexDirection: 'column', gap: 12 }} >
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: '#2563EB' }
            ]}
            onPress={handleUpdate}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>
              Update Transaction
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: '#f83d30' }
            ]}
            onPress={handleDelete}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>
              Delete Transaction
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E9AA6',
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
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
  },
  headerRightSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1D20',
    marginBottom: 12,
    paddingLeft: 2,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#ECEFF5',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  typeTextContainer: {
    flexDirection: 'column',
  },
  typeLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1D20',
  },
  typeDescription: {
    fontSize: 12,
    color: '#8E9AA6',
    marginTop: 2,
  },
  amountCard: {
    borderRadius: 18,
    padding: 20,
    borderWidth: 1.5,
    marginBottom: 24,
  },
  debitAmountCard: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FFD5D5',
  },
  creditAmountCard: {
    backgroundColor: '#F5FFF5',
    borderColor: '#D5FFD5',
  },
  amountHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  amountLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 38,
    fontWeight: '700',
    marginRight: 2,
  },
  amountInput: {
    fontSize: 38,
    fontWeight: '700',
    color: '#1A1D20',
    flex: 1,
    padding: 0,
  },
  emptyCategories: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F7F9FC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECEFF5',
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#8E9AA6',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  gridItem: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECEFF5',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '1%',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  activeGridItem: {
    backgroundColor: '#EBF3FA',
    borderColor: '#00529B',
    borderWidth: 1.5,
  },
  iconWrapper: {
    marginBottom: 6,
  },
  gridItemLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1A1D20',
    textAlign: 'center',
  },
  activeGridItemLabel: {
    color: '#00529B',
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECEFF5',
    paddingHorizontal: 16,
    height: 52,
  },
  dateLeftBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1D20',
  },
  doneButton: {
    backgroundColor: '#00529B',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  notesContainer: {
    backgroundColor: '#F7F9FC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECEFF5',
    paddingHorizontal: 16,
    paddingVertical: 14,
    height: 100,
    position: 'relative',
  },
  notesInput: {
    fontSize: 16,
    color: '#1A1D20',
    height: '100%',
    paddingBottom: 20,
  },
  characterCount: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: 12,
    color: '#8E9AA6',
  },
  saveButton: {
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});