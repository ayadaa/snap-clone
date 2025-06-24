/**
 * App Stack Navigator
 * Top-level stack navigator that includes MainTabs and modal screens like SnapViewer
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MainTabNavigator } from './MainTabNavigator';
import { SnapViewerScreen } from '../screens/camera/SnapViewerScreen';
import { IndividualChatScreen } from '../screens/chat/IndividualChatScreen';
import StoryViewerScreen from '../screens/stories/StoryViewerScreen';
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
      <Stack.Screen
        name="StoryViewer"
        component={StoryViewerScreen}
        options={{
          presentation: 'modal',
          gestureEnabled: false, // Disable swipe gestures for story viewer
        }}
      />
      <Stack.Screen
        name="IndividualChat"
        component={IndividualChatScreen}
        options={{
          presentation: 'card',
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
} 