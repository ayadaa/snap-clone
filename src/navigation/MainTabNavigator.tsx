import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, Platform } from 'react-native';
import { ChatScreen } from '../screens/chat/ChatScreen';
import { CameraStackNavigator } from './CameraStackNavigator';
import { MathStackNavigator } from './MathStackNavigator';
import { FriendsStackNavigator } from './FriendsStackNavigator';
import StoriesScreen from '../screens/stories/StoriesScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { MainTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Main tab navigator for Snap Factor.
 * Features bottom tabs for Chat, Camera, Stories, and Math.
 * Added Math tab for Snap Factor RAG features.
 */
export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#0084FF',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
      initialRouteName="Camera"
    >
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={{ 
              fontSize: 20, 
              color: focused ? '#0084FF' : 'rgba(255, 255, 255, 0.6)' 
            }}>
              💬
            </Text>
          ),
          tabBarLabel: 'Chat',
        }}
      />
      
      <Tab.Screen
        name="Camera"
        component={CameraStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={{ 
              fontSize: 24, 
              color: focused ? '#0084FF' : 'rgba(255, 255, 255, 0.6)' 
            }}>
              📸
            </Text>
          ),
          tabBarLabel: 'Camera',
        }}
      />

      <Tab.Screen
        name="Math"
        component={MathStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={{ 
              fontSize: 20, 
              color: focused ? '#0084FF' : 'rgba(255, 255, 255, 0.6)' 
            }}>
              🧮
            </Text>
          ),
          tabBarLabel: 'Math',
        }}
      />

      <Tab.Screen
        name="Friends"
        component={FriendsStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={{ 
              fontSize: 20, 
              color: focused ? '#0084FF' : 'rgba(255, 255, 255, 0.6)' 
            }}>
              👥
            </Text>
          ),
          tabBarLabel: 'Friends',
        }}
      />
      
      <Tab.Screen
        name="Stories"
        component={StoriesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={{ 
              fontSize: 20, 
              color: focused ? '#0084FF' : 'rgba(255, 255, 255, 0.6)' 
            }}>
              📱
            </Text>
          ),
          tabBarLabel: 'Stories',
        }}
      />
      
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={{ 
              fontSize: 20, 
              color: focused ? '#0084FF' : 'rgba(255, 255, 255, 0.6)' 
            }}>
              👤
            </Text>
          ),
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
} 