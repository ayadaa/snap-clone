import { 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  onSnapshot,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../config/firebase';

/**
 * Firestore Service for database operations.
 * Handles user profiles, friendships, chats, and other data operations.
 * Provides type-safe interfaces for all database interactions.
 */

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  displayName?: string;
  profilePicture?: string;
  createdAt: Timestamp;
  lastSeen: Timestamp;
  isOnline: boolean;
}

export interface Friendship {
  id: string;
  userIds: [string, string];
  status: 'pending' | 'accepted';
  requestedBy: string;
  createdAt: Timestamp;
  acceptedAt?: Timestamp;
}

export interface Chat {
  id: string;
  participants: [string, string];
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: Timestamp;
    type: 'text' | 'snap';
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  snapId?: string;
  timestamp: Timestamp;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'snap';
}

export interface Story {
  id: string;
  userId: string;
  snaps: StorySnap[];
  createdAt: Timestamp;
  expiresAt: Timestamp;
  viewCount: number;
  viewers: string[]; // userIds who have viewed
}

export interface StorySnap {
  snapId: string;
  storageUrl: string;
  mediaType: 'photo' | 'video';
  duration: number;
  createdAt: Timestamp;
}

export interface StoryView {
  id: string;
  storyId: string;
  viewerId: string;
  viewedAt: Timestamp;
  snapIndex: number; // which snap in the story was viewed
}

/**
 * Check if a username is available
 */
export async function checkUsernameAvailability(username: string): Promise<boolean> {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('username', '==', username),
      limit(1)
    );
    
    const querySnapshot = await getDocs(usersQuery);
    return querySnapshot.empty;
  } catch (error) {
    console.error('Username availability check error:', error);
    throw new Error('Failed to check username availability');
  }
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      return { uid: userDoc.id, ...userDoc.data() } as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Get user profile error:', error);
    throw new Error('Failed to get user profile');
  }
}

/**
 * Search users by username
 */
export async function searchUsersByUsername(username: string): Promise<UserProfile[]> {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('username', '>=', username),
      where('username', '<=', username + '\uf8ff'),
      limit(10)
    );
    
    const querySnapshot = await getDocs(usersQuery);
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    })) as UserProfile[];
  } catch (error) {
    console.error('Search users error:', error);
    throw new Error('Failed to search users');
  }
}

/**
 * Send friend request
 */
export async function sendFriendRequest(fromUserId: string, toUserId: string): Promise<void> {
  try {
    const friendshipId = [fromUserId, toUserId].sort().join('_');
    
    await setDoc(doc(db, 'friendships', friendshipId), {
      userIds: [fromUserId, toUserId],
      status: 'pending',
      requestedBy: fromUserId,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Send friend request error:', error);
    throw new Error('Failed to send friend request');
  }
}

/**
 * Accept friend request
 */
export async function acceptFriendRequest(friendshipId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'friendships', friendshipId), {
      status: 'accepted',
      acceptedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Accept friend request error:', error);
    throw new Error('Failed to accept friend request');
  }
}

/**
 * Decline friend request
 */
export async function declineFriendRequest(friendshipId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'friendships', friendshipId));
  } catch (error) {
    console.error('Decline friend request error:', error);
    throw new Error('Failed to decline friend request');
  }
}

/**
 * Get user's friends
 */
export async function getUserFriends(userId: string): Promise<UserProfile[]> {
  try {
    const friendshipsQuery = query(
      collection(db, 'friendships'),
      where('userIds', 'array-contains', userId),
      where('status', '==', 'accepted')
    );
    
    const querySnapshot = await getDocs(friendshipsQuery);
    const friendIds: string[] = [];
    
    querySnapshot.docs.forEach(doc => {
      const friendship = doc.data() as Friendship;
      const friendId = friendship.userIds.find(id => id !== userId);
      if (friendId) friendIds.push(friendId);
    });
    
    // Get friend profiles
    const friendProfiles: UserProfile[] = [];
    for (const friendId of friendIds) {
      const profile = await getUserProfile(friendId);
      if (profile) friendProfiles.push(profile);
    }
    
    return friendProfiles;
  } catch (error) {
    console.error('Get user friends error:', error);
    throw new Error('Failed to get user friends');
  }
}

/**
 * Get pending friend requests for user
 */
export async function getPendingFriendRequests(userId: string): Promise<Friendship[]> {
  try {
    const requestsQuery = query(
      collection(db, 'friendships'),
      where('userIds', 'array-contains', userId),
      where('status', '==', 'pending')
    );
    
    const querySnapshot = await getDocs(requestsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Friendship[];
  } catch (error) {
    console.error('Get pending friend requests error:', error);
    throw new Error('Failed to get pending friend requests');
  }
}

/**
 * Update user online status
 */
export async function updateUserOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', userId), {
      isOnline,
      lastSeen: serverTimestamp(),
    });
  } catch (error) {
    console.error('Update online status error:', error);
    throw new Error('Failed to update online status');
  }
}

/**
 * Create or get chat between two users
 */
export async function createOrGetChat(userId1: string, userId2: string): Promise<string> {
  try {
    const chatId = [userId1, userId2].sort().join('_');
    const chatRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);
    
    if (!chatDoc.exists()) {
      await setDoc(chatRef, {
        participants: [userId1, userId2],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    
    return chatId;
  } catch (error) {
    console.error('Create or get chat error:', error);
    throw new Error('Failed to create or get chat');
  }
}

/**
 * Send a text message to a chat
 */
export async function sendMessage(
  chatId: string, 
  senderId: string, 
  text: string
): Promise<string> {
  try {
    const messageRef = doc(collection(db, 'chats', chatId, 'messages'));
    const messageData = {
      senderId,
      text,
      timestamp: serverTimestamp(),
      status: 'sent' as const,
      type: 'text' as const,
    };
    
    await setDoc(messageRef, messageData);
    
    // Update chat's last message
    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: {
        text,
        senderId,
        timestamp: serverTimestamp(),
        type: 'text',
      },
      updatedAt: serverTimestamp(),
    });
    
    return messageRef.id;
  } catch (error) {
    console.error('Send message error:', error);
    throw new Error('Failed to send message');
  }
}

/**
 * Get messages for a chat with real-time listener
 */
export function subscribeToMessages(
  chatId: string,
  callback: (messages: Message[]) => void
): () => void {
  try {
    const messagesQuery = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    
    return onSnapshot(messagesQuery, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      
      callback(messages);
    });
  } catch (error) {
    console.error('Subscribe to messages error:', error);
    throw new Error('Failed to subscribe to messages');
  }
}

/**
 * Get user's chats with real-time listener
 */
export function subscribeToUserChats(
  userId: string,
  callback: (chats: Chat[]) => void
): () => void {
  try {
    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    
    return onSnapshot(chatsQuery, (snapshot) => {
      const chats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Chat[];
      
      callback(chats);
    });
  } catch (error) {
    console.error('Subscribe to user chats error:', error);
    throw new Error('Failed to subscribe to user chats');
  }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(
  chatId: string, 
  messageIds: string[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    
    messageIds.forEach(messageId => {
      const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
      batch.update(messageRef, { status: 'read' });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Mark messages as read error:', error);
    throw new Error('Failed to mark messages as read');
  }
}

/**
 * Get chat by ID
 */
export async function getChat(chatId: string): Promise<Chat | null> {
  try {
    const chatDoc = await getDoc(doc(db, 'chats', chatId));
    
    if (chatDoc.exists()) {
      return { id: chatDoc.id, ...chatDoc.data() } as Chat;
    }
    
    return null;
  } catch (error) {
    console.error('Get chat error:', error);
    throw new Error('Failed to get chat');
  }
}

/**
 * Create a new story or add snap to existing story
 */
export async function createOrAddToStory(
  userId: string,
  snapData: {
    storageUrl: string;
    mediaType: 'photo' | 'video';
    duration: number;
  }
): Promise<string> {
  try {
    // Check if user has an active story (within last 24 hours)
    const now = Timestamp.now();
    
    const activeStoriesQuery = query(
      collection(db, 'stories'),
      where('userId', '==', userId),
      where('expiresAt', '>', now),
      limit(1)
    );
    
    const activeStoriesSnapshot = await getDocs(activeStoriesQuery);
    
    const newSnap: StorySnap = {
      snapId: `snap_${Date.now()}`,
      storageUrl: snapData.storageUrl,
      mediaType: snapData.mediaType,
      duration: snapData.duration,
      createdAt: Timestamp.now(),
    };
    
    if (!activeStoriesSnapshot.empty) {
      // Add to existing story
      const storyDoc = activeStoriesSnapshot.docs[0];
      const storyData = storyDoc.data() as Story;
      
      await updateDoc(storyDoc.ref, {
        snaps: [...storyData.snaps, newSnap],
      });
      
      return storyDoc.id;
    } else {
      // Create new story
      const storyRef = doc(collection(db, 'stories'));
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      await setDoc(storyRef, {
        userId,
        snaps: [newSnap],
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt),
        viewCount: 0,
        viewers: [],
      });
      
      return storyRef.id;
    }
  } catch (error) {
    console.error('Create or add to story error:', error);
    throw new Error('Failed to create or add to story');
  }
}

/**
 * Get all active stories from user's friends
 */
export async function getFriendsActiveStories(userId: string): Promise<(Story & { username: string })[]> {
  try {
    // First get user's friends
    const friends = await getUserFriends(userId);
    const friendIds = friends.map(friend => friend.uid);
    
    if (friendIds.length === 0) {
      return [];
    }
    
    // Get active stories from friends
    const now = Timestamp.now();
    const storiesQuery = query(
      collection(db, 'stories'),
      where('userId', 'in', friendIds),
      where('expiresAt', '>', now),
      orderBy('expiresAt', 'desc')
    );
    
    const storiesSnapshot = await getDocs(storiesQuery);
    const stories: (Story & { username: string })[] = [];
    
    for (const storyDoc of storiesSnapshot.docs) {
      const storyData = { id: storyDoc.id, ...storyDoc.data() } as Story;
      const friend = friends.find(f => f.uid === storyData.userId);
      
      if (friend) {
        stories.push({
          ...storyData,
          username: friend.username,
        });
      }
    }
    
    return stories;
  } catch (error) {
    console.error('Get friends active stories error:', error);
    throw new Error('Failed to get friends active stories');
  }
}

/**
 * Get user's own active story
 */
export async function getUserActiveStory(userId: string): Promise<Story | null> {
  try {
    const now = Timestamp.now();
    const storiesQuery = query(
      collection(db, 'stories'),
      where('userId', '==', userId),
      where('expiresAt', '>', now),
      limit(1)
    );
    
    const storiesSnapshot = await getDocs(storiesQuery);
    
    if (storiesSnapshot.empty) {
      return null;
    }
    
    const storyDoc = storiesSnapshot.docs[0];
    return { id: storyDoc.id, ...storyDoc.data() } as Story;
  } catch (error) {
    console.error('Get user active story error:', error);
    throw new Error('Failed to get user active story');
  }
}

/**
 * Mark story as viewed by user
 */
export async function markStoryAsViewed(
  storyId: string,
  viewerId: string,
  snapIndex: number
): Promise<void> {
  try {
    // Check if user has already viewed this story
    const existingViewQuery = query(
      collection(db, 'story_views'),
      where('storyId', '==', storyId),
      where('viewerId', '==', viewerId),
      limit(1)
    );
    
    const existingViewSnapshot = await getDocs(existingViewQuery);
    
    if (existingViewSnapshot.empty) {
      // Create new view record
      const viewRef = doc(collection(db, 'story_views'));
      await setDoc(viewRef, {
        storyId,
        viewerId,
        viewedAt: serverTimestamp(),
        snapIndex,
      });
      
      // Update story viewer count
      const storyRef = doc(db, 'stories', storyId);
      const storyDoc = await getDoc(storyRef);
      
      if (storyDoc.exists()) {
        const storyData = storyDoc.data() as Story;
        await updateDoc(storyRef, {
          viewCount: storyData.viewCount + 1,
          viewers: [...storyData.viewers, viewerId],
        });
      }
    } else {
      // Update existing view record with latest snap index
      const viewDoc = existingViewSnapshot.docs[0];
      await updateDoc(viewDoc.ref, {
        snapIndex,
        viewedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Mark story as viewed error:', error);
    throw new Error('Failed to mark story as viewed');
  }
}

/**
 * Get story viewers for analytics
 */
export async function getStoryViewers(storyId: string): Promise<(StoryView & { username: string })[]> {
  try {
    const viewsQuery = query(
      collection(db, 'story_views'),
      where('storyId', '==', storyId),
      orderBy('viewedAt', 'desc')
    );
    
    const viewsSnapshot = await getDocs(viewsQuery);
    const viewers: (StoryView & { username: string })[] = [];
    
    for (const viewDoc of viewsSnapshot.docs) {
      const viewData = { id: viewDoc.id, ...viewDoc.data() } as StoryView;
      const userProfile = await getUserProfile(viewData.viewerId);
      
      if (userProfile) {
        viewers.push({
          ...viewData,
          username: userProfile.username,
        });
      }
    }
    
    return viewers;
  } catch (error) {
    console.error('Get story viewers error:', error);
    throw new Error('Failed to get story viewers');
  }
}

/**
 * Delete expired stories (for cleanup)
 */
export async function deleteExpiredStories(): Promise<void> {
  try {
    const now = Timestamp.now();
    const expiredStoriesQuery = query(
      collection(db, 'stories'),
      where('expiresAt', '<=', now)
    );
    
    const expiredStoriesSnapshot = await getDocs(expiredStoriesQuery);
    const batch = writeBatch(db);
    
    // Delete story documents
    expiredStoriesSnapshot.docs.forEach(storyDoc => {
      batch.delete(storyDoc.ref);
    });
    
    // Delete associated story views
    for (const storyDoc of expiredStoriesSnapshot.docs) {
      const viewsQuery = query(
        collection(db, 'story_views'),
        where('storyId', '==', storyDoc.id)
      );
      
      const viewsSnapshot = await getDocs(viewsQuery);
      viewsSnapshot.docs.forEach(viewDoc => {
        batch.delete(viewDoc.ref);
      });
    }
    
    await batch.commit();
  } catch (error) {
    console.error('Delete expired stories error:', error);
    throw new Error('Failed to delete expired stories');
  }
} 