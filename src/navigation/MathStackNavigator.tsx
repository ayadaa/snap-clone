/**
 * @fileoverview Math Stack Navigator for MathSnap RAG Features
 * 
 * This navigator handles all math-related screens including:
 * - Define Mode (Story #2)
 * - Concept Explorer (Story #4) 
 * - Homework Helper (Story #1)
 * - Math Challenge features (Stories #5-6)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DefineModeScreen } from '../components/rag/DefineModeScreen';
import { ConceptExplorerScreen } from '../components/rag/ConceptExplorerScreen';
import { MathHubScreen } from '../components/rag/MathHubScreen';

/**
 * Math Stack Parameter List
 */
export type MathStackParamList = {
  DefineMode: undefined;
  ConceptExplorer: undefined;
  HomeworkHelper: undefined;
  MathChallenge: undefined;
  MathHub: undefined;
};

const Stack = createNativeStackNavigator<MathStackParamList>();

/**
 * Math Stack Navigator Component
 * 
 * Manages navigation between different math learning features.
 * Initially starts with Define Mode as the main screen.
 */
export function MathStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
      }}
      initialRouteName="MathHub"
    >
      <Stack.Screen
        name="MathHub"
        component={MathHubScreen}
        options={{
          title: 'Math Hub',
        }}
      />
      
      <Stack.Screen
        name="DefineMode"
        component={DefineModeScreen}
        options={{
          title: 'Define Mode',
        }}
      />
      
      <Stack.Screen
        name="ConceptExplorer"
        component={ConceptExplorerScreen}
        options={{
          title: 'Concept Explorer',
        }}
      />
      
      {/* Future screens for other user stories */}
      {/* 
      <Stack.Screen
        name="HomeworkHelper"
        component={HomeworkHelperScreen}
        options={{
          title: 'Homework Helper',
        }}
      />
      
      <Stack.Screen
        name="MathChallenge"
        component={MathChallengeScreen}
        options={{
          title: 'Math Challenge',
        }}
      />
      
      <Stack.Screen
        name="MathHub"
        component={MathHubScreen}
        options={{
          title: 'Math Hub',
        }}
      />
      */}
    </Stack.Navigator>
  );
} 