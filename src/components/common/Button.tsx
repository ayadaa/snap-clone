import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * Reusable Button component with consistent styling and behavior.
 * Supports multiple variants (primary, secondary, ghost) and sizes.
 * Follows the design system defined in theme-rules.md.
 * 
 * @param title - Text to display on the button
 * @param onPress - Function to call when button is pressed
 * @param variant - Visual style variant (primary, secondary, ghost)
 * @param size - Button size (small, medium, large)
 * @param disabled - Whether the button is disabled
 * @param loading - Whether to show loading indicator
 * @param style - Optional custom styles for the container
 * @param textStyle - Optional custom styles for the text
 */
export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  // Base button styles
  const baseButtonStyle: ViewStyle = {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
  };

  // Variant styles
  const variantStyles: Record<string, ViewStyle> = {
    primary: {
      backgroundColor: '#0084FF',
      borderColor: '#0084FF',
    },
    secondary: {
      backgroundColor: 'transparent',
      borderColor: '#0084FF',
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
  };

  // Size styles
  const sizeStyles: Record<string, ViewStyle> = {
    small: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      height: 36,
    },
    medium: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      height: 48,
    },
    large: {
      paddingHorizontal: 32,
      paddingVertical: 16,
      height: 56,
    },
  };

  // Text variant styles
  const textVariantStyles: Record<string, TextStyle> = {
    primary: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    secondary: {
      color: '#0084FF',
      fontWeight: '600',
    },
    ghost: {
      color: '#0084FF',
      fontWeight: '500',
    },
  };

  // Text size styles
  const textSizeStyles: Record<string, TextStyle> = {
    small: {
      fontSize: 14,
    },
    medium: {
      fontSize: 16,
    },
    large: {
      fontSize: 18,
    },
  };

  // Disabled styles
  const disabledStyle: ViewStyle = {
    opacity: 0.5,
  };

  return (
    <TouchableOpacity
      style={[
        baseButtonStyle,
        variantStyles[variant],
        sizeStyles[size],
        isDisabled && disabledStyle,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : '#0084FF'}
          style={{ marginRight: 8 }}
        />
      )}
      <Text
        style={[
          textVariantStyles[variant],
          textSizeStyles[size],
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
} 