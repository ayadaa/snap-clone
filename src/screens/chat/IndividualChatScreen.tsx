import React, { useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import { type StackNavigationProp } from '@react-navigation/stack';
import { Screen } from '../../components/common/Screen';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { ChatInput } from '../../components/chat/ChatInput';
import { useMessages } from '../../hooks/chat/use-messages';
import { useAuth } from '../../hooks/auth/use-auth';
import { getUserProfile, type UserProfile } from '../../services/firebase/firestore.service';
import { type Message } from '../../services/firebase/firestore.service';

type ChatStackParamList = {
  IndividualChat: {
    chatId: string;
    otherUser: UserProfile;
  };
};

type IndividualChatScreenRouteProp = RouteProp<ChatStackParamList, 'IndividualChat'>;
type IndividualChatScreenNavigationProp = StackNavigationProp<ChatStackParamList, 'IndividualChat'>;

/**
 * Individual chat screen for one-on-one messaging.
 * Features real-time messaging, message status indicators, and glassmorphic UI.
 */
export function IndividualChatScreen() {
  const route = useRoute<IndividualChatScreenRouteProp>();
  const navigation = useNavigation<IndividualChatScreenNavigationProp>();
  const { user } = useAuth();
  const flatListRef = useRef<FlatList<Message>>(null);

  const { chatId, otherUser } = route.params;
  const currentUserId = user?.uid || '';

  const {
    messages,
    loading,
    error,
    sending,
    sendTextMessage,
    markAsRead,
  } = useMessages(chatId, currentUserId);

  // Mark messages as read when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      markAsRead();
    });

    return unsubscribe;
  }, [navigation, markAsRead]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSendMessage = async (text: string) => {
    try {
      await sendTextMessage(text);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble
      message={item}
      isCurrentUser={item.senderId === currentUserId}
      chatType="individual"
    />
  );

  const renderHeader = () => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
      }}
    >
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 16,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 16 }}>←</Text>
      </TouchableOpacity>

      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'rgba(0, 132, 255, 0.8)',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 16 }}>
          {otherUser?.username?.charAt(0).toUpperCase() || '?'}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 18,
            fontWeight: 'bold',
          }}
        >
          {otherUser?.username || 'Unknown User'}
        </Text>
        <Text
          style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: 14,
          }}
        >
          {otherUser?.isOnline ? 'Online' : 'Offline'}
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
      }}
    >
      <Text
        style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: 16,
          textAlign: 'center',
          marginBottom: 8,
        }}
      >
        💬
      </Text>
      <Text
        style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: 16,
          textAlign: 'center',
          marginBottom: 4,
        }}
      >
        Start a conversation with {otherUser?.username || 'this user'}
      </Text>
      <Text
        style={{
          color: 'rgba(255, 255, 255, 0.4)',
          fontSize: 14,
          textAlign: 'center',
        }}
      >
        Send a message to get started
      </Text>
    </View>
  );

  if (error) {
    return (
      <Screen backgroundColor="#000000" statusBarStyle="light-content">
        {renderHeader()}
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 40,
          }}
        >
          <Text
            style={{
              color: '#FF4444',
              fontSize: 16,
              textAlign: 'center',
              marginBottom: 16,
            }}
          >
            Failed to load messages
          </Text>
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: 14,
              textAlign: 'center',
            }}
          >
            {error}
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen backgroundColor="#000000" statusBarStyle="light-content">
      {renderHeader()}
      
      <View style={{ flex: 1 }}>
        {loading ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 16 }}>
              Loading messages...
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              flexGrow: 1,
              paddingVertical: 16,
            }}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              if (messages.length > 0) {
                flatListRef.current?.scrollToEnd({ animated: false });
              }
            }}
          />
        )}
      </View>

      <ChatInput
        onSendMessage={handleSendMessage}
        sending={sending}
        placeholder={`Message ${otherUser?.username || 'user'}...`}
      />
    </Screen>
  );
} 