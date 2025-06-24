import { useState, useEffect, useCallback } from 'react';
import { 
  getFriendsActiveStories,
  getUserActiveStory,
  createOrAddToStory,
  markStoryAsViewed,
  getStoryViewers,
  type Story,
  type StoryView
} from '../../services/firebase/firestore.service';

export interface StoryWithUser extends Story {
  username: string;
}

/**
 * Custom hook for managing stories functionality.
 * Handles fetching, creating, and viewing stories.
 */
export function useStories(currentUserId: string) {
  const [friendsStories, setFriendsStories] = useState<StoryWithUser[]>([]);
  const [userStory, setUserStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load friends' active stories
   */
  const loadFriendsStories = useCallback(async () => {
    try {
      setLoading(true);
      const stories = await getFriendsActiveStories(currentUserId);
      setFriendsStories(stories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stories');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  /**
   * Load user's own active story
   */
  const loadUserStory = useCallback(async () => {
    try {
      const story = await getUserActiveStory(currentUserId);
      setUserStory(story);
    } catch (err) {
      console.error('Failed to load user story:', err);
    }
  }, [currentUserId]);

  /**
   * Create or add to story
   */
  const addToStory = useCallback(async (snapData: {
    storageUrl: string;
    mediaType: 'photo' | 'video';
    duration: number;
  }) => {
    try {
      await createOrAddToStory(currentUserId, snapData);
      // Refresh user's story
      await loadUserStory();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to story');
      return false;
    }
  }, [currentUserId, loadUserStory]);

  /**
   * Mark a story as viewed
   */
  const viewStory = useCallback(async (storyId: string, snapIndex: number) => {
    try {
      await markStoryAsViewed(storyId, currentUserId, snapIndex);
    } catch (err) {
      console.error('Failed to mark story as viewed:', err);
    }
  }, [currentUserId]);

  /**
   * Get viewers for a story (analytics)
   */
  const getViewers = useCallback(async (storyId: string): Promise<(StoryView & { username: string })[]> => {
    try {
      return await getStoryViewers(storyId);
    } catch (err) {
      console.error('Failed to get story viewers:', err);
      return [];
    }
  }, []);

  /**
   * Refresh all stories
   */
  const refreshStories = useCallback(async () => {
    await Promise.all([
      loadFriendsStories(),
      loadUserStory()
    ]);
  }, [loadFriendsStories, loadUserStory]);

  // Load stories on mount and when user changes
  useEffect(() => {
    if (currentUserId) {
      refreshStories();
    }
  }, [currentUserId, refreshStories]);

  return {
    friendsStories,
    userStory,
    loading,
    error,
    addToStory,
    viewStory,
    getViewers,
    refreshStories,
  };
} 