import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { useSelector } from 'react-redux';
import { useStoryViewer } from '../../hooks/stories/use-story-viewer';
import type { AppStackParamList } from '../../types/navigation';
import type { RootState } from '../../store';

const { width, height } = Dimensions.get('window');

type StoryViewerRouteProp = RouteProp<AppStackParamList, 'StoryViewer'>;

export default function StoryViewerScreen() {
  const navigation = useNavigation();
  const route = useRoute<StoryViewerRouteProp>();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const { stories, initialIndex } = route.params;
  
  const {
    currentStory,
    currentSnap,
    currentStoryIndex,
    currentSnapIndex,
    isPlaying,
    progress,
    goToNextSnap,
    goToPreviousSnap,
    togglePlayPause,
    jumpToStory,
    setIsPlaying,
  } = useStoryViewer(stories, initialIndex, user?.uid || '');

  // Handle screen focus/blur for play/pause
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => {
      setIsPlaying(true);
    });

    const unsubscribeBlur = navigation.addListener('blur', () => {
      setIsPlaying(false);
    });

    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigation, setIsPlaying]);

  /**
   * Handle tap on left side of screen (previous)
   */
  const handleLeftTap = () => {
    goToPreviousSnap();
  };

  /**
   * Handle tap on right side of screen (next)
   */
  const handleRightTap = () => {
    const result = goToNextSnap();
    if (result === 'end') {
      navigation.goBack();
    }
  };

  /**
   * Handle long press (pause/play)
   */
  const handleLongPress = () => {
    togglePlayPause();
  };

  /**
   * Close story viewer
   */
  const handleClose = () => {
    navigation.goBack();
  };

  if (!currentStory || !currentSnap) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Story Content */}
      <View style={styles.storyContent}>
        {currentSnap.mediaType === 'photo' ? (
          <Image
            source={{ uri: currentSnap.storageUrl }}
            style={styles.media}
            resizeMode="contain"
          />
        ) : (
          <Video
            source={{ uri: currentSnap.storageUrl }}
            style={styles.media}
            shouldPlay={isPlaying}
            isLooping={false}
            resizeMode={ResizeMode.CONTAIN}
            onPlaybackStatusUpdate={(status) => {
              if (status.isLoaded && status.didJustFinish) {
                const result = goToNextSnap();
                if (result === 'end') {
                  navigation.goBack();
                }
              }
            }}
          />
        )}
      </View>

      {/* Progress Bars */}
      <View style={styles.progressContainer}>
        {currentStory.snaps.map((_, index) => (
          <View key={index} style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: 
                    index < currentSnapIndex ? '100%' :
                    index === currentSnapIndex ? `${progress}%` : '0%'
                }
              ]}
            />
          </View>
        ))}
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{currentStory.username}</Text>
          <Text style={styles.timestamp}>
            {new Date().toLocaleDateString()}
          </Text>
        </View>
        
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Story Navigation Indicators */}
      {stories.length > 1 && (
        <View style={styles.storyIndicators}>
          {stories.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => jumpToStory(index)}
              style={[
                styles.storyIndicator,
                index === currentStoryIndex && styles.activeStoryIndicator
              ]}
            />
          ))}
        </View>
      )}

      {/* Tap Areas */}
      <View style={styles.tapAreas}>
        {/* Left tap area - Previous */}
        <Pressable
          style={styles.leftTapArea}
          onPress={handleLeftTap}
          onLongPress={handleLongPress}
        />
        
        {/* Right tap area - Next */}
        <Pressable
          style={styles.rightTapArea}
          onPress={handleRightTap}
          onLongPress={handleLongPress}
        />
      </View>

      {/* Play/Pause Indicator */}
      {!isPlaying && (
        <View style={styles.pauseIndicator}>
          <Ionicons name="pause" size={48} color="white" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  storyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: width,
    height: height,
  },
  progressContainer: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 4,
    zIndex: 2,
  },
  progressBarContainer: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'white',
  },
  header: {
    position: 'absolute',
    top: 80,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  storyIndicators: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    zIndex: 2,
  },
  storyIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeStoryIndicator: {
    backgroundColor: 'white',
  },
  tapAreas: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    zIndex: 1,
  },
  leftTapArea: {
    flex: 1,
  },
  rightTapArea: {
    flex: 1,
  },
  pauseIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    zIndex: 3,
  },
}); 