import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import AppStackNavigator from './AppStackNavigator';
import { useAppSelector } from '../store/hooks';

/**
 * Main application navigator that manages the root navigation flow.
 * Switches between authentication flow and main app flow based on user state.
 * Integrates with Redux store to track authentication status.
 * 
 * Phase 0 implementation:
 * - Shows AuthNavigator when user is not authenticated
 * - Shows MainTabNavigator when user is authenticated
 * - Will be enhanced with deep linking and state persistence in Phase 1
 */
export function AppNavigator() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStackNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
} 