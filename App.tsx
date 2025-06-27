import './src/config/firebase'; // Ensure Firebase is initialized first
import React from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { store } from './src/store';
import { AppNavigator } from './src/navigation/AppNavigator';

/**
 * Main App component for Snap Factor.
 * 
 * Handles app initialization, navigation setup, and global state management.
 * Provides authentication flow and main app navigation structure.
 */
export default function App() {
  return (
    <Provider store={store}>
      <StatusBar style="light" backgroundColor="#000000" />
      <AppNavigator />
    </Provider>
  );
}
