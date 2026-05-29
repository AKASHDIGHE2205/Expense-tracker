import { Category } from '@/app/types/category';
import { getAllCategories } from '@/services/categoryServices';
import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function CategoriesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Food');
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data, isLoading, isError }: { data: Category[] | undefined; isLoading: boolean; isError: boolean } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories,
    refetchOnMount: true,
    staleTime: 0
  });

  // Filter categories based on search query
  const filteredCategories = data?.filter(category =>
    searchQuery === '' ||
    category?.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render icon based on family and name
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

  const handleAddCategory = () => {
    router.push('/(app)/category/add-category');
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
          <Text style={styles.screenTitle}>Categories</Text>
          <View style={styles.headerRightSpacer} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#6B7280' }}>Loading categories...</Text>
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
          <Text style={styles.screenTitle}>Categories</Text>
          <View style={styles.headerRightSpacer} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#6B7280' }}>Failed to load categories.</Text>
          <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 8 }}>Please try again later.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 1. Header Bar Area */}
      <View style={[styles.headerBar, { marginTop: insets.top === 0 ? Platform.OS === 'android' ? 12 : 0 : 0 }]}>
        <TouchableOpacity
          style={styles.backButton} activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={22} color="#1A1D20" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Categories</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      {/* 2. Gray Background Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#8E9AA6" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#8E9AA6"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {/* 3. Category Grid Feed */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredCategories?.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="folder" size={48} color="#CCCCCC" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No categories match your search' : 'No categories yet'}
            </Text>
            <Text style={styles.emptySubText}>
              {searchQuery ? 'Try a different search term' : 'Tap the button below to add your first category'}
            </Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {filteredCategories?.map((item) => {
              const isSelected = selectedCategory === item?.label;
              return (
                <TouchableOpacity
                  key={item?._id}
                  style={[
                    styles.categoryCard,
                    isSelected && styles.activeCategoryCard,
                  ]}
                  onPress={() => setSelectedCategory(item?.label)}
                  activeOpacity={0.8}
                >
                  <View style={styles.iconContainer}>
                    {renderIcon(item?.family, item?.name, item?.color)}
                  </View>
                  <Text style={styles.categoryLabel}>{item?.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* 4. Bottom Sticky Action Button */}
      <View style={[styles.footerContainer, { paddingBottom: Platform.OS === 'ios' ? insets.bottom + 24 : insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleAddCategory}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>Add Category</Text>
        </TouchableOpacity>
      </View>

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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F4F7',
    borderRadius: 14,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    height: 48,
    marginTop: 16,
    marginBottom: 20,
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
  scrollContent: {
    paddingHorizontal: 14,
    paddingBottom: 100,
    flexGrow: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    width: (width - 44) / 2,
    aspectRatio: 1.25,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ECEFF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  activeCategoryCard: {
    backgroundColor: '#EBF3FA',
    borderColor: '#2563EB',
    borderWidth: 1.5,
  },
  iconContainer: {
    marginBottom: 10,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1D20',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1D20',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F4F7',
  },
  actionButton: {
    height: 54,
    backgroundColor: '#2563EB',
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
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