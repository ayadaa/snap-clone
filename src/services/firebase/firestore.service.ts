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