import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../../components/common/Screen';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAppDispatch } from '../../store/hooks';
import { setUser } from '../../store/slices/auth.slice';
import type { AuthStackParamList } from '../../types/navigation';

/**
 * Login screen component for user authentication.
 * Phase 0 implementation with basic form fields and no validation.
 * Will be enhanced with Firebase authentication in later development.
 */
export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

  const handleLogin = async () => {
    setIsLoading(true);
    
    // Phase 0: Mock authentication - accept any email/password
    console.log('Login attempt:', { email, password });
    
    // Simulate API call delay
    setTimeout(() => {
      // Create mock user and set authenticated state
      const mockUser = {
        uid: '1',
        email: email,
        username: email.split('@')[0],
        createdAt: new Date(),
        lastLogin: new Date(),
      };
      
      dispatch(setUser(mockUser));
      setIsLoading(false);
    }, 1000);
  };

  const handleForgotPassword = () => {
    console.log('Forgot password pressed');
    // TODO: Implement forgot password flow
  };

  const navigateToSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <Screen backgroundColor="#000000">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
              SnapClone
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: 'rgba(255, 255, 255, 0.6)',
                textAlign: 'center',
              }}
            >
              Sign in to continue
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
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              isPassword
              autoComplete="password"
            />

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              style={{ marginTop: 8 }}
            />
          </View>

          {/* Footer Actions */}
          <View style={{ alignItems: 'center' }}>
            <Button
              title="Forgot Password?"
              onPress={handleForgotPassword}
              variant="ghost"
              size="small"
              style={{ marginBottom: 16 }}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14 }}>
                Don't have an account?{' '}
              </Text>
              <Button
                title="Sign Up"
                onPress={navigateToSignup}
                variant="ghost"
                size="small"
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
} 