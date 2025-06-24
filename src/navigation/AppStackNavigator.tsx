/**
 * App Stack Navigator
 * Top-level stack navigator that includes MainTabs and modal screens like SnapViewer
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MainTabNavigator } from './MainTabNavigator';
import { SnapViewerScreen } from '../screens/camera/SnapViewerScreen';
import { AppStackParamList } from '../types/navigation';

const Stack = createStackNavigator<AppStackParamList>();

export function AppStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabNavigator} 
      />
      <Stack.Screen
        name="SnapViewer"
        component={SnapViewerScreen}
        options={{
          presentation: 'modal',
          gestureEnabled: true,
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateY: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.height, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      />
    </Stack.Navigator>
  );
} 