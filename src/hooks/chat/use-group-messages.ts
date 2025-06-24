import { useState, useEffect, useCallback } from 'react';
import {
  sendGroupMessage,
  subscribeToGroupMessages,
  markGroupMessagesAsRead,
  type GroupMessage,
} from '../../services/firebase/firestore.service';

/**
 * Custom hook for managing group messages.
 * Handles sending messages, real-time updates, and read receipts.
 */
export function useGroupMessages(groupId: string, currentUserId: string) {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  /**
   * Send a text message to the group
   */
  const sendMessage = useCallback(async (text: string): Promise<void> => {
    if (!text.trim() || !currentUserId || !groupId) return;

    try {
      setSending(true);
      setError(null);
      
      await sendGroupMessage(groupId, {
        senderId: currentUserId,
        text: text.trim(),
        type: 'text',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setSending(false);
    }
  }, [groupId, currentUserId]);

  /**
   * Send a snap to the group
   */
  const sendSnap = useCallback(async (snapId: string): Promise<void> => {
    if (!snapId || !currentUserId || !groupId) return;

    try {
      setSending(true);
      setError(null);
      
      await sendGroupMessage(groupId, {
        senderId: currentUserId,
        snapId,
        type: 'snap',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send snap';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setSending(false);
    }
  }, [groupId, currentUserId]);

  /**
   * Mark messages as read
   */
  const markAsRead = useCallback(async (messageIds: string[]): Promise<void> => {
    if (!messageIds.length || !currentUserId || !groupId) return;

    try {
      await markGroupMessagesAsRead(groupId, currentUserId, messageIds);
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
      // Don't throw error for read receipts - it's not critical
    }
  }, [groupId, currentUserId]);

  /**
   * Get unread messages for the current user
   */
  const getUnreadMessages = useCallback((): GroupMessage[] => {
    return messages.filter(message => 
      !message.readBy.some(read => read.userId === currentUserId)
    );
  }, [messages, currentUserId]);

  /**
   * Check if a message is read by the current user
   */
  const isMessageRead = useCallback((message: GroupMessage): boolean => {
    return message.readBy.some(read => read.userId === currentUserId);
  }, [currentUserId]);

  /**
   * Get read status for a message (who has read it)
   */
  const getMessageReadStatus = useCallback((message: GroupMessage) => {
    return {
      readBy: message.readBy,
      readCount: message.readBy.length,
      isReadByCurrentUser: message.readBy.some(read => read.userId === currentUserId),
    };
  }, [currentUserId]);

  /**
   * Format system messages for display
   */
  const formatSystemMessage = useCallback((message: GroupMessage): string => {
    if (message.type !== 'system') return '';

    switch (message.systemMessageType) {
      case 'member_added':
        if (message.metadata?.addedMembers?.length) {
          const members = message.metadata.addedMembers.join(', ');
          return `${members} joined the group`;
        }
        return 'New members joined the group';
      
      case 'member_left':
        if (message.metadata?.removedMember) {
          const member = message.metadata.removedMember;
          return `${member} left the group`;
        }
        return 'A member left the group';
      
      case 'name_changed':
        return `Group name changed to "${message.metadata?.newName}"`;
      
      case 'admin_added':
        if (message.metadata?.newAdmin) {
          const admin = message.metadata.newAdmin;
          return `${admin} was made an admin`;
        }
        return 'A new admin was added';
      
      default:
        return 'Group updated';
    }
  }, []);

  // Set up real-time listener for group messages
  useEffect(() => {
    if (!groupId) return;

    setLoading(true);
    const unsubscribe = subscribeToGroupMessages(groupId, (updatedMessages) => {
      setMessages(updatedMessages);
      setLoading(false);
      
      // Auto-mark new messages as read when they arrive
      const unreadMessages = updatedMessages.filter(message => 
        message.senderId !== currentUserId && 
        !message.readBy.some(read => read.userId === currentUserId)
      );
      
      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map(msg => msg.id);
        markAsRead(messageIds);
      }
    });

    return () => unsubscribe();
  }, [groupId, currentUserId, markAsRead]);

  return {
    messages,
    loading,
    error,
    sending,
    sendMessage,
    sendSnap,
    markAsRead,
    getUnreadMessages,
    isMessageRead,
    getMessageReadStatus,
    formatSystemMessage,
  };
} 