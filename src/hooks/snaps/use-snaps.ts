/**
 * Snap Management Hook
 * Handles all snap-related operations including sending, receiving, and viewing
 */

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { uploadSnap, UploadProgress } from '../../services/firebase/storage.service';
import {
  createSnap,
  getReceivedSnaps,
  getSentSnaps,
  markSnapAsViewed,
  deleteSnapImmediately,
  Snap,
  CreateSnapData
} from '../../services/firebase/snaps.service';

export interface SendSnapData {
  recipientIds: string[];
  mediaUri: string;
  mediaType: 'photo' | 'video';
  duration: number;
  hasText?: boolean;
  hasDrawing?: boolean;
}

export interface UseSnapsReturn {
  // State
  receivedSnaps: Snap[];
  sentSnaps: Snap[];
  isLoading: boolean;
  error: string | null;
  uploadProgress: UploadProgress | null;
  
  // Actions
  sendSnap: (snapData: SendSnapData) => Promise<void>;
  viewSnap: (snapId: string) => Promise<Snap | null>;
  refreshSnaps: () => Promise<void>;
  clearError: () => void;
  
  // Utilities
  getSnapStatusText: (snap: Snap) => string;
  isSnapExpired: (snap: Snap) => boolean;
}

/**
 * Hook for managing snap operations
 */
export function useSnaps(): UseSnapsReturn {
  const [receivedSnaps, setReceivedSnaps] = useState<Snap[]>([]);
  const [sentSnaps, setSentSnaps] = useState<Snap[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  const currentUser = useSelector((state: RootState) => state.auth.user);

  /**
   * Load received snaps for current user
   */
  const loadReceivedSnaps = useCallback(async () => {
    if (!currentUser?.uid) return;

    try {
      const snaps = await getReceivedSnaps(currentUser.uid);
      setReceivedSnaps(snaps);
    } catch (err) {
      console.error('Error loading received snaps:', err);
      setError('Failed to load received snaps');
    }
  }, [currentUser?.uid]);

  /**
   * Load sent snaps for current user
   */
  const loadSentSnaps = useCallback(async () => {
    if (!currentUser?.uid) return;

    try {
      const snaps = await getSentSnaps(currentUser.uid);
      setSentSnaps(snaps);
    } catch (err) {
      console.error('Error loading sent snaps:', err);
      setError('Failed to load sent snaps');
    }
  }, [currentUser?.uid]);

  /**
   * Refresh all snaps
   */
  const refreshSnaps = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        loadReceivedSnaps(),
        loadSentSnaps()
      ]);
    } catch (err) {
      setError('Failed to refresh snaps');
    } finally {
      setIsLoading(false);
    }
  }, [loadReceivedSnaps, loadSentSnaps]);

  /**
   * Send a snap to multiple recipients
   */
  const sendSnap = useCallback(async (snapData: SendSnapData) => {
    if (!currentUser?.uid) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    setError(null);
    setUploadProgress(null);

    try {
      // Upload media to Firebase Storage
      const uploadResult = await uploadSnap(
        snapData.mediaUri,
        currentUser.uid,
        snapData.mediaType,
        (progress) => setUploadProgress(progress)
      );

      // Create snap documents for each recipient
      const createSnapPromises = snapData.recipientIds.map(recipientId => {
        const snapDocData: CreateSnapData = {
          recipientId,
          mediaType: snapData.mediaType,
          downloadURL: uploadResult.downloadURL,
          storagePath: uploadResult.storagePath,
          duration: snapData.duration,
          hasText: snapData.hasText,
          hasDrawing: snapData.hasDrawing
        };

        return createSnap(currentUser.uid, snapDocData);
      });

      await Promise.all(createSnapPromises);

      // Refresh sent snaps to show new ones
      await loadSentSnaps();

      console.log(`Snap sent to ${snapData.recipientIds.length} recipients`);
    } catch (err) {
      console.error('Error sending snap:', err);
      setError(err instanceof Error ? err.message : 'Failed to send snap');
      throw err;
    } finally {
      setIsLoading(false);
      setUploadProgress(null);
    }
  }, [currentUser?.uid, loadSentSnaps]);

  /**
   * View a snap (marks as viewed and handles ephemeral logic)
   */
  const viewSnap = useCallback(async (snapId: string): Promise<Snap | null> => {
    if (!currentUser?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      // Mark snap as viewed
      const viewedSnap = await markSnapAsViewed(snapId, currentUser.uid);
      
      if (viewedSnap) {
        // Remove from received snaps list
        setReceivedSnaps(prev => prev.filter(snap => snap.id !== snapId));
        
        // For immediate ephemeral behavior, delete after a delay
        // In a real app, this might be handled by a timer in the viewing component
        setTimeout(async () => {
          try {
            await deleteSnapImmediately(snapId, currentUser.uid);
          } catch (error) {
            console.warn('Failed to delete snap after viewing:', error);
          }
        }, viewedSnap.duration * 1000); // Delete after duration expires
      }

      return viewedSnap;
    } catch (err) {
      console.error('Error viewing snap:', err);
      setError(err instanceof Error ? err.message : 'Failed to view snap');
      throw err;
    }
  }, [currentUser?.uid]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Get user-friendly status text for a snap
   */
  const getSnapStatusText = useCallback((snap: Snap): string => {
    switch (snap.status) {
      case 'sending':
        return 'Sending...';
      case 'sent':
        return 'Sent';
      case 'delivered':
        return 'Delivered';
      case 'opened':
        return 'Opened';
      case 'expired':
        return 'Expired';
      default:
        return 'Unknown';
    }
  }, []);

  /**
   * Check if a snap is expired
   */
  const isSnapExpired = useCallback((snap: Snap): boolean => {
    const now = new Date();
    const expiresAt = snap.expiresAt.toDate();
    return now > expiresAt;
  }, []);

  // Load snaps on mount and when user changes
  useEffect(() => {
    if (currentUser?.uid) {
      refreshSnaps();
    }
  }, [currentUser?.uid, refreshSnaps]);

  // Auto-refresh received snaps periodically
  useEffect(() => {
    if (!currentUser?.uid) return;

    const interval = setInterval(() => {
      loadReceivedSnaps();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [currentUser?.uid, loadReceivedSnaps]);

  return {
    // State
    receivedSnaps,
    sentSnaps,
    isLoading,
    error,
    uploadProgress,
    
    // Actions
    sendSnap,
    viewSnap,
    refreshSnaps,
    clearError,
    
    // Utilities
    getSnapStatusText,
    isSnapExpired
  };
} 