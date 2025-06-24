import React from 'react';
import { View, StatusBar, ViewStyle, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  statusBarStyle?: 'default' | 'light-content' | 'dark-content';
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  keyboardAvoidingView?: boolean;
}

/**
 * Screen wrapper component that provides consistent safe area handling and styling
 * across all screens in the app. Follows the theme system defined in theme-rules.md.
 * 
 * @param children - The content to render within the screen
 * @param style - Optional custom styles to apply to the container
 * @param backgroundColor - Background color override
 * @param statusBarStyle - Status bar content style
 * @param edges - Which edges to apply safe area insets to
 * @param keyboardAvoidingView - Whether to wrap content in KeyboardAvoidingView
 */
export function Screen({
  children,
  style,
  backgroundColor = '#000000',
  statusBarStyle = 'light-content',
  edges = ['top', 'bottom'],
  keyboardAvoidingView = false,
}: ScreenProps) {
  const content = keyboardAvoidingView ? (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {children}
    </KeyboardAvoidingView>
  ) : (
    children
  );

  return (
    <SafeAreaView
      style={[
        {
          flex: 1,
          backgroundColor,
        },
        style,
      ]}
      edges={edges}
    >
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={backgroundColor}
        translucent
      />
      <View style={{ flex: 1, backgroundColor }}>
        {content}
      </View>
    </SafeAreaView>
  );
} 