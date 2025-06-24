import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { FriendsListScreen } from '../screens/friends/FriendsListScreen';
import { AddFriendsScreen } from '../screens/friends/AddFriendsScreen';

/**
 * Stack navigator for friends-related screens.
 * Handles navigation between friends list and add friends functionality.
 * Provides a clean navigation flow for friend management features.
 */

export type FriendsStackParamList = {
  FriendsList: undefined;
  AddFriends: undefined;
};

const Stack = createStackNavigator<FriendsStackParamList>();

export function FriendsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#000000' },
        gestureEnabled: true,
      }}
      initialRouteName="FriendsList"
    >
      <Stack.Screen
        name="FriendsList"
        component={FriendsListScreen}
        options={{
          title: 'Friends',
        }}
      />
      
      <Stack.Screen
        name="AddFriends"
        component={AddFriendsScreen}
        options={{
          title: 'Add Friends',
        }}
      />
    </Stack.Navigator>
  );
} 