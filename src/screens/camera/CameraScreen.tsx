import React, { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { CameraView } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CameraStackParamList } from '../../types/navigation';
import { Screen } from '../../components/common/Screen';
import { CameraControls } from '../../components/camera/CameraControls';
import { useCamera } from '../../hooks/camera/use-camera';
import { Ionicons } from '@expo/vector-icons';

/**
 * Camera screen component - the heart of Snap Factor.
 * Provides camera functionality with capture, filters, and navigation.
 * Handles permissions, camera setup, and media capture workflows.
 */
type CameraScreenNavigationProp = StackNavigationProp<CameraStackParamList, 'CameraCapture'>;

export function CameraScreen() {
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const {
    // Permissions
    hasCameraPermission,
    hasAudioPermission,
    requestPermissions,
    
    // Camera settings
    cameraType,
    flashMode,
    toggleCameraType,
    toggleFlashMode,
    
    // Recording state
    isRecording,
    recordingDuration,
    formatRecordingDuration,
    
    // Camera operations
    cameraRef,
    takePhoto,
    startRecording,
    stopRecording,
  } = useCamera();

  const [isLoading, setIsLoading] = useState(true);
  const [isHomeworkMode, setIsHomeworkMode] = useState(false);

  /**
   * Request camera permissions on mount
   */
  useEffect(() => {
    async function setupCamera() {
      setIsLoading(true);
      const permissions = await requestPermissions();
      
      if (!permissions.camera) {
        Alert.alert(
          'Camera Permission Required',
          'Please enable camera access in your device settings to use Snap Factor.',
          [{ text: 'OK' }]
        );
      }
      
      if (!permissions.audio) {
        Alert.alert(
          'Microphone Permission Required',
          'Please enable microphone access to record videos with audio.',
          [{ text: 'OK' }]
        );
      }
      
      setIsLoading(false);
    }

    setupCamera();
  }, [requestPermissions]);

  /**
   * Toggle homework helper mode
   */
  const handleToggleHomeworkMode = () => {
    setIsHomeworkMode(prev => !prev);
  };

  /**
   * Handle photo capture - different behavior for homework mode
   */
  const handleCapture = async () => {
    try {
      const photo = await takePhoto();
      if (photo) {
        if (isHomeworkMode) {
          // Navigate to homework analysis screen
          navigation.navigate('HomeworkAnalysis', {
            imageUri: photo.uri,
            gradeLevel: undefined, // Could be set from user profile
          });
        } else {
          // Navigate to snap editor with photo
          navigation.navigate('SnapEditor', {
            mediaUri: photo.uri,
            mediaType: 'photo',
          });
        }
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  /**
   * Handle video recording start
   */
  const handleStartRecording = async () => {
    try {
      // Pass auto-stop callback to handle navigation when video auto-stops at 15s
      await startRecording((video) => {
        console.log('Auto-stop callback triggered with video:', video);
        if (video) {
          navigation.navigate('SnapEditor', {
            mediaUri: video.uri,
            mediaType: 'video',
          });
        }
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  /**
   * Handle video recording stop
   */
  const handleStopRecording = async () => {
    try {
      const video = await stopRecording();
      console.log('Manual stop with video:', video);
      if (video) {
        // Navigate to snap editor with video
        navigation.navigate('SnapEditor', {
          mediaUri: video.uri,
          mediaType: 'video',
        });
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  // Show loading screen while setting up camera
  if (isLoading) {
    return (
      <Screen backgroundColor="#000000" statusBarStyle="light-content">
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Setting up camera...</Text>
        </View>
      </Screen>
    );
  }

  // Show permission denied screen
  if (!hasCameraPermission) {
    return (
      <Screen backgroundColor="#000000" statusBarStyle="light-content">
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            Please enable camera access in your device settings to use Snap Factor.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen backgroundColor="#000000" statusBarStyle="light-content">
      <View style={styles.container}>
        {/* Camera View */}
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={cameraType}
          flash={flashMode}
          ratio="16:9"
        >
          {/* Homework Mode Indicator */}
          {isHomeworkMode && (
            <View style={styles.homeworkModeIndicator}>
              <Ionicons name="calculator" size={20} color="#FFD700" />
              <Text style={styles.homeworkModeText}>Homework Helper</Text>
            </View>
          )}

          {/* Camera Controls Overlay */}
          <CameraControls
            cameraType={cameraType}
            flashMode={flashMode}
            isRecording={isRecording}
            recordingDuration={recordingDuration}
            isHomeworkMode={isHomeworkMode}
            onToggleCamera={toggleCameraType}
            onToggleFlash={toggleFlashMode}
            onToggleHomeworkMode={handleToggleHomeworkMode}
            onCapture={handleCapture}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            formatRecordingDuration={formatRecordingDuration}
          />
        </CameraView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  homeworkModeIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 5,
    borderRadius: 5,
  },
  homeworkModeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
 