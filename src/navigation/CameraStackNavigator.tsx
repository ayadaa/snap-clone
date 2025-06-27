import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { CameraScreen } from '../screens/camera/CameraScreen';
import { SnapEditorScreen } from '../screens/camera/SnapEditorScreen';
import { SendToScreen } from '../screens/camera/SendToScreen';
import { HomeworkAnalysisScreen } from '../screens/camera/HomeworkAnalysisScreen';
import { CameraStackParamList } from '../types/navigation';

const Stack = createStackNavigator<CameraStackParamList>();

/**
 * Camera stack navigator for camera flow.
 * Handles navigation between camera capture, snap editing, and homework analysis.
 * Provides seamless transition from capture to editing or analysis workflow.
 */
export function CameraStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
      initialRouteName="CameraCapture"
    >
      <Stack.Screen
        name="CameraCapture"
        component={CameraScreen}
      />
      <Stack.Screen
        name="SnapEditor"
        component={SnapEditorScreen}
        options={{
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="SendTo"
        component={SendToScreen}
        options={{
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="HomeworkAnalysis"
        component={HomeworkAnalysisScreen}
        options={{
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
} 