import { User } from '@/app/types/user';
import { createCategory } from '@/services/categoryServices';
import { getUser } from '@/utils/secureStorage';
import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { iconOptions } from './iconlist';
import { useQueryClient } from '@tanstack/react-query';

interface IconOption {
  label: string;
  family: string;
  name: string;
  color: string;
}

export default function AddCategoryScreen() {
  const [categoryName, setCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<IconOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

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

  const renderIconItem = ({ item }: { item: IconOption }) => {
    const isSelected = selectedIcon?.label === item.label;

    const renderIcon = () => {
      switch (item.family) {
        case 'Ionicons':
          return <Ionicons name={item.name as any} size={28} color={item.color} />;
        case 'FontAwesome5':
          return <FontAwesome5 name={item.name as any} size={28} color={item.color} />;
        case 'MaterialCommunityIcons':
          return <MaterialCommunityIcons name={item.name as any} size={28} color={item.color} />;
        default:
          return <Ionicons name="apps" size={28} color={item.color} />;
      }
    };

    return (
      <TouchableOpacity
        style={[styles.iconItem, isSelected && styles.selectedIconItem]}
        onPress={() => setSelectedIcon(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconCircle, { backgroundColor: item.color + '15' }]}>
          {renderIcon()}
        </View>
        <Text style={[styles.iconLabel, isSelected && styles.selectedIconLabel]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Category name cannot be empty.',
      });
      return;
    }
    if (!selectedIcon) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please select an icon.',
      });
      return;
    }

    setIsLoading(true);

    const data = {
      name: selectedIcon.name,
      label: selectedIcon.label,
      family: selectedIcon.family,
      color: selectedIcon.color,
      userID: user?.id || "",
    };

    try {
      const response = await createCategory(data);

      if (response?.success) {

        // Tell React Query cache this data is stale
        await queryClient.invalidateQueries({
          queryKey: ['categories']
        });

        Toast.show({
          type: 'success',
          text1: 'Category Created',
          text2: 'The category has been created successfully.',
        });
        setCategoryName('');
        setSelectedIcon(null);
        setIsLoading(false);
        router.replace('/(app)/category/categories');
      }
    }
    catch (error) {
      console.log(error)
    }
  };

  const handleCancel = () => {
    router.push('/(app)/category/categories');
    setCategoryName('');
    setSelectedIcon(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Navigation Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={handleCancel}
        >
          <Feather name="arrow-left" size={22} color="#1A1D20" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Add Category</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Category Name Input Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.sectionLabel}>Category Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter category name (e.g. Health)"
              placeholderTextColor="#A0A0A0"
              autoCapitalize="words"
              autoCorrect={false}
              value={categoryName}
              onChangeText={setCategoryName}
            />
          </View>

          {/* Icons Selection Section */}
          <View style={styles.iconsSection}>
            <Text style={styles.sectionLabel}>Select Icon</Text>
            <FlatList
              data={iconOptions}
              renderItem={renderIconItem}
              keyExtractor={(item, index) => `${item.label}-${index}`}
              numColumns={4}
              scrollEnabled={false}
              contentContainerStyle={styles.iconsGrid}
              columnWrapperStyle={styles.iconsRow}
            />
          </View>

          {/* Selected Icon Preview */}
          {selectedIcon && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>Selected Icon:</Text>
              <View style={styles.previewIconWrapper}>
                {(() => {
                  switch (selectedIcon.family) {
                    case 'Ionicons':
                      return <Ionicons name={selectedIcon.name as any} size={40} color={selectedIcon.color} />;
                    case 'FontAwesome5':
                      return <FontAwesome5 name={selectedIcon.name as any} size={40} color={selectedIcon.color} />;
                    case 'MaterialCommunityIcons':
                      return <MaterialCommunityIcons name={selectedIcon.name as any} size={40} color={selectedIcon.color} />;
                    default:
                      return <Ionicons name="apps" size={40} color={selectedIcon.color} />;
                  }
                })()}
                <Text style={[styles.previewText, { color: selectedIcon.color }]}>
                  {selectedIcon.label}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer Button */}
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={[styles.actionButton, isLoading && styles.actionButtonDisabled]}
          onPress={handleSaveCategory}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <Text style={styles.actionButtonText}>
            {isLoading ? 'Saving...' : 'Save Category'}
          </Text>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  inputGroup: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1D20',
    marginBottom: 12,
    paddingLeft: 2,
  },
  input: {
    height: 52,
    backgroundColor: '#F4F5F7',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconsSection: {
    marginBottom: 24,
  },
  iconsGrid: {
    alignItems: 'center',
  },
  iconsRow: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  iconItem: {
    alignItems: 'center',
    width: 70,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedIconItem: {
    opacity: 1,
  },
  iconLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  selectedIconLabel: {
    color: '#00529B',
    fontWeight: '600',
  },
  previewContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  previewIconWrapper: {
    alignItems: 'center',
  },
  previewText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F4F7',
  },
  actionButton: {
    height: 54,
    backgroundColor: '#00529B',
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00529B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});