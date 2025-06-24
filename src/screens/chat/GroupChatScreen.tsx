/**
 * Group Chat Screen
 * Handles group messaging with multiple participants, system messages, and read receipts
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { Screen } from '../../components/common/Screen';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { ChatInput } from '../../components/chat/ChatInput';
import { useGroupMessages } from '../../hooks/chat/use-group-messages';
import { useGroups } from '../../hooks/chat/use-groups';
import { getUserProfile } from '../../services/firebase/firestore.service';
import type { RootState } from '../../store';
import type { AppStackParamList, NavigationProp } from '../../types/navigation';
import type { GroupMessage, UserProfile } from '../../services/firebase/firestore.service';

type GroupChatRouteProp = RouteProp<AppStackParamList, 'GroupChat'>;

export default function GroupChatScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<GroupChatRouteProp>();
  const { groupId } = route.params;
  
  const user = useSelector((state: RootState) => state.auth.user);
  const currentUserId = user?.uid || '';
  
  const { groups } = useGroups(currentUserId);
  const {
    messages,
    loading,
    error,
    sending,
    sendMessage,
    formatSystemMessage,
  } = useGroupMessages(groupId, currentUserId);
  
  const [participants, setParticipants] = useState<UserProfile[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  
  // Find current group
  const currentGroup = groups.find(g => g.id === groupId);

  /**
   * Load participant profiles
   */
  const loadParticipants = useCallback(async () => {
    if (!currentGroup) return;
    
    setLoadingParticipants(true);
    try {
      const participantProfiles = await Promise.all(
        currentGroup.participants.map(async (participantId) => {
          try {
            return await getUserProfile(participantId);
          } catch (error) {
            console.error(`Failed to load profile for ${participantId}:`, error);
            return null;
          }
        })
      );
      
      const validProfiles = participantProfiles.filter(Boolean) as UserProfile[];
      setParticipants(validProfiles);
    } catch (error) {
      console.error('Error loading participants:', error);
    } finally {
      setLoadingParticipants(false);
    }
  }, [currentGroup]);

  /**
   * Get username for a user ID
   */
  const getUsernameById = useCallback((userId: string): string => {
    const participant = participants.find(p => p.uid === userId);
    return participant?.username || 'Unknown User';
  }, [participants]);

  /**
   * Handle sending a message
   */
  const handleSendMessage = useCallback(async (text: string) => {
    try {
      await sendMessage(text);
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  }, [sendMessage]);

  /**
   * Render message item
   */
  const renderMessage = useCallback(({ item }: { item: GroupMessage }) => {
    if (item.type === 'system') {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>
            {formatSystemMessage(item)}
          </Text>
        </View>
      );
    }

    const isOwnMessage = item.senderId === currentUserId;
    const senderName = getUsernameById(item.senderId);
    
    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
      ]}>
        {!isOwnMessage && (
          <Text style={styles.senderName}>{senderName}</Text>
        )}
        <MessageBubble
          message={{
            id: item.id,
            text: item.text || '',
            snapId: item.snapId,
            senderId: item.senderId,
            timestamp: item.timestamp,
            type: item.type === 'snap' ? 'snap' : 'text',
            status: 'sent',
          }}
          isCurrentUser={isOwnMessage}
          chatType="group"
        />
        {/* Read receipts for group messages */}
        {isOwnMessage && item.readBy.length > 1 && (
          <Text style={styles.readReceipt}>
            Read by {item.readBy.length - 1}
          </Text>
        )}
      </View>
    );
  }, [currentUserId, getUsernameById, formatSystemMessage]);

  /**
   * Navigate to group settings
   */
  const handleGroupSettings = useCallback(() => {
    navigation.navigate('GroupSettings', { groupId });
  }, [navigation, groupId]);

  // Load participants when group changes
  useEffect(() => {
    loadParticipants();
  }, [loadParticipants]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  if (!currentGroup && !loading) {
    return (
      <Screen style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Group not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.groupName} numberOfLines={1}>
            {currentGroup?.name || 'Loading...'}
          </Text>
          <Text style={styles.participantCount}>
            {loadingParticipants ? 'Loading...' : `${participants.length} members`}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('GroupSettings', { groupId })}
        >
          <Ionicons name="settings" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <View style={styles.messagesContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0084FF" />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              Start the conversation with your group!
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: false });
            }}
          />
        )}
      </View>

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        sending={sending}
        placeholder={`Message ${currentGroup?.name || 'group'}...`}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#000000',
  },
  headerBackButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  participantCount: {
    fontSize: 12,
    color: '#AAAAAA',
    marginTop: 2,
  },
  settingsButton: {
    padding: 8,
    marginLeft: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    paddingVertical: 16,
    paddingBottom: 100,
  },
  messageContainer: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    color: '#AAAAAA',
    marginBottom: 4,
    marginLeft: 12,
  },
  readReceipt: {
    fontSize: 10,
    color: '#AAAAAA',
    marginTop: 2,
    marginRight: 12,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  systemMessageText: {
    fontSize: 12,
    color: '#AAAAAA',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#AAAAAA',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#0084FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'center',
  },
}); 