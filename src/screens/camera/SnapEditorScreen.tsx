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
   * Handle next action - proceed to sharing
   */
  const handleNext = () => {
    // TODO: Navigate to sharing screen in Phase 1
    console.log('Proceeding to sharing...');
    Alert.alert('Coming Soon', 'Sharing functionality will be added in the next phase!');
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