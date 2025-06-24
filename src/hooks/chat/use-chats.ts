import { useState, useEffect, useCallback } from 'react';
import { 
  subscribeToUserChats,
  createOrGetChat,
  getUserProfile,
  type Chat,
  type UserProfile
} from '../../services/firebase/firestore.service';

export interface ChatWithUser extends Chat {
  otherUser: UserProfile;
  unreadCount: number;
}

/**
 * Custom hook for managing user's chat list.
 * Provides real-time chat updates and chat creation functionality.
 */
export function useChats(currentUserId: string) {
  const [chats, setChats] = useState<ChatWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to user's chats
  useEffect(() => {
    if (!currentUserId) {
      setChats([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const unsubscribe = subscribeToUserChats(currentUserId, async (rawChats) => {
        try {
          // Enrich chats with other user information
          const enrichedChats: ChatWithUser[] = [];
          
          for (const chat of rawChats) {
            const otherUserId = chat.participants.find(id => id !== currentUserId);
            if (otherUserId) {
              const otherUser = await getUserProfile(otherUserId);
              if (otherUser) {
                // Ensure username exists, provide fallback if missing
                const enrichedUser = {
                  ...otherUser,
                  username: otherUser.username || `User_${otherUserId.slice(-6)}`,
                  displayName: otherUser.displayName || otherUser.username || `User_${otherUserId.slice(-6)}`,
                };
                
                enrichedChats.push({
                  ...chat,
                  otherUser: enrichedUser,
                  unreadCount: 0, // This would be calculated from messages
                });
              } else {
                console.warn(`Could not load profile for user: ${otherUserId}`);
              }
            }
          }

          setChats(enrichedChats);
          setLoading(false);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load chat details');
          setLoading(false);
        }
      });

      return unsubscribe;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chats');
      setLoading(false);
    }
  }, [currentUserId]);

  /**
   * Create or get a chat with another user
   */
  const createChat = useCallback(async (otherUserId: string): Promise<string> => {
    try {
      const chatId = await createOrGetChat(currentUserId, otherUserId);
      return chatId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create chat';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [currentUserId]);

  /**
   * Format last message timestamp
   */
  const formatTimestamp = useCallback((timestamp: any): string => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  }, []);

  return {
    chats,
    loading,
    error,
    createChat,
    formatTimestamp,
  };
} 