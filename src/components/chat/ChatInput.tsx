import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Platform } from 'react-native';

interface ChatInputProps {
  onSendMessage: (text: string) => Promise<void>;
  sending: boolean;
  placeholder?: string;
}

/**
 * Chat input component for sending text messages.
 * Features glassmorphic design with send button and loading state.
 */
export function ChatInput({ 
  onSendMessage, 
  sending, 
  placeholder = "Type a message..." 
}: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSend = async () => {
    if (!text.trim() || sending) return;

    const messageText = text.trim();
    setText(''); // Clear input immediately for better UX

    try {
      await onSendMessage(messageText);
    } catch (error) {
      // If sending fails, restore the text
      setText(messageText);
    }
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: Platform.OS === 'ios' ? 34 : 12, // Account for home indicator
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderRadius: 20,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          paddingHorizontal: 16,
          paddingVertical: 10,
          marginRight: 8,
          minHeight: 40,
          maxHeight: 100,
        }}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          style={{
            color: '#FFFFFF',
            fontSize: 16,
            lineHeight: 20,
            textAlignVertical: 'center',
          }}
          multiline
          maxLength={1000}
          editable={!sending}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
      </View>

      <TouchableOpacity
        onPress={handleSend}
        disabled={!text.trim() || sending}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: text.trim() && !sending 
            ? 'rgba(0, 132, 255, 0.8)' 
            : 'rgba(255, 255, 255, 0.2)',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: text.trim() && !sending 
            ? 'rgba(0, 132, 255, 0.4)' 
            : 'rgba(255, 255, 255, 0.1)',
        }}
      >
        {sending ? (
          <Text style={{ color: '#FFFFFF', fontSize: 16 }}>⏳</Text>
        ) : (
          <Text 
            style={{ 
              color: text.trim() ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)', 
              fontSize: 16,
              transform: [{ rotate: '-45deg' }],
            }}
          >
            ➤
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
} 