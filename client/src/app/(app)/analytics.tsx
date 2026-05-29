import React from 'react';
import { StyleSheet, Text, View, ScrollView, StatusBar, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Mock data to match the UI layout perfectly
const TRANSACTIONS = [
  {
    id: '1',
    title: "McDonald's",
    date: 'May 15',
    amount: '-$12.50',
    type: 'expense',
    iconColor: '#FFEBEB',
    brandIcon: () => (
      <MaterialCommunityIcons name="hamburger" size={22} color="#E51A1A" />
    ),
  },
  {
    id: '2',
    title: 'Paycheck',
    date: 'May 14',
    amount: '+$2,500.00',
    type: 'income',
    iconColor: '#EBFBF3',
    brandIcon: () => (
      <Feather name="dollar-sign" size={22} color="#00A854" />
    ),
  },
];

export default function AnalyticsScreen() {
  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#004FB4" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Gradient Top Header Section */}
        <LinearGradient
          colors={['#00529B', '#003366']}
          style={styles.headerGradient}
        >
          <SafeAreaView style={styles.headerSafeView}>
            {/* Total Balance Amount */}
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <Text style={styles.balanceAmount}>$2,450.70</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* 2. Floating Income / Expense Balance Cards */}
        <View style={styles.floatingCardsContainer}>
          {/* Income Summary Grid Card */}
          <View style={[styles.summaryCard, { backgroundColor: '#00A854' }]}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={styles.summaryValue}>$4,500.00</Text>
          </View>

          {/* Expenses Summary Grid Card */}
          <View style={[styles.summaryCard, { backgroundColor: '#E54B4B' }]}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={styles.summaryValue}>$2,049.30</Text>
          </View>
        </View>

        {/* 3. Monthly Analytics Block Graphic */}
        <View style={styles.analyticsCard}>
          <Text style={styles.cardTitle}>Monthly Analytics</Text>

          <View style={styles.chartContainer}>
            {/* Y-Axis Metrics */}
            <View style={styles.chartYAxis}>
              <Text style={styles.yAxisText}>400</Text>
              <Text style={styles.yAxisText}>300</Text>
              <Text style={styles.yAxisText}>200</Text>
              <Text style={styles.yAxisText}>100</Text>
              <Text style={styles.yAxisText}>0</Text>
            </View>

            {/* Bar Charts Representation */}
            <View style={styles.barsWrapper}>
              {[
                { label: 'Jan', topHeight: '15%', bottomHeight: '35%' },
                { label: 'Feb', topHeight: '35%', bottomHeight: '45%' },
                { label: 'Mar', topHeight: '10%', bottomHeight: '40%' },
                { label: 'Apr', topHeight: '28%', bottomHeight: '40%' },
                { label: 'Sep', topHeight: '30%', bottomHeight: '55%' },
                { label: 'Nov', topHeight: '14%', bottomHeight: '42%' },
              ].map((bar, index) => (
                <View key={index} style={styles.barColumn}>
                  <View style={styles.barTrackLayout}>
                    {/* Upper Dynamic Stack Bar (Green Portion) */}
                    <View style={[styles.barSegmentTop, { height: bar.topHeight as any }]} />
                    {/* Base Stack Bar (Blue Portion) */}
                    <View style={[styles.barSegmentBottom, { height: bar.bottomHeight as any }]} />
                  </View>
                  <Text style={styles.barLabel}>{bar.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 4. Recent Transactions List Layout */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>

          {TRANSACTIONS.map((item) => (
            <View key={item.id} style={styles.transactionRowCard}>
              <View style={styles.txLeftBlock}>
                <View style={[styles.txIconContainer, { backgroundColor: item.iconColor }]}>
                  {item.brandIcon()}
                </View>
                <View style={styles.txMeta}>
                  <Text style={styles.txTitle}>{item.title}</Text>
                  <Text style={styles.txDate}>{item.date}</Text>
                </View>
              </View>
              <Text
                style={[
                  styles.txAmountText,
                  { color: item.type === 'expense' ? '#E54B4B' : '#00A854' }
                ]}
              >
                {item.amount}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110, // Generous padding ensures scrolling clears the floating tab bar perfectly
  },
  headerGradient: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 65,
  },
  headerSafeView: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBtn: {
    marginRight: 12,
  },
  notificationBadge: {
    position: 'absolute',
    top: 11,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  balanceContainer: {
    paddingLeft: 4,
  },
  balanceLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '500',
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 38,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  floatingCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -42, // Key negative overlap that elevates cards up into the gradient layout space
    marginBottom: 24,
  },
  summaryCard: {
    width: (width - 54) / 2,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  analyticsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#ECEFF5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1D20',
    marginBottom: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 160,
    alignItems: 'flex-end',
  },
  chartYAxis: {
    justifyContent: 'space-between',
    height: '100%',
    paddingBottom: 24,
    paddingRight: 10,
  },
  yAxisText: {
    fontSize: 11,
    color: '#8E9AA6',
    textAlign: 'right',
    width: 24,
  },
  barsWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: '100%',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF5',
  },
  barColumn: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    width: '12%',
  },
  barTrackLayout: {
    width: 14,
    height: '100%',
    justifyContent: 'flex-end',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    marginBottom: 6,
  },
  barSegmentTop: {
    backgroundColor: '#00C060', // Vibrant upper stacked chart segment
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barSegmentBottom: {
    backgroundColor: '#00529B', // Base block segment matching layout color
    width: '100%',
  },
  barLabel: {
    fontSize: 11,
    color: '#8E9AA6',
    marginTop: 4,
  },
  transactionsSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1D20',
    marginBottom: 16,
  },
  transactionRowCard: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ECEFF5',
  },
  txLeftBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  txMeta: {
    justifyContent: 'center',
  },
  txTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1D20',
    marginBottom: 4,
  },
  txDate: {
    fontSize: 13,
    color: '#8E9AA6',
  },
  txAmountText: {
    fontSize: 16,
    fontWeight: '700',
  },
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 76,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ECEFF5',
    paddingBottom: Platform.OS === 'ios' ? 16 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  tabItem: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});