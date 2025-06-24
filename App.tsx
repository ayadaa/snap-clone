import React from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { store } from './src/store';
import { AppNavigator } from './src/navigation/AppNavigator';

/**
 * Main App component for SnapClone.
 * Phase 0 implementation with Redux store integration and navigation setup.
 * 
 * Features:
 * - Redux store provider for state management
 * - Navigation between auth and main app flows
 * - Basic UI component library
 * - Dark theme design system
 */
export default function App() {
  return (
    <Provider store={store}>
      <StatusBar style="light" backgroundColor="#000000" />
      <AppNavigator />
    </Provider>
  );
}
