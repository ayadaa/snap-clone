import { useState, useEffect, useCallback } from 'react';
import { 
  subscribeToMessages, 
  sendMessage, 
  markMessagesAsRead,
  type Message 
} from '../../services/firebase/firestore.service';

/**
 * Custom hook for managing messages in a chat.
 * Provides real-time message updates, sending functionality, and read status management.
 */
export function useMessages(chatId: string | null, currentUserId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const unsubscribe = subscribeToMessages(chatId, (newMessages) => {
        setMessages(newMessages);
        setLoading(false);
      });

      return unsubscribe;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
      setLoading(false);
    }
  }, [chatId]);

  /**
   * Send a text message to the chat
   */
  const sendTextMessage = useCallback(async (text: string): Promise<void> => {
    if (!chatId || !text.trim()) return;

    setSending(true);
    setError(null);

    try {
      await sendMessage(chatId, currentUserId, text.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    } finally {
      setSending(false);
    }
  }, [chatId, currentUserId]);

  /**
   * Mark unread messages as read
   */
  const markAsRead = useCallback(async (): Promise<void> => {
    if (!chatId) return;

    const unreadMessages = messages.filter(
      msg => msg.senderId !== currentUserId && msg.status !== 'read'
    );

    if (unreadMessages.length === 0) return;

    try {
      const messageIds = unreadMessages.map(msg => msg.id);
      await markMessagesAsRead(chatId, messageIds);
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  }, [chatId, messages, currentUserId]);

  /**
   * Get unread message count
   */
  const unreadCount = messages.filter(
    msg => msg.senderId !== currentUserId && msg.status !== 'read'
  ).length;

  return {
    messages,
    loading,
    error,
    sending,
    sendTextMessage,
    markAsRead,
    unreadCount,
  };
} 