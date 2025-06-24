import { useState, useEffect, useCallback } from 'react';
import { 
  searchUsersByUsername, 
  sendFriendRequest, 
  acceptFriendRequest, 
  declineFriendRequest, 
  getUserFriends, 
  getPendingFriendRequests,
  UserProfile,
  Friendship
} from '../../services/firebase/firestore.service';
import { useAuth } from '../auth/use-auth';

/**
 * Hook for managing friend operations including search, requests, and friends list.
 * Provides comprehensive friend management functionality with loading states and error handling.
 * Integrates with Firebase Firestore for real-time friend data.
 */

interface UseFriendsReturn {
  // Friends data
  friends: UserProfile[];
  pendingRequests: Friendship[];
  searchResults: UserProfile[];
  
  // Loading states
  isLoadingFriends: boolean;
  isLoadingRequests: boolean;
  isSearching: boolean;
  isSendingRequest: boolean;
  isProcessingRequest: boolean;
  
  // Error states
  friendsError: string | null;
  requestsError: string | null;
  searchError: string | null;
  
  // Actions
  searchUsers: (username: string) => Promise<void>;
  sendRequest: (toUserId: string) => Promise<void>;
  acceptRequest: (friendshipId: string) => Promise<void>;
  declineRequest: (friendshipId: string) => Promise<void>;
  refreshFriends: () => Promise<void>;
  refreshRequests: () => Promise<void>;
  clearSearch: () => void;
}

export function useFriends(): UseFriendsReturn {
  const { user } = useAuth();
  
  // Data state
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  
  // Loading states
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [isProcessingRequest, setIsProcessingRequest] = useState(false);
  
  // Error states
  const [friendsError, setFriendsError] = useState<string | null>(null);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  /**
   * Load user's friends list
   */
  const refreshFriends = useCallback(async () => {
    if (!user?.uid) return;
    
    setIsLoadingFriends(true);
    setFriendsError(null);
    
    try {
      const userFriends = await getUserFriends(user.uid);
      setFriends(userFriends);
    } catch (error) {
      console.error('Error loading friends:', error);
      setFriendsError('Failed to load friends');
    } finally {
      setIsLoadingFriends(false);
    }
  }, [user?.uid]);

  /**
   * Load pending friend requests
   */
  const refreshRequests = useCallback(async () => {
    if (!user?.uid) return;
    
    setIsLoadingRequests(true);
    setRequestsError(null);
    
    try {
      const requests = await getPendingFriendRequests(user.uid);
      setPendingRequests(requests);
    } catch (error) {
      console.error('Error loading friend requests:', error);
      setRequestsError('Failed to load friend requests');
    } finally {
      setIsLoadingRequests(false);
    }
  }, [user?.uid]);

  /**
   * Search for users by username
   */
  const searchUsers = useCallback(async (username: string) => {
    if (!username.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      const results = await searchUsersByUsername(username.trim());
      // Filter out current user and existing friends
      const filteredResults = results.filter(result => {
        if (result.uid === user?.uid) return false;
        return !friends.some(friend => friend.uid === result.uid);
      });
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchError('Failed to search users');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [user?.uid, friends]);

  /**
   * Send friend request to user
   */
  const sendRequest = useCallback(async (toUserId: string) => {
    if (!user?.uid) return;
    
    setIsSendingRequest(true);
    
    try {
      await sendFriendRequest(user.uid, toUserId);
      // Remove from search results after sending request
      setSearchResults(prev => prev.filter(result => result.uid !== toUserId));
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw new Error('Failed to send friend request');
    } finally {
      setIsSendingRequest(false);
    }
  }, [user?.uid]);

  /**
   * Accept friend request
   */
  const acceptRequest = useCallback(async (friendshipId: string) => {
    setIsProcessingRequest(true);
    
    try {
      await acceptFriendRequest(friendshipId);
      // Refresh both friends and requests
      await Promise.all([refreshFriends(), refreshRequests()]);
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw new Error('Failed to accept friend request');
    } finally {
      setIsProcessingRequest(false);
    }
  }, [refreshFriends, refreshRequests]);

  /**
   * Decline friend request
   */
  const declineRequest = useCallback(async (friendshipId: string) => {
    setIsProcessingRequest(true);
    
    try {
      await declineFriendRequest(friendshipId);
      // Refresh requests to remove declined request
      await refreshRequests();
    } catch (error) {
      console.error('Error declining friend request:', error);
      throw new Error('Failed to decline friend request');
    } finally {
      setIsProcessingRequest(false);
    }
  }, [refreshRequests]);

  /**
   * Clear search results
   */
  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchError(null);
  }, []);

  // Load initial data when user changes
  useEffect(() => {
    if (user?.uid) {
      refreshFriends();
      refreshRequests();
    }
  }, [user?.uid, refreshFriends, refreshRequests]);

  return {
    // Data
    friends,
    pendingRequests,
    searchResults,
    
    // Loading states
    isLoadingFriends,
    isLoadingRequests,
    isSearching,
    isSendingRequest,
    isProcessingRequest,
    
    // Error states
    friendsError,
    requestsError,
    searchError,
    
    // Actions
    searchUsers,
    sendRequest,
    acceptRequest,
    declineRequest,
    refreshFriends,
    refreshRequests,
    clearSearch,
  };
} 