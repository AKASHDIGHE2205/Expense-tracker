import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react'
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const EmptyTransaction = () => {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with Back Arrow */}
        {/* <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Empty State</Text>
          <View style={styles.placeholder} />
        </View> */}

        {/* Empty State Content - No extra top space */}
        <View style={styles.emptyStateContent}>
          <Image
            source={require('../../../assets/images/Empty-Wallete.png')}
            style={styles.emptyImage}
            contentFit="contain"
          />
          
          <Text style={styles.title}>No transactions yet!</Text>
          
          <Text style={styles.subtitle}>
            Add your first expense to get started.
          </Text>
          
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.8}
            onPress={() => { router.push('/(app)/expenses/add-expense') }}
          >
            <Text style={styles.addButtonText}>Add Expense</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    backgroundColor: '#F2F4F7',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',

  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
  },
  placeholder: {
    width: 40,
  },
  emptyStateContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyImage: {
    width: 180, // Slightly smaller
    height: 180,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  addButton: {
     height: 54,
    backgroundColor: '#00529B',
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#121416',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    paddingHorizontal: 24,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
})

export default EmptyTransaction;