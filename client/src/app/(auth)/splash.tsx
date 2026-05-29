import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Image, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(auth)/onboarding');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0062C4' }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={styles.logoContainer}>
        <Image
          source={require('../../../assets/images/splash.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.brandText}>
          Spend<Text style={styles.boldText}>Wise</Text>
        </Text>
      </View>

      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#00A2FF" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  logo: {
    width: 110,
    height: 110,
    marginBottom: 16,
  },
  brandText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  boldText: {
    fontWeight: '700',
  },
  loaderContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 150,
  },
});