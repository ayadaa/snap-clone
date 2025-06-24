import React from 'react';
import { View, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useAuth } from '../../hooks/auth/use-auth';
import { loginSchema, type LoginFormData } from '../../utils/validation/auth-schemas';

interface LoginFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
  onNavigateToSignup?: () => void;
}

/**
 * Enhanced login form component with validation and error handling.
 * Uses React Hook Form for form state management and Yup for validation.
 * Integrates with the authentication hook for login operations.
 */
export function LoginForm({ onSuccess, onForgotPassword, onNavigateToSignup }: LoginFormProps) {
  const { login, isLoading, error, clearAuthError } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    clearAuthError();
    
    const result = await login(data);
    
    if (result.success) {
      reset();
      onSuccess?.();
    }
  };

  return (
    <View style={{ width: '100%' }}>
      {/* Form Fields */}
      <View style={{ marginBottom: 24 }}>
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

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Password"
              placeholder="Enter your password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              isPassword
              autoComplete="password"
              error={errors.password?.message}
            />
          )}
        />

        {/* Global Error Message */}
        {error && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ color: '#FF3B30', fontSize: 14, textAlign: 'center' }}>
              {error}
            </Text>
          </View>
        )}

        {/* Submit Button */}
        <Button
          title="Sign In"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          disabled={!isValid}
          style={{ marginTop: 16 }}
        />
      </View>

      {/* Footer Actions */}
      <View style={{ alignItems: 'center' }}>
        <Button
          title="Forgot Password?"
          onPress={() => onForgotPassword?.()}
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
            onPress={() => onNavigateToSignup?.()}
            variant="ghost"
            size="small"
          />
        </View>
      </View>
    </View>
  );
} 