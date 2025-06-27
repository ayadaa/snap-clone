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
import CreateGroupScreen from '../screens/chat/CreateGroupScreen';
import GroupChatScreen from '../screens/chat/GroupChatScreen';
import GroupSettingsScreen from '../screens/chat/GroupSettingsScreen';
import { ChallengeViewerScreen } from '../components/rag/ChallengeViewerScreen';
import { AppStackParamList } from '../types/navigation';
import { CardStyleInterpolators } from '@react-navigation/stack';

const Stack = createStackNavigator<AppStackParamList>();

export default function AppStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      
      <Stack.Screen 
        name="SnapViewer" 
        component={SnapViewerScreen}
        options={{
          presentation: 'modal',
          gestureEnabled: false,
        }}
      />
      
      <Stack.Screen 
        name="IndividualChat" 
        component={IndividualChatScreen}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#FFFFFF',
          headerTitle: '',
        }}
      />

      <Stack.Screen 
        name="GroupChat" 
        component={GroupChatScreen}
        options={{
          headerShown: false,
        }}
      />
      
      <Stack.Screen 
        name="GroupSettings" 
        component={GroupSettingsScreen}
        options={{
          headerShown: false,
        }}
      />
      
      <Stack.Screen 
        name="CreateGroup" 
        component={CreateGroupScreen}
        options={{
          headerShown: false,
        }}
      />
      
      <Stack.Screen 
        name="StoryViewer" 
        component={StoryViewerScreen}
        options={{
          presentation: 'modal',
          gestureEnabled: false,
        }}
      />
      
      <Stack.Screen 
        name="ChallengeViewer" 
        component={ChallengeViewerScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
} 