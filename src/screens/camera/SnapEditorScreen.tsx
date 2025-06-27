import React from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Alert } from 'react-native';
import { SnapEditor } from '../../components/camera/SnapEditor';
import { CameraStackParamList } from '../../types/navigation';

type SnapEditorScreenRouteProp = RouteProp<CameraStackParamList, 'SnapEditor'>;
type SnapEditorScreenNavigationProp = StackNavigationProp<CameraStackParamList, 'SnapEditor'>;

/**
 * Screen wrapper for the SnapEditor component.
 * Handles navigation and data flow for snap editing functionality.
 * Provides save, cancel, and next actions for the editing workflow.
 */
export function SnapEditorScreen() {
  const navigation = useNavigation<SnapEditorScreenNavigationProp>();
  const route = useRoute<SnapEditorScreenRouteProp>();
  
  const { mediaUri, mediaType } = route.params;

  /**
   * Handle save action - save to device
   */
  const handleSave = async (editedData: any) => {
    try {
      // TODO: Implement save to device functionality
      console.log('Saving edited snap:', editedData);
      Alert.alert('Success', 'Snap saved to device!');
    } catch (error) {
      console.error('Error saving snap:', error);
      Alert.alert('Error', 'Failed to save snap');
    }
  };

  /**
   * Handle cancel action - go back to camera
   */
  const handleCancel = () => {
    navigation.goBack();
  };

  /**
   * Handle next action - proceed to sending
   */
  const handleNext = (editedData: { 
    originalMediaUri: string;
    compositeMediaUri: string;
    hasText?: boolean; 
    hasDrawing?: boolean; 
    duration?: number;
    textOverlays: any[];
    drawingPaths: any[];
  }) => {
    console.log('Proceeding to sending with data:', editedData);
    
    navigation.navigate('SendTo', {
      originalMediaUri: editedData.originalMediaUri,
      compositeMediaUri: editedData.compositeMediaUri,
      mediaType,
      duration: editedData.duration || (mediaType === 'photo' ? 5 : 15), // Default durations
      hasText: editedData.hasText || false,
      hasDrawing: editedData.hasDrawing || false,
      textOverlays: editedData.textOverlays || [],
      drawingPaths: editedData.drawingPaths || [],
    });
  };

  return (
    <SnapEditor
      mediaUri={mediaUri}
      mediaType={mediaType}
      onSave={handleSave}
      onCancel={handleCancel}
      onNext={handleNext}
    />
  );
} 