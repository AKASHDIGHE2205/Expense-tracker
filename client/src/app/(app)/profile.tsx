import { removeToken } from '@/utils/secureStorage';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { UserProfile } from '../types/user';
import { getUserProfile } from '@/services/authServices';
import { useQuery } from '@tanstack/react-query';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { getExportData } from '@/services/tranServices';
import { ActivityIndicator } from 'react-native';


export default function ProfileScreen() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, isError }: { data: UserProfile | undefined; isLoading: boolean; isError: boolean } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getUserProfile
  });

  const handleLogout = async () => {
    await removeToken();
    Toast.show({
      type: 'success',
      text1: 'Logged out successfully',
    });
    router.replace('/(auth)/sign-in');
  };

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const blob = await getExportData();

      // Convert blob to text directly (no FileReader needed)
      const csvText = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(blob);
      });

      // Use newer expo-file-system API
      const fileUri = (FileSystem.documentDirectory ?? FileSystem.cacheDirectory) + 'transactions.csv';

      await FileSystem.writeAsStringAsync(fileUri, csvText, {
        encoding: 'utf8' as any,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Transactions',
          UTI: 'public.comma-separated-values-text',
        });
      } else {
        Toast.show({ type: 'error', text1: 'Sharing not available on this device' });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Export failed',
        text2: error?.message || 'Something went wrong',
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 16, color: '#64748B' }}>Loading profile...</Text>
      </View>
    );
  }
  if (isError) {
    return (
      <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 16, color: '#64748B' }}>Failed to load profile</Text>
        <TouchableOpacity onPress={() => router.replace('/(auth)/sign-in')} style={{ marginTop: 20, padding: 10, backgroundColor: '#2563EB', borderRadius: 8 }}>
          <Text style={{ color: '#FFFFFF' }}>Go to Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#2563EB" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Gradient - Primary to Secondary */}
        <LinearGradient
          colors={['#2563EB', '#14B8A6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileHeaderGradient}
        >
          <SafeAreaView edges={['top']} style={styles.headerSafeView}>
            <View style={styles.avatarCardBlock}>
              <View style={styles.avatarOuterRing}>
                {/* Use user icon/logo instead of remote image */}
                <View style={[styles.avatarImage, styles.avatarIconBg]}>
                  <Feather name="user" size={48} color="#FFFFFF" />
                </View>
                <View style={styles.avatarBadge}>
                  <Feather name="camera" size={12} color="#FFFFFF" />
                </View>
              </View>
              <Text style={styles.userNameText}>
                {data?.name || 'Loading User...'}
              </Text>
              <View style={styles.userInfoRow}>
                <Feather name="mail" size={14} color="rgba(255, 255, 255, 0.7)" />
                <Text style={styles.userEmailText}>{data?.email || '...'}</Text>
              </View>
              <View style={styles.userInfoRow}>
                <Feather name="phone" size={14} color="rgba(255, 255, 255, 0.7)" />
                <Text style={styles.userEmailText}>{data?.mobile || '...'}</Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}>
              <Feather name="calendar" size={20} color="#2563EB" />
            </View>
            <Text style={styles.statValue}>Member</Text>
            <Text style={styles.statLabel}>Since {data?.createdAt ? new Date(data?.createdAt).getFullYear() : 'N/A'}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: 'rgba(20, 184, 166, 0.1)' }]}>
              <Feather name="check-circle" size={20} color="#14B8A6" />
            </View>
            <Text style={styles.statValue}>{data?.isVerified ? 'Verified' : 'Not Verified'}</Text>
            <Text style={styles.statLabel}>Account</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
              <Feather name="star" size={20} color="#F97316" />
            </View>
            <Text style={styles.statValue}>{data?.plane}</Text>
            <Text style={styles.statLabel}>Plane</Text>
          </View>
        </View>

        {/* Menu Container Card */}
        <View style={styles.menuContainerCard}>
          {/* Account Settings Section */}
          {/* <View style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>Account Settings</Text>

            <TouchableOpacity style={styles.menuItemRow} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconBackground, { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}>
                  <Feather name="user" size={20} color="#2563EB" />
                </View>
                <View>
                  <Text style={styles.menuItemLabel}>Personal Information</Text>
                  <Text style={styles.menuItemSubtext}>Update your profile details</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItemRow} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconBackground, { backgroundColor: 'rgba(20, 184, 166, 0.1)' }]}>
                  <Feather name="bell" size={20} color="#14B8A6" />
                </View>
                <View>
                  <Text style={styles.menuItemLabel}>Notifications</Text>
                  <Text style={styles.menuItemSubtext}>Manage alert preferences</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View> */}

          {/* Preferences Section */}
          {/* <View style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>Preferences</Text>

            <TouchableOpacity style={styles.menuItemRow} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconBackground, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
                  <Feather name="globe" size={20} color="#F97316" />
                </View>
                <View>
                  <Text style={styles.menuItemLabel}>Currency</Text>
                  <Text style={styles.menuItemSubtext}>USD - US Dollar</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItemRow} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconBackground, { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}>
                  <Feather name="moon" size={20} color="#2563EB" />
                </View>
                <View>
                  <Text style={styles.menuItemLabel}>Dark Mode</Text>
                  <Text style={styles.menuItemSubtext}>Light mode</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View> */}

          {/* Data Management Section */}
          <View style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>Data Management</Text>

            <TouchableOpacity
              style={styles.menuItemRow}
              activeOpacity={isExporting ? 1 : 0.7}
              onPress={handleExport}
              disabled={isExporting}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconBackground, { backgroundColor: isExporting ? 'rgba(148, 163, 184, 0.1)' : 'rgba(20, 184, 166, 0.1)' }]}>
                  {isExporting ? <ActivityIndicator size="small" color="#94A3B8" /> : <Feather name="upload" size={20} color="#14B8A6" />}
                </View>
                <View>
                  <Text style={[styles.menuItemLabel, isExporting && { color: '#94A3B8' }]}>
                    {isExporting ? 'Exporting...' : 'Export Data'}
                  </Text>
                  <Text style={styles.menuItemSubtext}>Backup your transactions</Text>
                </View>
              </View>
              {!isExporting && <Feather name="chevron-right" size={20} color="#94A3B8" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItemRow, { borderBottomWidth: 0 }]}
              activeOpacity={0.7}
              onPress={() => router.push('/(auth)/change-password')}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconBackground, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
                  <Feather name="lock" size={20} color="#F97316" />
                </View>
                <View>
                  <Text style={styles.menuItemLabel}>Change Password</Text>
                  <Text style={styles.menuItemSubtext}>Update your security</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* App Info */}
          <View style={styles.appInfoContainer}>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appCopyright}>© {currentYear} Finance Tracker</Text>
          </View>
        </View>
      </ScrollView>

      {/* Logout Button Footer */}
      <SafeAreaView edges={['bottom']} style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#F97316', '#F97316']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoutGradient}
          >
            <Feather name="log-out" size={20} color="#FFFFFF" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileHeaderGradient: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 32,
  },
  headerSafeView: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCardBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Platform.OS === 'android' ? 40 : 20,
  },
  avatarOuterRing: {
    position: 'relative',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarImage: {
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarIconBg: {
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#14B8A6',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userNameText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  userEmailText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  menuContainerCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  menuSection: {
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
  },
  menuItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBackground: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuItemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  menuItemSubtext: {
    fontSize: 12,
    color: '#94A3B8',
  },
  appInfoContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  appVersion: {
    fontSize: 12,
    color: '#2b2929',
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 11,
    color: '#2b2929',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  logoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutGradient: {
    flexDirection: 'row',
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});