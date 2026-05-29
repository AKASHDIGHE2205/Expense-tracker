import { ResetPassService } from '@/services/authServices';
import { getUser } from '@/utils/secureStorage';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { User } from '../types/user';

export default function ChangePasswordScreen() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
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

  // Form Field State Values
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Visibility State Flags
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);



  const handleChangePassword = async () => {
    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please fill in all password fields.",
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "New passwords do not match.",
        });
        return;
      }

      const data = {
        userId: user?.id || "",
        email: user?.email || "",
        newPassword,
        confirmPassword,
        oldPassword: currentPassword,
      };

      const response = await ResetPassService(data);

      if (response?.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: response.message || "Password updated successfully",
        });

        router.back();
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: response?.message || "Something went wrong",
        });
      }
    } catch (error: any) {
      console.log("RESET PASSWORD ERROR:", error);

      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Invalid request",
      });
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 1. Integrated Standard Navigation Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color="#1A1D20" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Change Password</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      {/* 2. Keyboard Adjusting Layout Block */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.welcomeSubtext}>
            Choose a strong password to ensure your account security remains fully protected.
          </Text>

          {/* Current Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Current Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter current password"
                placeholderTextColor="#8E9AA6"
                secureTextEntry={!showCurrent}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.visibilityIcon}
                onPress={() => setShowCurrent(!showCurrent)}
                activeOpacity={0.6}
              >
                <Feather name={showCurrent ? "eye" : "eye-off"} size={18} color="#8E9AA6" />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>New Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor="#8E9AA6"
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={setNewPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.visibilityIcon}
                onPress={() => setShowNew(!showNew)}
                activeOpacity={0.6}
              >
                <Feather name={showNew ? "eye" : "eye-off"} size={18} color="#8E9AA6" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm New Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Confirm your new password"
                placeholderTextColor="#8E9AA6"
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.visibilityIcon}
                onPress={() => setShowConfirm(!showConfirm)}
                activeOpacity={0.6}
              >
                <Feather name={showConfirm ? "eye" : "eye-off"} size={18} color="#8E9AA6" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 3. Primary Action Form Submission Layout Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleChangePassword}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>Change Password</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
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
    width: 40, // Perfectly balances layout text directly dead-center
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#8E9AA6',
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1D20',
    marginBottom: 8,
    paddingLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECEFF5',
    paddingHorizontal: 16,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1D20',
    height: '100%',
  },
  visibilityIcon: {
    paddingLeft: 12,
    height: '100%',
    justifyContent: 'center',
  },
  submitButton: {
    height: 54,
    backgroundColor: '#00529B',
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#00529B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});