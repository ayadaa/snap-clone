import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Screen } from '../../components/common/Screen';

export function ChatScreen() {
  const handleSearchPress = () => {
    console.log('Search pressed');
  };

  const handleChatPress = (chatId: string) => {
    console.log('Chat pressed:', chatId);
  };

  const mockChats = [
    {
      id: '1',
      name: 'John Doe',
      lastMessage: 'Hey there! 👋',
      timestamp: '2m ago',
      unread: true,
      avatar: '😊',
    },
    {
      id: '2',
      name: 'Jane Smith',
      lastMessage: 'Photo sent',
      timestamp: '1h ago',
      unread: false,
      avatar: '🌟',
    },
  ];

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

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {mockChats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              onPress={() => handleChatPress(chat.id)}
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
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}
              >
                <Text style={{ fontSize: 20 }}>{chat.avatar}</Text>
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
                    {chat.name}
                  </Text>
                  <Text
                    style={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: 12,
                    }}
                  >
                    {chat.timestamp}
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
                    {chat.lastMessage}
                  </Text>
                  {chat.unread && (
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
          ))}

          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 40,
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
                fontSize: 14,
                textAlign: 'center',
                marginBottom: 4,
              }}
            >
              More chats coming soon!
            </Text>
            <Text
              style={{
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: 12,
                textAlign: 'center',
              }}
            >
              Phase 1: Real-time messaging
            </Text>
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
} 