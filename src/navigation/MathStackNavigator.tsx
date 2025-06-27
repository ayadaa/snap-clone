/**
 * @fileoverview Math Stack Navigator for Snap Factor RAG Features
 * 
 * This navigator handles all the math-related screens including
 * Math Hub, Define Mode, Concept Explorer, and Challenge features.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DefineModeScreen } from '../components/rag/DefineModeScreen';
import { ConceptExplorerScreen } from '../components/rag/ConceptExplorerScreen';
import { MathHubScreen } from '../components/rag/MathHubScreen';
import { ChallengeViewerScreen } from '../components/rag/ChallengeViewerScreen';

/**
 * Math Stack Parameter List
 */
export type MathStackParamList = {
  DefineMode: undefined;
  ConceptExplorer: undefined;
  HomeworkHelper: undefined;
  MathChallenge: undefined;
  MathHub: undefined;
  ChallengeViewer: undefined;
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
      
      <Stack.Screen
        name="ChallengeViewer"
        component={ChallengeViewerScreen}
        options={{
          title: 'Math Challenge',
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