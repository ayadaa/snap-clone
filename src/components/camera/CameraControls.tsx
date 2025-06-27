import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraType, FlashMode } from 'expo-camera';

/**
 * Camera controls component providing UI for camera operations.
 * Features glassmorphic design with controls for flash, camera toggle, and capture.
 * Handles both photo capture and video recording with visual feedback.
 */

interface CameraControlsProps {
  cameraType: CameraType;
  flashMode: FlashMode;
  isRecording: boolean;
  recordingDuration: number;
  isHomeworkMode?: boolean;
  onToggleCamera: () => void;
  onToggleFlash: () => void;
  onCapture: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onToggleHomeworkMode?: () => void;
  formatRecordingDuration: (duration: number) => string;
}

export function CameraControls({
  cameraType,
  flashMode,
  isRecording,
  recordingDuration,
  isHomeworkMode = false,
  onToggleCamera,
  onToggleFlash,
  onCapture,
  onStartRecording,
  onStopRecording,
  onToggleHomeworkMode,
  formatRecordingDuration,
}: CameraControlsProps) {
  /**
   * Get flash icon based on current flash mode
   */
  const getFlashIcon = () => {
    switch (flashMode) {
      case 'on':
        return 'flash';
      case 'auto':
        return 'flash-outline';
      case 'off':
      default:
        return 'flash-off';
    }
  };

  /**
   * Handle capture button press - either take photo or start/stop recording
   */
  const handleCapturePress = () => {
    if (isRecording) {
      onStopRecording();
    } else {
      onCapture();
    }
  };

  /**
   * Handle capture button long press - start video recording
   */
  const handleCaptureLongPress = () => {
    if (!isRecording) {
      onStartRecording();
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={onToggleFlash}
          activeOpacity={0.7}
        >
          <View style={styles.glassButton}>
            <Ionicons 
              name={getFlashIcon()} 
              size={24} 
              color="white" 
            />
          </View>
        </TouchableOpacity>

        {/* Homework Helper Mode Button */}
        {onToggleHomeworkMode && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onToggleHomeworkMode}
            activeOpacity={0.7}
          >
            <View style={[
              styles.glassButton,
              isHomeworkMode && styles.homeworkModeActive
            ]}>
              <Ionicons 
                name="calculator" 
                size={24} 
                color={isHomeworkMode ? "#FFD700" : "white"} 
              />
            </View>
          </TouchableOpacity>
        )}

        {/* Recording Duration Indicator */}
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>
              {formatRecordingDuration(recordingDuration)}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.controlButton}
          onPress={onToggleCamera}
          activeOpacity={0.7}
        >
          <View style={styles.glassButton}>
            <Ionicons 
              name="camera-reverse" 
              size={24} 
              color="white" 
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {/* Capture Button */}
        <TouchableOpacity
          style={[
            styles.captureButton,
            isRecording && styles.captureButtonRecording,
            isHomeworkMode && styles.captureButtonHomework
          ]}
          onPress={handleCapturePress}
          onLongPress={handleCaptureLongPress}
          activeOpacity={0.8}
        >
          <View style={[
            styles.captureButtonInner,
            isRecording && styles.captureButtonInnerRecording,
            isHomeworkMode && styles.captureButtonInnerHomework
          ]} />
        </TouchableOpacity>

        {/* Instructions */}
        <Text style={styles.instructionText}>
          {isHomeworkMode 
            ? 'Snap your homework for help!' 
            : isRecording 
              ? 'Tap to stop • Recording...' 
              : 'Tap for photo • Hold for video'
          }
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  controlButton: {
    padding: 4,
  },
  glassButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
    marginRight: 8,
  },
  recordingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomControls: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  captureButtonRecording: {
    borderColor: '#FF0000',
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  captureButtonInnerRecording: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: '#FF0000',
  },
  captureButtonHomework: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  captureButtonInnerHomework: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: '#FFD700',
  },
  instructionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  homeworkModeActive: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
}); 