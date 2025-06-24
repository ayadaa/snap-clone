import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../../components/common/Screen';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setUser, setError, setLoading, clearError } from '../../store/slices/auth.slice';
import { signUpWithEmail } from '../../services/firebase/auth';

/**
 * Signup screen component for user registration.
 * Integrates with Firebase Authentication for real user registration.
 * Includes form validation and proper error handling.
 */
export function SignupScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  const handleSignup = async () => {
    // Form validation
    if (!email.trim() || !username.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters long');
      return;
    }

    dispatch(setLoading(true));
    dispatch(clearError());
    
    try {
      console.log('Attempting Firebase signup:', { email, username });
      const user = await signUpWithEmail({ 
        email: email.trim(), 
        password, 
        username: username.trim() 
      });
      
      console.log('Signup successful:', user);
      dispatch(setUser(user));
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage = error.message || 'Failed to create account';
      dispatch(setError(errorMessage));
      Alert.alert('Signup Failed', errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <Screen backgroundColor="#000000">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
                Join SnapClone
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

            {/* Form */}
            <View style={{ marginBottom: 32 }}>
              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <Input
                label="Username"
                placeholder="Choose a username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoComplete="username"
              />

              <Input
                label="Password"
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                isPassword
                autoComplete="new-password"
              />

              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword
                autoComplete="new-password"
              />

              <Button
                title="Create Account"
                onPress={handleSignup}
                loading={isLoading}
                style={{ marginTop: 8 }}
              />
            </View>

            {/* Footer Actions */}
            <View style={{ alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14 }}>
                  Already have an account?{' '}
                </Text>
                <Button
                  title="Sign In"
                  onPress={navigateToLogin}
                  variant="ghost"
                  size="small"
                />
              </View>
            </View>

            {/* Terms */}
            <View style={{ marginTop: 32, alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 12,
                  color: 'rgba(255, 255, 255, 0.4)',
                  textAlign: 'center',
                  lineHeight: 16,
                }}
              >
                By creating an account, you agree to our{'\n'}
                Terms of Service and Privacy Policy
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
} 