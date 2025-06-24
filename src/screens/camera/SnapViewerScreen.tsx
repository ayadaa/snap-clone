/**
 * Snap Viewer Screen
 * Displays received snaps with timer countdown and ephemeral viewing logic
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  StatusBar
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/common/Screen';
import { getSnapData, getUserProfile, markSnapAsViewed, type SnapData } from '../../services/firebase/firestore.service';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type SnapViewerScreenRouteProp = RouteProp<{
  SnapViewer: {
    snapId: string;
    chatType?: 'individual' | 'group';
    senderId?: string;
  };
}, 'SnapViewer'>;

export function SnapViewerScreen() {
  const navigation = useNavigation();
  const route = useRoute<SnapViewerScreenRouteProp>();
  const { snapId, chatType = 'individual', senderId } = route.params;
  const currentUserId = useSelector((state: RootState) => state.auth.user?.uid);
  
  const [snap, setSnap] = useState<SnapData | null>(null);
  const [senderUsername, setSenderUsername] = useState<string>('unknown_user');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isViewing, setIsViewing] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);
  const [alreadyViewed, setAlreadyViewed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<Video>(null);

  /**
   * Fetch snap data and sender information from Firebase
   */
  useEffect(() => {
    const fetchSnapData = async () => {
      try {
        console.log('Fetching snap data for ID:', snapId);
        
        // Fetch snap document
        const snapData = await getSnapData(snapId);
        
        if (!snapData) {
          setError('Snap not found');
          setLoading(false);
          return;
        }

        console.log('Snap data loaded:', snapData);
        
        // Check if current user has already viewed this snap
        const hasAlreadyViewed = currentUserId ? snapData.viewers.includes(currentUserId) : false;
        setAlreadyViewed(hasAlreadyViewed);
        
        // Fetch sender's username
        const senderProfile = await getUserProfile(snapData.senderId);
        if (senderProfile) {
          setSenderUsername(senderProfile.username);
          console.log('Sender username:', senderProfile.username);
        }
        
        setSnap(snapData);
        setTimeLeft(snapData.duration || 5); // Default to 5 seconds if no duration
        setIsViewing(true);
        setLoading(false);
        
        // Mark as viewed immediately (only if not already viewed)
        if (currentUserId && !hasAlreadyViewed) {
          await markSnapAsViewed(snapId, currentUserId);
          setHasViewed(true);
        }
        
      } catch (err) {
        console.error('Error fetching snap data:', err);
        setError('Failed to load snap');
        setLoading(false);
      }
    };

    fetchSnapData();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [snapId, currentUserId]);

  /**
   * Start countdown timer for photos
   */
  useEffect(() => {
    if (isViewing && snap?.mediaType === 'photo' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSnapExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isViewing, snap?.mediaType, timeLeft]);

  /**
   * Handle snap expiration
   */
  const handleSnapExpired = () => {
    setIsViewing(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Navigate back after a short delay
    setTimeout(() => {
      navigation.goBack();
    }, 500);
  };

  /**
   * Handle manual close
   */
  const handleClose = () => {
    handleSnapExpired();
  };

  /**
   * Handle video playback status
   */
  const handleVideoStatusUpdate = (status: any) => {
    if (status.didJustFinish) {
      handleSnapExpired();
    }
  };

  if (loading) {
    return (
      <Screen style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading snap...</Text>
        </View>
      </Screen>
    );
  }

  if (error || !snap) {
    return (
      <Screen style={styles.container}>
        <View style={styles.expiredContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#666" />
          <Text style={styles.expiredText}>{error || 'Snap not found'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  if (!isViewing) {
    return (
      <Screen style={styles.container}>
        <View style={styles.expiredContainer}>
          <Ionicons name="eye-off" size={64} color="#666" />
          <Text style={styles.expiredText}>Snap has expired</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Media Content */}
      <View style={styles.mediaContainer}>
        {snap.mediaType === 'photo' ? (
          <Image
            source={{ uri: snap.storageUrl }}
            style={styles.media}
            resizeMode="cover"
            onError={(error) => {
              console.error('Image load error:', error);
              setError('Failed to load image');
            }}
            onLoad={() => {
              console.log('Image loaded successfully');
            }}
          />
        ) : (
          <Video
            ref={videoRef}
            source={{ uri: snap.storageUrl }}
            style={styles.media}
            shouldPlay
            isLooping={false}
            resizeMode={ResizeMode.COVER}
            onPlaybackStatusUpdate={handleVideoStatusUpdate}
            onError={(error) => {
              console.error('Video load error:', error);
              setError('Failed to load video');
            }}
          />
        )}
      </View>

      {/* Overlay Controls */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.senderInfo}>
            <Text style={styles.senderText}>from {senderUsername}</Text>
            {chatType === 'group' && (
              <Text style={styles.groupInfo}>
                {alreadyViewed ? '👁️ Already viewed' : '👀 New snap'} • {snap.viewCount} view{snap.viewCount !== 1 ? 's' : ''}
              </Text>
            )}
            {snap.mediaType === 'photo' && (
              <Text style={styles.timerText}>{timeLeft}s</Text>
            )}
          </View>
        </View>

        {/* Timer Bar for Photos */}
        {snap.mediaType === 'photo' && (
          <View style={styles.timerBarContainer}>
            <View 
              style={[
                styles.timerBar,
                { width: `${(timeLeft / (snap.duration || 5)) * 100}%` }
              ]} 
            />
          </View>
        )}

        {/* Instructions */}
        <View style={styles.footer}>
          <Text style={styles.instructionText}>
            {alreadyViewed && chatType === 'group'
              ? 'You\'ve already viewed this snap'
              : snap.mediaType === 'photo' 
                ? 'Tap to close' 
                : 'Video will close automatically'
            }
          </Text>
          {chatType === 'group' && !alreadyViewed && (
            <Text style={[styles.instructionText, { fontSize: 12, marginTop: 4 }]}>
              This view will be recorded
            </Text>
          )}
        </View>
      </View>

      {/* Tap to close gesture */}
      <TouchableOpacity 
        style={styles.tapArea} 
        onPress={handleClose}
        activeOpacity={1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  },
  expiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  expiredText: {
    color: '#666',
    fontSize: 18,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  mediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: screenWidth,
    height: screenHeight,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  senderInfo: {
    alignItems: 'center',
  },
  senderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  timerText: {
    color: 'white',
    fontSize: 14,
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  timerBarContainer: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1.5,
  },
  timerBar: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 1.5,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 50,
  },
  instructionText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tapArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  groupInfo: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
}); 