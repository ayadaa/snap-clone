import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { type Message, getSnapData, type SnapData } from '../../services/firebase/firestore.service';
import { type NavigationProp } from '../../types/navigation';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  chatType?: 'individual' | 'group'; // Add chat type to distinguish behavior
}

/**
 * Message bubble component for displaying individual chat messages.
 * Uses glassmorphic design with different styles for sent/received messages.
 * Supports both text and snap messages.
 */
export function MessageBubble({ message, isCurrentUser, chatType = 'individual' }: MessageBubbleProps) {
  const navigation = useNavigation<NavigationProp>();
  const [snapData, setSnapData] = useState<SnapData | null>(null);
  const [loadingSnap, setLoadingSnap] = useState(false);

  /**
   * Load snap data if this is a snap message
   */
  useEffect(() => {
    if (message.type === 'snap' && message.snapId) {
      setLoadingSnap(true);
      getSnapData(message.snapId)
        .then(data => {
          setSnapData(data);
        })
        .catch(error => {
          console.error('Failed to load snap data:', error);
        })
        .finally(() => {
          setLoadingSnap(false);
        });
    }
  }, [message.type, message.snapId]);

  const formatTime = (timestamp: any): string => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  /**
   * Handle snap message tap
   */
  const handleSnapTap = () => {
    if (message.type === 'snap' && message.snapId && snapData) {
      // Navigate to snap viewer for both individual and group chats
      navigation.navigate('SnapViewer', {
        snapId: message.snapId,
        chatType,
        senderId: message.senderId,
      });
    }
  };

  /**
   * Render snap message content
   */
  const renderSnapContent = () => {
    if (loadingSnap) {
      return (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 8,
        }}>
          <View style={{
            width: 60,
            height: 60,
            borderRadius: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}>
            <Ionicons name="camera" size={24} color="rgba(255, 255, 255, 0.6)" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{
              color: '#FFFFFF',
              fontSize: 16,
              fontWeight: '500',
            }}>
              Loading snap...
            </Text>
          </View>
        </View>
      );
    }

    if (!snapData) {
      return (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 8,
        }}>
          <View style={{
            width: 60,
            height: 60,
            borderRadius: 8,
            backgroundColor: 'rgba(255, 0, 0, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}>
            <Ionicons name="alert-circle" size={24} color="#FF6B6B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{
              color: '#FF6B6B',
              fontSize: 16,
              fontWeight: '500',
            }}>
              Snap unavailable
            </Text>
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity onPress={handleSnapTap} activeOpacity={0.7}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 4,
        }}>
          {/* Snap preview */}
          <View style={{
            width: 60,
            height: 60,
            borderRadius: 8,
            overflow: 'hidden',
            marginRight: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }}>
            <Image
              source={{ uri: snapData.storageUrl }}
              style={{
                width: '100%',
                height: '100%',
              }}
              resizeMode="cover"
            />
            {/* Video indicator */}
            {snapData.mediaType === 'video' && (
              <View style={{
                position: 'absolute',
                top: 4,
                right: 4,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderRadius: 12,
                paddingHorizontal: 6,
                paddingVertical: 2,
              }}>
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 10,
                  fontWeight: '600',
                }}>
                  {snapData.duration}s
                </Text>
              </View>
            )}
          </View>
          
          <View style={{ flex: 1 }}>
            <Text style={{
              color: isCurrentUser ? '#FFFFFF' : '#FFFFFF',
              fontSize: 16,
              fontWeight: '500',
            }}>
              📸 {snapData.mediaType === 'photo' ? 'Photo' : 'Video'}
            </Text>
            <Text style={{
              color: isCurrentUser 
                ? 'rgba(255, 255, 255, 0.8)' 
                : 'rgba(255, 255, 255, 0.7)',
              fontSize: 14,
              marginTop: 2,
            }}>
              Tap to view
            </Text>
          </View>
          
          <Ionicons 
            name="play-circle" 
            size={24} 
            color={isCurrentUser ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.7)'} 
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{
        alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
        maxWidth: '80%',
        marginVertical: 2,
        marginHorizontal: 16,
      }}
    >
      <View
        style={{
          backgroundColor: isCurrentUser 
            ? 'rgba(0, 132, 255, 0.8)' // Blue for sent messages
            : 'rgba(255, 255, 255, 0.15)', // Glass effect for received
          borderRadius: 18,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderWidth: isCurrentUser ? 0 : 1,
          borderColor: isCurrentUser ? 'transparent' : 'rgba(255, 255, 255, 0.2)',
          // Shadow for depth
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        {/* Render content based on message type */}
        {message.type === 'snap' ? (
          renderSnapContent()
        ) : (
          message.text && (
            <Text
              style={{
                color: isCurrentUser ? '#FFFFFF' : '#FFFFFF',
                fontSize: 16,
                lineHeight: 20,
              }}
            >
              {message.text}
            </Text>
          )
        )}
        
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: (message.text || message.type === 'snap') ? 4 : 0,
          }}
        >
          <Text
            style={{
              color: isCurrentUser 
                ? 'rgba(255, 255, 255, 0.8)' 
                : 'rgba(255, 255, 255, 0.6)',
              fontSize: 12,
              marginTop: 2,
            }}
          >
            {formatTime(message.timestamp)}
          </Text>
          
          {isCurrentUser && (
            <View style={{ marginLeft: 8 }}>
              {message.status === 'sent' && (
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12 }}>
                  ✓
                </Text>
              )}
              {message.status === 'delivered' && (
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12 }}>
                  ✓✓
                </Text>
              )}
              {message.status === 'read' && (
                <Text style={{ color: '#00D4AA', fontSize: 12 }}>
                  ✓✓
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
} 