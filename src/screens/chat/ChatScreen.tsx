import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, SectionList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/common/Screen';
import { useChats, type ChatWithUser } from '../../hooks/chat/use-chats';
import { useGroups } from '../../hooks/chat/use-groups';
import { useAuth } from '../../hooks/auth/use-auth';
import type { NavigationProp } from '../../types/navigation';
import type { Group } from '../../services/firebase/firestore.service';

interface ChatSection {
  title: string;
  data: (ChatWithUser | Group)[];
  type: 'individual' | 'group';
}

export function ChatScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const currentUserId = user?.uid || '';

  const { chats, loading: chatsLoading, error: chatsError, formatTimestamp } = useChats(currentUserId);
  const { groups, loading: groupsLoading, error: groupsError } = useGroups(currentUserId);

  const handleSearchPress = () => {
    // Navigate to add friends screen where users can start new chats
    (navigation as any).navigate('Friends');
  };

  const handleCreateGroupPress = () => {
    navigation.navigate('CreateGroup');
  };

  const handleChatPress = (chat: ChatWithUser) => {
    (navigation as any).navigate('IndividualChat', {
      chatId: chat.id,
      otherUser: {
        uid: chat.otherUser.uid,
        email: chat.otherUser.email,
        username: chat.otherUser?.username || 'Unknown User',
        displayName: chat.otherUser.displayName,
        profilePicture: chat.otherUser.profilePicture,
        createdAt: chat.otherUser.createdAt,
        lastSeen: chat.otherUser.lastSeen,
        isOnline: chat.otherUser.isOnline || false,
      },
    });
  };

  const handleGroupPress = (group: Group) => {
    navigation.navigate('GroupChat', {
      groupId: group.id,
    });
  };

  // Prepare sections data
  const sections: ChatSection[] = [];
  
  if (groups.length > 0) {
    sections.push({
      title: 'Groups',
      data: groups,
      type: 'group',
    });
  }
  
  if (chats.length > 0) {
    sections.push({
      title: 'Direct Messages',
      data: chats,
      type: 'individual',
    });
  }

  const loading = chatsLoading || groupsLoading;
  const error = chatsError || groupsError;

  const renderSectionHeader = ({ section }: { section: ChatSection }) => (
    <View style={{
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    }}>
      <Text style={{
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}>
        {section.title}
      </Text>
    </View>
  );

  const renderChatItem = (item: ChatWithUser | Group, type: 'individual' | 'group') => {
    if (type === 'group') {
      const group = item as Group;
      return (
        <TouchableOpacity
          onPress={() => handleGroupPress(group)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <View style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: 'rgba(0, 200, 100, 0.8)',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
          }}>
            <Ionicons name="people" size={24} color="#FFFFFF" />
          </View>

          <View style={{ flex: 1 }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 4,
            }}>
              <Text style={{
                color: '#FFFFFF',
                fontSize: 16,
                fontWeight: 'bold',
              }}>
                {group.name}
              </Text>
              <Text style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: 12,
              }}>
                {group.lastMessage ? formatTimestamp(group.lastMessage.timestamp) : ''}
              </Text>
            </View>

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <Text style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: 14,
                flex: 1,
              }} numberOfLines={1}>
                {group.lastMessage?.text || `${group.participants.length} members`}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    } else {
      const chat = item as ChatWithUser;
      return (
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
          <View style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: 'rgba(0, 132, 255, 0.8)',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
          }}>
            <Text style={{ fontSize: 18, color: '#FFFFFF' }}>
              {chat.otherUser?.username?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 4,
            }}>
              <Text style={{
                color: '#FFFFFF',
                fontSize: 16,
                fontWeight: 'bold',
              }}>
                {chat.otherUser?.username || 'Unknown User'}
              </Text>
              <Text style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: 12,
              }}>
                {chat.lastMessage ? formatTimestamp(chat.lastMessage.timestamp) : ''}
              </Text>
            </View>

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <Text style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: 14,
                flex: 1,
              }} numberOfLines={1}>
                {chat.lastMessage?.type === 'snap' 
                  ? '📸 Snap' 
                  : chat.lastMessage?.text || 'No messages yet'
                }
              </Text>
              {chat.unreadCount > 0 && (
                <View style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#0084FF',
                  marginLeft: 8,
                }} />
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  };

  return (
    <Screen backgroundColor="#000000" statusBarStyle="light-content">
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 16,
        }}>
          <Text style={{
            color: '#FFFFFF',
            fontSize: 24,
            fontWeight: 'bold',
          }}>
            Chats
          </Text>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={handleCreateGroupPress}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(0, 200, 100, 0.8)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="people-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>

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
              <Ionicons name="search" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        {loading ? (
          <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 16 }}>
              Loading chats...
            </Text>
          </View>
        ) : error ? (
          <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 40,
          }}>
            <Text style={{
              color: '#FF4444',
              fontSize: 16,
              textAlign: 'center',
              marginBottom: 8,
            }}>
              Failed to load chats
            </Text>
            <Text style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: 14,
              textAlign: 'center',
            }}>
              {error}
            </Text>
          </View>
        ) : sections.length === 0 ? (
          <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 40,
          }}>
            <Ionicons name="chatbubbles-outline" size={64} color="rgba(255, 255, 255, 0.3)" />
            <Text style={{
              color: '#FFFFFF',
              fontSize: 20,
              fontWeight: 'bold',
              marginTop: 16,
              marginBottom: 8,
              textAlign: 'center',
            }}>
              No chats yet
            </Text>
            <Text style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: 16,
              textAlign: 'center',
              marginBottom: 24,
            }}>
              Start a conversation with friends or create a group chat
            </Text>
            
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <TouchableOpacity
                onPress={handleCreateGroupPress}
                style={{
                  backgroundColor: 'rgba(0, 200, 100, 0.8)',
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 25,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Ionicons name="people-outline" size={20} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                  Create Group
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSearchPress}
                style={{
                  backgroundColor: 'rgba(0, 132, 255, 0.8)',
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 25,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Ionicons name="search" size={20} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                  Find Friends
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderSectionHeader={renderSectionHeader}
            renderItem={({ item, section }) => renderChatItem(item, section.type)}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
          />
        )}
      </View>
    </Screen>
  );
} 