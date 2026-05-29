import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#0062C4', '#004395', '#002B66']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/images/Onboarding.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Track your expenses easily</Text>
        </View>
        <Text style={styles.description}>
          Keep track of your expenses easily and save money with our smart analytics
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(auth)/sign-in')}
        >
          <Text style={styles.buttonText}>Get Started →</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 210,
    height: 210,
    marginBottom: 16,
    borderRadius: 20,
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#fff',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    marginBottom: 20,
  },
  buttonText: {
    color: '#0062C4',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
});