// app/index.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withDelay
} from 'react-native-reanimated';

export default function WelcomePage() {
  const router = useRouter();
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withDelay(300, withSpring(1, { damping: 20 }));
    titleOpacity.value = withDelay(800, withSpring(1, { damping: 20 }));
    buttonOpacity.value = withDelay(1300, withSpring(1, { damping: 20 }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoOpacity.value }]
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: (1 - titleOpacity.value) * 50 }]
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: (1 - buttonOpacity.value) * 30 }]
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <Text style={styles.logoText}>✈️</Text>
      </Animated.View>
      
      <Animated.View style={titleStyle}>
        <Text style={styles.title}>Chillr</Text>
        <Text style={styles.subtitle}>Your ultimate travel companion</Text>
      </Animated.View>
      
      <Animated.TouchableOpacity 
        style={[styles.button, buttonStyle]}
        onPress={() => router.replace('/(tabs)/chillr')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </Animated.TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#023047',
    padding: 20,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#8ECAE6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  logoText: {
    fontSize: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFB703',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#8ECAE6',
    textAlign: 'center',
    marginBottom: 60,
  },
  button: {
    backgroundColor: '#FB8500',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});