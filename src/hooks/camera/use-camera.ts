import { useState, useRef, useCallback } from 'react';
import { Camera, CameraView } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';

/**
 * Camera hook for managing camera state and operations.
 * Handles permissions, camera settings, photo/video capture, and media library operations.
 * Provides a clean interface for camera functionality across the app.
 */
export function useCamera() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasAudioPermission, setHasAudioPermission] = useState<boolean | null>(null);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState<boolean | null>(null);
  
  const [cameraType, setCameraType] = useState<'front' | 'back'>('back');
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const cameraRef = useRef<CameraView>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingPromiseRef = useRef<Promise<any> | null>(null);
  const onAutoStopRef = useRef<((video: any) => void) | null>(null);
  const isRecordingRef = useRef(false);

  /**
   * Request all necessary permissions for camera functionality
   */
  const requestPermissions = useCallback(async () => {
    try {
      // Request camera permission
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraPermission.status === 'granted');

      // Request microphone permission for video recording
      const audioPermission = await Camera.requestMicrophonePermissionsAsync();
      setHasAudioPermission(audioPermission.status === 'granted');

      // Request media library permission to save photos/videos
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(mediaLibraryPermission.status === 'granted');

      return {
        camera: cameraPermission.status === 'granted',
        audio: audioPermission.status === 'granted',
        mediaLibrary: mediaLibraryPermission.status === 'granted',
      };
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Permission Error', 'Failed to request camera permissions');
      return {
        camera: false,
        audio: false,
        mediaLibrary: false,
      };
    }
  }, []);

  /**
   * Toggle between front and back camera
   */
  const toggleCameraType = useCallback(() => {
    setCameraType(current => 
      current === 'back' ? 'front' : 'back'
    );
  }, []);

  /**
   * Cycle through flash modes: off -> on -> auto -> off
   */
  const toggleFlashMode = useCallback(() => {
    setFlashMode(current => {
      switch (current) {
        case 'off':
          return 'on';
        case 'on':
          return 'auto';
        case 'auto':
          return 'off';
        default:
          return 'off';
      }
    });
  }, []);

  /**
   * Capture a photo with the camera
   */
  const takePhoto = useCallback(async () => {
    if (!cameraRef.current || !hasCameraPermission) {
      Alert.alert('Error', 'Camera not available');
      return null;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: false,
      });

      return {
        uri: photo.uri,
        width: photo.width,
        height: photo.height,
        type: 'photo' as const,
      };
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
      return null;
    }
  }, [hasCameraPermission]);

  /**
   * Start video recording with 15-second limit
   */
  const startRecording = useCallback(async (onAutoStop?: (video: any) => void) => {
    if (!cameraRef.current || !hasCameraPermission || !hasAudioPermission) {
      Alert.alert('Error', 'Camera or microphone not available');
      return;
    }

    if (isRecording || isRecordingRef.current) {
      return;
    }

    try {
      setIsRecording(true);
      isRecordingRef.current = true;
      setRecordingDuration(0);
      onAutoStopRef.current = onAutoStop || null;

      // Start recording
      console.log('Starting camera recording...');
      recordingPromiseRef.current = cameraRef.current.recordAsync({
        maxDuration: 15, // Let camera handle the 15-second limit
      });

      // Start recording timer for UI
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          const newDuration = prev + 1;
          return Math.min(newDuration, 15); // Cap display at 15 seconds
        });
      }, 1000);

      // Handle when recording ends naturally (maxDuration reached)
      recordingPromiseRef.current.then((video) => {
        console.log('Recording ended naturally:', video);
        
        // Clear timer
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        
        // Update state
        setIsRecording(false);
        isRecordingRef.current = false;
        setRecordingDuration(0);
        recordingPromiseRef.current = null;
        
        if (video && video.uri && onAutoStopRef.current) {
          const videoData = {
            uri: video.uri,
            type: 'video' as const,
            duration: 15,
          };
          console.log('Calling auto-stop callback with:', videoData);
          onAutoStopRef.current(videoData);
        }
      }).catch((error) => {
        console.error('Recording promise error:', error);
        // Clean up on error
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        setIsRecording(false);
        isRecordingRef.current = false;
        setRecordingDuration(0);
        recordingPromiseRef.current = null;
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording');
      setIsRecording(false);
      isRecordingRef.current = false;
      setRecordingDuration(0);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  }, [hasCameraPermission, hasAudioPermission, isRecording]);

  /**
   * Stop video recording
   */
  const stopRecording = useCallback(async () => {
    if (!cameraRef.current || !isRecordingRef.current) {
      return null;
    }

    try {
      console.log('Stopping video recording...');
      
      // Clear timer first
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      // Update state immediately
      setIsRecording(false);
      isRecordingRef.current = false;
      const finalDuration = recordingDuration;
      setRecordingDuration(0);
      
      // Stop recording and wait for result
      cameraRef.current.stopRecording();
      
      if (recordingPromiseRef.current) {
        console.log('Waiting for recording result...');
        const video = await recordingPromiseRef.current;
        recordingPromiseRef.current = null;
        
        console.log('Recording completed:', video);
        
        if (video && video.uri) {
          return {
            uri: video.uri,
            type: 'video' as const,
            duration: finalDuration,
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error stopping recording:', error);
      recordingPromiseRef.current = null;
      isRecordingRef.current = false;
      setRecordingDuration(0);
      return null;
    }
  }, [recordingDuration]);

  /**
   * Save media to device gallery
   */
  const saveToGallery = useCallback(async (uri: string) => {
    if (!hasMediaLibraryPermission) {
      Alert.alert('Permission Required', 'Media library permission is required to save photos and videos');
      return false;
    }

    try {
      await MediaLibrary.saveToLibraryAsync(uri);
      return true;
    } catch (error) {
      console.error('Error saving to gallery:', error);
      Alert.alert('Error', 'Failed to save to gallery');
      return false;
    }
  }, [hasMediaLibraryPermission]);

  /**
   * Get flash mode icon name for UI
   */
  const getFlashIcon = useCallback(() => {
    switch (flashMode) {
      case 'on':
        return 'flash-on';
      case 'auto':
        return 'flash-auto';
      case 'off':
      default:
        return 'flash-off';
    }
  }, [flashMode]);

  /**
   * Format recording duration for display
   */
  const formatRecordingDuration = useCallback((duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    // Permissions
    hasCameraPermission,
    hasAudioPermission,
    hasMediaLibraryPermission,
    requestPermissions,

    // Camera settings
    cameraType,
    flashMode,
    toggleCameraType,
    toggleFlashMode,
    getFlashIcon,

    // Recording state
    isRecording,
    recordingDuration,
    formatRecordingDuration,

    // Camera operations
    cameraRef,
    takePhoto,
    startRecording,
    stopRecording,
    saveToGallery,
  };
} 