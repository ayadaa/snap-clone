import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../../components/common/Screen';
import { useChats, type ChatWithUser } from '../../hooks/chat/use-chats';
import { useAuth } from '../../hooks/auth/use-auth';

export function ChatScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const currentUserId = user?.uid || '';

  const { chats, loading, error, formatTimestamp } = useChats(currentUserId);

  const handleSearchPress = () => {
    // Navigate to add friends screen where users can start new chats
    (navigation as any).navigate('Friends');
  };

  const handleChatPress = (chat: ChatWithUser) => {
    (navigation as any).navigate('IndividualChat', {
      chatId: chat.id,
      otherUser: chat.otherUser,
    });
  };

  return (
    <Screen backgroundColor="#000000" statusBarStyle="light-content">
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 16,
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 24,
              fontWeight: 'bold',
            }}
          >
            Chats
          </Text>

          <TouchableOpacity
            onPress={handleSearchPress}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16 }}>🔍</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 16 }}>
              Loading chats...
            </Text>
          </View>
        ) : error ? (
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
                marginBottom: 8,
              }}
            >
              Failed to load chats
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
        ) : (
          <FlatList
            data={chats}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: chat }) => (
              <TouchableOpacity
                onPress={() => handleChatPress(chat)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: 'rgba(0, 132, 255, 0.8)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16,
                  }}
                >
                  <Text style={{ fontSize: 18, color: '#FFFFFF' }}>
                    {chat.otherUser.username.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 16,
                        fontWeight: 'bold',
                      }}
                    >
                      {chat.otherUser.username}
                    </Text>
                    <Text
                      style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: 12,
                      }}
                    >
                      {chat.lastMessage ? formatTimestamp(chat.lastMessage.timestamp) : ''}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: 14,
                        flex: 1,
                      }}
                      numberOfLines={1}
                    >
                      {chat.lastMessage?.text || 'No messages yet'}
                    </Text>
                    {chat.unreadCount > 0 && (
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#0084FF',
                          marginLeft: 8,
                        }}
                      />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 60,
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
                  No chats yet
                </Text>
                <Text
                  style={{
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontSize: 14,
                    textAlign: 'center',
                  }}
                >
                  Add friends to start chatting
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </Screen>
  );
} 