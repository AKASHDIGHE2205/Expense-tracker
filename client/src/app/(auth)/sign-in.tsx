import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { LoginService } from '../../services/authServices';
import { saveToken, saveUser } from "../../utils/secureStorage";
import { SafeAreaView } from 'react-native-safe-area-context';
export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    try {
      if (!email || !password) {
        Toast.show({
          type: 'error',
          text1: 'Please fill all required fields',
        });
        return;
      }

      setLoading(true);

      const body = {
        email,
        password
      };

      const response = await LoginService(body);

      if (response?.token) {
        await saveToken(response.token);
        await saveUser(response.user);
        Toast.show({
          type: 'success',
          text1: response.message || 'Login successful',
        });
        router.replace('/(app)/home');
      } else {
        Toast.show({
          type: 'error',
          text1: "Token not found",
        });
      }

    } catch (error: any) {

      console.log(error);
      Toast.show({
        type: 'error',
        text1: error.message || 'An error occurred',
      });

    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0062C4' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email / Mobile"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="rgba(255,255,255,0.7)"
              cursorColor="#FFFFFF"
              selectionColor="rgba(255,255,255,0.3)"
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                textContentType="password"
                placeholderTextColor="rgba(255,255,255,0.7)"
                cursorColor="#FFFFFF"
                selectionColor="rgba(255,255,255,0.3)"
              />

              <TouchableOpacity
                style={styles.eyeButton}
                onPress={togglePasswordVisibility}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleSignIn}
              disabled={loading}
            >
              <Text style={styles.signInText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signUpButton}
              onPress={() => router.push('/(auth)/sign-up')}
            >
              <Text style={styles.signUpText}>Don't have an account? Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    color: '#fff',
    fontSize: 16,
  },
  signInButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  signInText: {
    color: '#0062C4',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signUpButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  signUpText: {
    color: '#fff',
    fontSize: 14,
  },
  passwordContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 70,
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  eyeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});