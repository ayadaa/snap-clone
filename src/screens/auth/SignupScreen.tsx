import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../../components/common/Screen';
import { SignupForm } from '../../components/forms/SignupForm';

/**
 * Enhanced Signup screen component with form validation and username checking.
 * Uses the SignupForm component for registration logic and validation.
 * Provides navigation to login screen and handles successful registration.
 */
export function SignupScreen() {
  const navigation = useNavigation<any>();

  const handleSignupSuccess = () => {
    // Navigation is handled automatically by AppNavigator based on auth state
    console.log('Signup successful - navigating to main app');
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <Screen backgroundColor="#000000" keyboardAvoidingView>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 48 }}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: '#FFFFFF',
                marginBottom: 8,
              }}
            >
              Join Snap Factor
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: 'rgba(255, 255, 255, 0.6)',
                textAlign: 'center',
              }}
            >
              Create your account to get started
            </Text>
          </View>

          {/* Signup Form */}
          <SignupForm
            onSuccess={handleSignupSuccess}
            onNavigateToLogin={navigateToLogin}
          />
        </View>
      </ScrollView>
    </Screen>
  );
} 