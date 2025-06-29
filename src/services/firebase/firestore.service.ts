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
  writeBatch,
  arrayUnion,
  arrayRemove,
  increment
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
  challengeSnapId?: string;
  timestamp: Timestamp;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'snap' | 'challenge';
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
 * Snap data interface for storing snap metadata
 */
export interface SnapData {
  id: string;
  senderId: string;
  storageUrl: string;
  mediaType: 'photo' | 'video';
  duration?: number;
  createdAt: Timestamp;
  expiresAt?: Timestamp; // For ephemeral snaps
  viewCount: number;
  viewers: string[]; // userIds who have viewed this snap
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  participants: string[];
  admins: string[];
  createdAt: Timestamp;
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: Timestamp;
    type: 'text' | 'snap' | 'system';
  };
  settings: {
    allowNewMembers: boolean;
    onlyAdminsCanMessage: boolean;
    allowSnapSharing: boolean;
  };
}

export interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  text?: string;
  snapId?: string;
  timestamp: Timestamp;
  readBy: Array<{
    userId: string;
    readAt: Timestamp;
  }>;
  type: 'text' | 'snap' | 'system';
  systemMessageType?: 'member_added' | 'member_left' | 'name_changed' | 'admin_added';
  metadata?: {
    addedMembers?: string[];
    removedMember?: string;
    oldName?: string;
    newName?: string;
    newAdmin?: string;
  };
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
 * Send a snap message to a chat
 */
export async function sendSnapMessage(
  chatId: string,
  senderId: string,
  snapId: string
): Promise<string> {
  try {
    const messageRef = doc(collection(db, 'chats', chatId, 'messages'));
    const messageData = {
      senderId,
      snapId,
      timestamp: serverTimestamp(),
      status: 'sent' as const,
      type: 'snap' as const,
    };
    
    await setDoc(messageRef, messageData);
    
    // Update chat's last message
    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: {
        text: '📸 Snap', // Display text for snap messages
        senderId,
        timestamp: serverTimestamp(),
        type: 'snap',
      },
      updatedAt: serverTimestamp(),
    });
    
    return messageRef.id;
  } catch (error) {
    console.error('Send snap message error:', error);
    throw new Error('Failed to send snap message');
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
    const storyData = { id: storyDoc.id, ...storyDoc.data() } as Story;
    
    return storyData;
  } catch (error) {
    console.error('❌ Get user active story error:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : String(error),
      code: error instanceof Error && 'code' in error ? error.code : 'unknown'
    });
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

/**
 * Create a new group
 */
export async function createGroup(
  groupData: {
    name: string;
    description?: string;
    participants: string[];
  },
  createdBy: string
): Promise<string> {
  try {
    const groupRef = doc(collection(db, 'groups'));
    
    const group: Omit<Group, 'id'> = {
      name: groupData.name,
      ...(groupData.description && { description: groupData.description }),
      createdBy,
      participants: [createdBy, ...groupData.participants],
      admins: [createdBy],
      createdAt: serverTimestamp() as Timestamp,
      settings: {
        allowNewMembers: true,
        onlyAdminsCanMessage: false,
        allowSnapSharing: true,
      },
    };
    
    await setDoc(groupRef, group);
    
    // Fetch usernames for the added participants
    const addedUsernames: string[] = [];
    for (const userId of groupData.participants) {
      try {
        const userProfile = await getUserProfile(userId);
        if (userProfile) {
          addedUsernames.push(userProfile.username);
        } else {
          addedUsernames.push('Unknown User');
        }
      } catch (error) {
        console.warn(`Failed to get username for user ${userId}:`, error);
        addedUsernames.push('Unknown User');
      }
    }
    
    // Send system message about group creation with usernames
    await sendGroupMessage(groupRef.id, {
      senderId: createdBy,
      type: 'system',
      systemMessageType: 'member_added',
      metadata: {
        addedMembers: addedUsernames,
      },
    });
    
    return groupRef.id;
  } catch (error) {
    console.error('Create group error:', error);
    throw new Error('Failed to create group');
  }
}

/**
 * Get user's groups
 */
export async function getUserGroups(userId: string): Promise<Group[]> {
  try {
    const groupsQuery = query(
      collection(db, 'groups'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessage.timestamp', 'desc')
    );
    
    const groupsSnapshot = await getDocs(groupsQuery);
    return groupsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Group[];
  } catch (error) {
    console.error('Get user groups error:', error);
    throw new Error('Failed to get user groups');
  }
}

/**
 * Subscribe to user's groups with real-time listener
 */
export function subscribeToUserGroups(
  userId: string,
  callback: (groups: Group[]) => void
): () => void {
  try {
    const groupsQuery = query(
      collection(db, 'groups'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessage.timestamp', 'desc')
    );
    
    return onSnapshot(groupsQuery, (snapshot) => {
      const groups = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Group[];
      
      callback(groups);
    });
  } catch (error) {
    console.error('Subscribe to user groups error:', error);
    throw new Error('Failed to subscribe to user groups');
  }
}

/**
 * Send a message to a group
 */
export async function sendGroupMessage(
  groupId: string,
  messageData: {
    senderId: string;
    text?: string;
    snapId?: string;
    type: 'text' | 'snap' | 'system';
    systemMessageType?: 'member_added' | 'member_left' | 'name_changed' | 'admin_added';
    metadata?: {
      addedMembers?: string[];
      removedMember?: string;
      oldName?: string;
      newName?: string;
      newAdmin?: string;
    };
  }
): Promise<string> {
  try {
    const messageRef = doc(collection(db, 'groups', groupId, 'messages'));
    
    // Build message object without undefined fields
    const message: any = {
      groupId,
      senderId: messageData.senderId,
      timestamp: serverTimestamp() as Timestamp,
      readBy: [{
        userId: messageData.senderId,
        readAt: Timestamp.now(),
      }],
      type: messageData.type,
    };

    // Only include fields that have values
    if (messageData.text) {
      message.text = messageData.text;
    }
    if (messageData.snapId) {
      message.snapId = messageData.snapId;
    }
    if (messageData.systemMessageType) {
      message.systemMessageType = messageData.systemMessageType;
    }
    if (messageData.metadata) {
      message.metadata = messageData.metadata;
    }
    
    await setDoc(messageRef, message);
    
    // Update group's last message
    const groupRef = doc(db, 'groups', groupId);
    const lastMessage = {
      text: messageData.text || (messageData.type === 'system' ? 'System message' : 'Snap'),
      senderId: messageData.senderId,
      timestamp: serverTimestamp() as Timestamp,
      type: messageData.type,
    };
    
    await updateDoc(groupRef, {
      lastMessage,
    });
    
    return messageRef.id;
  } catch (error) {
    console.error('Send group message error:', error);
    throw new Error('Failed to send message');
  }
}

/**
 * Subscribe to group messages
 */
export function subscribeToGroupMessages(
  groupId: string,
  callback: (messages: GroupMessage[]) => void
): () => void {
  try {
    const messagesQuery = query(
      collection(db, 'groups', groupId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    
    return onSnapshot(messagesQuery, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GroupMessage[];
      
      callback(messages);
    });
  } catch (error) {
    console.error('Subscribe to group messages error:', error);
    throw new Error('Failed to subscribe to group messages');
  }
}

/**
 * Add members to group
 */
export async function addMembersToGroup(
  groupId: string,
  newMemberIds: string[],
  addedBy: string
): Promise<void> {
  try {
    const groupRef = doc(db, 'groups', groupId);
    const batch = writeBatch(db);
    
    // Update group participants
    batch.update(groupRef, {
      participants: arrayUnion(...newMemberIds),
    });
    
    // Send system message
    await sendGroupMessage(groupId, {
      senderId: addedBy,
      type: 'system',
      systemMessageType: 'member_added',
      metadata: {
        addedMembers: newMemberIds,
      },
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Add members to group error:', error);
    throw new Error('Failed to add members to group');
  }
}

/**
 * Remove member from group
 */
export async function removeMemberFromGroup(
  groupId: string,
  memberIdToRemove: string,
  removedBy: string
): Promise<void> {
  try {
    const groupRef = doc(db, 'groups', groupId);
    
    await updateDoc(groupRef, {
      participants: arrayRemove(memberIdToRemove),
      admins: arrayRemove(memberIdToRemove), // Also remove from admins if they were one
    });
    
    // Get the username of the removed member
    let removedUsername = 'Unknown User';
    try {
      const userProfile = await getUserProfile(memberIdToRemove);
      if (userProfile) {
        removedUsername = userProfile.username;
      }
    } catch (error) {
      console.warn(`Failed to get username for removed user ${memberIdToRemove}:`, error);
    }
    
    // Send system message
    await sendGroupMessage(groupId, {
      senderId: removedBy,
      type: 'system',
      systemMessageType: 'member_left',
      metadata: {
        removedMember: removedUsername, // Use username instead of UID
      },
    });
  } catch (error) {
    console.error('Remove member error:', error);
    throw new Error('Failed to remove member');
  }
}

/**
 * Update group settings
 */
export async function updateGroupSettings(
  groupId: string,
  settings: Partial<Group['settings']>
): Promise<void> {
  try {
    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, {
      settings: settings,
    });
  } catch (error) {
    console.error('Update group settings error:', error);
    throw new Error('Failed to update group settings');
  }
}

/**
 * Mark group messages as read
 */
export async function markGroupMessagesAsRead(
  groupId: string,
  userId: string,
  messageIds: string[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    
    for (const messageId of messageIds) {
      const messageRef = doc(db, 'groups', groupId, 'messages', messageId);
      batch.update(messageRef, {
        readBy: arrayUnion({
          userId,
          readAt: Timestamp.now(),
        }),
      });
    }
    
    await batch.commit();
  } catch (error) {
    console.error('Mark group messages as read error:', error);
    throw new Error('Failed to mark messages as read');
  }
}

/**
 * Store snap data for sharing across chats, groups, and stories
 */
export async function storeSnapData(snapData: {
  senderId: string;
  storageUrl: string;
  mediaType: 'photo' | 'video';
  duration?: number;
  expiresAt?: Date;
}): Promise<string> {
  try {
    const snapRef = doc(collection(db, 'snaps'));
    
    // Build snap document with only defined fields
    const snapDocument: any = {
      id: snapRef.id,
      senderId: snapData.senderId,
      storageUrl: snapData.storageUrl,
      mediaType: snapData.mediaType,
      createdAt: Timestamp.now(),
      viewCount: 0,
      viewers: [],
    };
    
    // Only include optional fields if they have values
    if (snapData.duration !== undefined) {
      snapDocument.duration = snapData.duration;
    }
    if (snapData.expiresAt) {
      snapDocument.expiresAt = Timestamp.fromDate(snapData.expiresAt);
    }
    
    await setDoc(snapRef, snapDocument);
    return snapRef.id;
  } catch (error) {
    console.error('Store snap data error:', error);
    throw new Error('Failed to store snap data');
  }
}

/**
 * Get snap data by ID
 */
export async function getSnapData(snapId: string): Promise<SnapData | null> {
  try {
    const snapDoc = await getDoc(doc(db, 'snaps', snapId));
    if (snapDoc.exists()) {
      return { id: snapDoc.id, ...snapDoc.data() } as SnapData;
    }
    return null;
  } catch (error) {
    console.error('Get snap data error:', error);
    throw new Error('Failed to get snap data');
  }
}

/**
 * Mark snap as viewed by user
 */
export async function markSnapAsViewed(snapId: string, viewerId: string): Promise<void> {
  try {
    const snapRef = doc(db, 'snaps', snapId);
    await updateDoc(snapRef, {
      viewers: arrayUnion(viewerId),
      viewCount: increment(1),
    });
  } catch (error) {
    console.error('Mark snap as viewed error:', error);
    throw new Error('Failed to mark snap as viewed');
  }
}

/**
 * Math Challenge related functions
 */

/**
 * Interface for math challenge data
 */
export interface MathChallenge {
  id: string;
  problem: string;
  concept: string;
  gradeLevel: string;
  solution?: string;
  correctAnswer?: string;
  explanation?: string;
  createdBy: string;
  createdAt: Timestamp;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  timeLimit?: number;
}

/**
 * Interface for challenge snap data
 */
export interface ChallengeSnap {
  id: string;
  challengeId: string;
  senderId: string;
  recipientId: string;
  status: 'sent' | 'viewed' | 'answered' | 'expired';
  sentAt: Timestamp;
  viewedAt?: Timestamp;
  answeredAt?: Timestamp;
  recipientAnswer?: string;
  isCorrect?: boolean;
  expiresAt: Timestamp;
}

/**
 * Create a new math challenge
 */
export async function createMathChallenge(challengeData: {
  problem: string;
  concept: string;
  gradeLevel: string;
  solution?: string;
  correctAnswer?: string;
  explanation?: string;
  createdBy: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  timeLimit?: number;
}): Promise<string> {
  try {
    const challengeRef = doc(collection(db, 'mathChallenges'));
    const challenge: Omit<MathChallenge, 'id'> = {
      ...challengeData,
      createdAt: serverTimestamp() as Timestamp,
    };
    
    await setDoc(challengeRef, challenge);
    return challengeRef.id;
  } catch (error) {
    console.error('Error creating math challenge:', error);
    throw new Error('Failed to create math challenge');
  }
}

/**
 * Send a challenge snap to a friend
 */
export async function sendChallengeSnap(
  challengeId: string,
  senderId: string,
  recipientId: string,
  chatId?: string
): Promise<string> {
  try {
    const challengeSnapRef = doc(collection(db, 'challengeSnaps'));
    const challengeSnap: Omit<ChallengeSnap, 'id'> = {
      challengeId,
      senderId,
      recipientId,
      status: 'sent',
      sentAt: serverTimestamp() as Timestamp,
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)), // 24 hours
    };
    
    await setDoc(challengeSnapRef, challengeSnap);

    // If chatId provided, also send a chat message
    if (chatId) {
      const messageRef = doc(collection(db, 'chats', chatId, 'messages'));
      const messageData = {
        senderId,
        challengeSnapId: challengeSnapRef.id,
        timestamp: serverTimestamp(),
        status: 'sent' as const,
        type: 'challenge' as const,
      };
      
      await setDoc(messageRef, messageData);
      
      // Update chat's last message
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: {
          text: '🎯 Math Challenge',
          senderId,
          timestamp: serverTimestamp(),
          type: 'challenge',
        },
        updatedAt: serverTimestamp(),
      });
    }

    return challengeSnapRef.id;
  } catch (error) {
    console.error('Error sending challenge snap:', error);
    throw new Error('Failed to send challenge snap');
  }
}

/**
 * Get math challenge by ID
 */
export async function getMathChallenge(challengeId: string): Promise<MathChallenge | null> {
  try {
    const challengeDoc = await getDoc(doc(db, 'mathChallenges', challengeId));
    if (!challengeDoc.exists()) {
      return null;
    }
    
    return {
      id: challengeDoc.id,
      ...challengeDoc.data(),
    } as MathChallenge;
  } catch (error) {
    console.error('Error getting math challenge:', error);
    throw new Error('Failed to get math challenge');
  }
}

/**
 * Get challenge snap by ID
 */
export async function getChallengeSnap(challengeSnapId: string): Promise<ChallengeSnap | null> {
  try {
    const challengeSnapDoc = await getDoc(doc(db, 'challengeSnaps', challengeSnapId));
    if (!challengeSnapDoc.exists()) {
      return null;
    }
    
    return {
      id: challengeSnapDoc.id,
      ...challengeSnapDoc.data(),
    } as ChallengeSnap;
  } catch (error) {
    console.error('Error getting challenge snap:', error);
    throw new Error('Failed to get challenge snap');
  }
}

/**
 * Submit an answer to a challenge snap
 */
export async function submitChallengeAnswer(
  challengeSnapId: string,
  answer: string
): Promise<{ isCorrect: boolean; explanation?: string }> {
  try {
    const challengeSnapDoc = await getDoc(doc(db, 'challengeSnaps', challengeSnapId));
    if (!challengeSnapDoc.exists()) {
      throw new Error('Challenge snap not found');
    }

    const challengeSnap = challengeSnapDoc.data() as ChallengeSnap;
    const challenge = await getMathChallenge(challengeSnap.challengeId);
    
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    // Check if answer is correct (basic string comparison for now)
    const isCorrect = challenge.correctAnswer?.toLowerCase().trim() === answer.toLowerCase().trim();

    // Update challenge snap with answer
    await updateDoc(doc(db, 'challengeSnaps', challengeSnapId), {
      recipientAnswer: answer,
      isCorrect,
      answeredAt: serverTimestamp(),
      status: 'answered',
    });

    return {
      isCorrect,
      explanation: challenge.explanation,
    };
  } catch (error) {
    console.error('Error submitting challenge answer:', error);
    throw new Error('Failed to submit challenge answer');
  }
}

/**
 * Mark challenge snap as viewed
 */
export async function markChallengeSnapAsViewed(challengeSnapId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'challengeSnaps', challengeSnapId), {
      status: 'viewed',
      viewedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error marking challenge snap as viewed:', error);
    throw new Error('Failed to mark challenge snap as viewed');
  }
}

/**
 * Get received challenge snaps for a user
 */
export async function getReceivedChallengeSnaps(userId: string): Promise<ChallengeSnap[]> {
  try {
    const q = query(
      collection(db, 'challengeSnaps'),
      where('recipientId', '==', userId),
      where('status', 'in', ['sent', 'viewed']),
      orderBy('sentAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as ChallengeSnap));
  } catch (error) {
    console.error('Error getting received challenge snaps:', error);
    throw new Error('Failed to get received challenge snaps');
  }
}

/**
 * Get sent challenge snaps for a user
 */
export async function getSentChallengeSnaps(userId: string): Promise<ChallengeSnap[]> {
  try {
    const q = query(
      collection(db, 'challengeSnaps'),
      where('senderId', '==', userId),
      orderBy('sentAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as ChallengeSnap));
  } catch (error) {
    console.error('Error getting sent challenge snaps:', error);
    throw new Error('Failed to get sent challenge snaps');
  }
} 