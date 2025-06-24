import React from 'react';
import { View, StatusBar, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  statusBarStyle?: 'default' | 'light-content' | 'dark-content';
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
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
 */
export function Screen({
  children,
  style,
  backgroundColor = '#000000',
  statusBarStyle = 'light-content',
  edges = ['top', 'bottom'],
}: ScreenProps) {
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
        {children}
      </View>
    </SafeAreaView>
  );
} 