import React from 'react';
import { View, Text } from 'react-native';
import { type Message } from '../../services/firebase/firestore.service';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

/**
 * Message bubble component for displaying individual chat messages.
 * Uses glassmorphic design with different styles for sent/received messages.
 */
export function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  const formatTime = (timestamp: any): string => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        {message.text && (
          <Text
            style={{
              color: isCurrentUser ? '#FFFFFF' : '#FFFFFF',
              fontSize: 16,
              lineHeight: 20,
            }}
          >
            {message.text}
          </Text>
        )}
        
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: message.text ? 4 : 0,
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