import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Screen } from '../../components/common/Screen';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/auth/use-auth';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../../utils/validation/auth-schemas';

/**
 * Forgot Password screen for password reset functionality.
 * Allows users to request a password reset email from Firebase Auth.
 * Includes proper form validation and user feedback.
 */
export function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const { forgotPassword, isLoading, clearAuthError } = useAuth();
  const [emailSent, setEmailSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    clearAuthError();
    
    const result = await forgotPassword(data);
    
    if (result.success) {
      setEmailSent(true);
      Alert.alert(
        'Reset Email Sent',
        `We've sent a password reset link to ${data.email}. Please check your email and follow the instructions to reset your password.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } else {
      Alert.alert('Error', result.error || 'Failed to send reset email');
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  if (emailSent) {
    return (
      <Screen backgroundColor="#000000">
        <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
          <View style={{ alignItems: 'center', marginBottom: 48 }}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: '#FFFFFF',
                marginBottom: 8,
              }}
            >
              Check Your Email
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: 'rgba(255, 255, 255, 0.6)',
                textAlign: 'center',
                lineHeight: 24,
              }}
            >
              We've sent a password reset link to{'\n'}
              {getValues('email')}
            </Text>
          </View>

          <Button
            title="Back to Sign In"
            onPress={navigateToLogin}
            style={{ marginTop: 24 }}
          />
        </View>
      </Screen>
    );
  }

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
              Reset Password
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: 'rgba(255, 255, 255, 0.6)',
                textAlign: 'center',
                lineHeight: 24,
              }}
            >
              Enter your email address and we'll send you{'\n'}
              a link to reset your password
            </Text>
          </View>

          {/* Form */}
          <View style={{ marginBottom: 32 }}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  error={errors.email?.message}
                />
              )}
            />

            <Button
              title="Send Reset Link"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={!isValid}
              style={{ marginTop: 16 }}
            />
          </View>

          {/* Footer Actions */}
          <View style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14 }}>
                Remember your password?{' '}
              </Text>
              <Button
                title="Sign In"
                onPress={navigateToLogin}
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