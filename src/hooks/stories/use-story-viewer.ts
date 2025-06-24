import { useState, useEffect, useCallback, useRef } from 'react';
import { markStoryAsViewed } from '../../services/firebase/firestore.service';

export interface StoryViewerState {
  currentStoryIndex: number;
  currentSnapIndex: number;
  isPlaying: boolean;
  progress: number;
}

/**
 * Custom hook for managing story viewer functionality.
 * Handles story progression, timers, and viewing analytics.
 */
export function useStoryViewer(
  stories: Array<{
    id: string;
    username: string;
    snaps: Array<{
      snapId: string;
      storageUrl: string;
      mediaType: 'photo' | 'video';
      duration: number;
    }>;
  }>,
  initialStoryIndex: number,
  currentUserId: string
) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [currentSnapIndex, setCurrentSnapIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const currentStory = stories[currentStoryIndex];
  const currentSnap = currentStory?.snaps[currentSnapIndex];

  /**
   * Start the timer for current snap
   */
  const startTimer = useCallback(() => {
    if (!currentSnap || !isPlaying) return;

    startTimeRef.current = Date.now();
    setProgress(0);

    // Progress update interval
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const duration = currentSnap.mediaType === 'photo' 
        ? currentSnap.duration * 1000 
        : currentSnap.duration * 1000; // Duration is already in seconds for videos
      
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
    }, 50);

    // Auto advance timer
    const duration = currentSnap.mediaType === 'photo' 
      ? currentSnap.duration * 1000 
      : currentSnap.duration * 1000;

    timerRef.current = setTimeout(() => {
      goToNextSnap();
    }, duration);
  }, [currentSnap, isPlaying]);

  /**
   * Clear all timers
   */
  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  /**
   * Go to next snap or story
   */
  const goToNextSnap = useCallback(() => {
    clearTimers();

    if (currentSnapIndex < currentStory.snaps.length - 1) {
      // Next snap in current story
      setCurrentSnapIndex(prev => prev + 1);
    } else if (currentStoryIndex < stories.length - 1) {
      // Next story
      setCurrentStoryIndex(prev => prev + 1);
      setCurrentSnapIndex(0);
    } else {
      // End of all stories
      setIsPlaying(false);
      return 'end';
    }
    return 'continue';
  }, [currentSnapIndex, currentStory, currentStoryIndex, stories.length, clearTimers]);

  /**
   * Go to previous snap or story
   */
  const goToPreviousSnap = useCallback(() => {
    clearTimers();

    if (currentSnapIndex > 0) {
      // Previous snap in current story
      setCurrentSnapIndex(prev => prev - 1);
    } else if (currentStoryIndex > 0) {
      // Previous story (go to last snap)
      setCurrentStoryIndex(prev => prev - 1);
      setCurrentSnapIndex(stories[currentStoryIndex - 1].snaps.length - 1);
    } else {
      // Already at beginning
      setCurrentSnapIndex(0);
    }
  }, [currentSnapIndex, currentStoryIndex, stories, clearTimers]);

  /**
   * Toggle play/pause
   */
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      clearTimers();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  }, [isPlaying, clearTimers]);

  /**
   * Mark current story as viewed
   */
  const markAsViewed = useCallback(async () => {
    if (currentStory && currentUserId) {
      try {
        await markStoryAsViewed(currentStory.id, currentUserId, currentSnapIndex);
      } catch (error) {
        console.error('Failed to mark story as viewed:', error);
      }
    }
  }, [currentStory, currentUserId, currentSnapIndex]);

  /**
   * Jump to specific story
   */
  const jumpToStory = useCallback((storyIndex: number) => {
    if (storyIndex >= 0 && storyIndex < stories.length) {
      clearTimers();
      setCurrentStoryIndex(storyIndex);
      setCurrentSnapIndex(0);
      setProgress(0);
    }
  }, [stories.length, clearTimers]);

  // Start timer when snap changes or play state changes
  useEffect(() => {
    if (isPlaying && currentSnap) {
      startTimer();
    } else {
      clearTimers();
    }

    return () => clearTimers();
  }, [currentSnap, isPlaying, startTimer, clearTimers]);

  // Mark as viewed when snap changes
  useEffect(() => {
    markAsViewed();
  }, [markAsViewed]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  return {
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
  };
} 