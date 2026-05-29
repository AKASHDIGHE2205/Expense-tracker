import { Category } from '@/app/types/category';
import { getAllCategories } from '@/services/categoryServices';
import { addExpenses } from '@/services/tranServices';
import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from "@react-native-community/datetimepicker";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {  useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export type TransactionType = 'Dr' | 'Cr';

export default function AddExpenseScreen() {
  const [amount, setAmount] = useState('0.00');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>('Dr');
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError }: { data?: Category[]; isLoading: boolean; isError: boolean } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories,
    refetchOnMount: true,
    staleTime: 0,
  });


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

  // Get selected transaction type details
  const getSelectedTypeDetails = () => {
    return transactionTypes.find(type => type.id === transactionType) || transactionTypes[0];
  };

  const handleSave = async () => {
    // Validate amount
    const amountValue = parseFloat(amount);
    if (!amount || isNaN(amountValue) || amountValue <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Amount',
        text2: 'Please enter a valid amount greater than 0'
      });
      return;
    }

    // Validate category
    if (!selectedCategory) {
      Toast.show({
        type: 'error',
        text1: 'Category Required',
        text2: 'Please select a category'
      });
      return;
    }

    // Find selected category details
    const selectedCat = data?.find(cat => cat._id === selectedCategory);
    const typeDetails = getSelectedTypeDetails();

    // Prepare expense data
    const expenseData = {
      amount: amountValue,
      transactionType: transactionType,
      transactionLabel: typeDetails.label,
      categoryId: selectedCategory,
      categoryName: selectedCat?.label || 'Unknown',
      notes: notes.trim(),
      date: selectedDate.toISOString()
    };
    const response = await addExpenses(expenseData);
    if (response && response?.success) {

      await queryClient.invalidateQueries({
        queryKey: ['expenses']
      });
      
      Toast.show({
        type: 'success',
        text1: 'Expenses Added',
        text2: 'The Expenses has been created successfully.',
      });
      setAmount("0.00");
      setNotes('');
      setSelectedDate(new Date());
      setSelectedCategory("");
      setTransactionType("Dr");

      setTimeout(() => {
        router.replace("/(app)/transactions");
      }, 500);

    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 1. Top Header Bar */}
      <View style={[styles.headerBar, { marginTop: insets.top === 0 ? Platform.OS === 'android' ? 12 : 0 : 0 }]}>
        <TouchableOpacity
          style={styles.backButton} activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={22} color="#1A1D20" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Add Transaction</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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

        {/* 4. Category Grid Selection - Now using API data */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Category</Text>
          {data?.length === 0 ? (
            <View style={styles.emptyCategories}>
              <Feather name="folder" size={24} color="#CCCCCC" />
              <Text style={styles.emptyText}>No categories available</Text>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {data?.map((item) => {
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
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: transactionType === 'Dr' ? '#FF4D4D' : '#4CAF50' }
          ]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>
            Save {transactionType === 'Dr' ? 'Debit' : 'Credit'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  },
  emptyText: {
    fontSize: 14,
    color: '#8E9AA6',
    marginLeft: 8,
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