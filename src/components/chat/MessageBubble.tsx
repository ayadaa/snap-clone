import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { type Message, getSnapData, type SnapData, getChallengeSnap, getMathChallenge } from '../../services/firebase/firestore.service';
import { type NavigationProp } from '../../types/navigation';
import { type RootState } from '../../store';

interface MessageBubbleProps {
  message: Message & {
    challengeSnapId?: string; // Add support for challenge messages
  };
  isCurrentUser: boolean;
  chatType?: 'individual' | 'group'; // Add chat type to distinguish behavior
}

/**
 * Message bubble component for displaying individual chat messages.
 * Uses glassmorphic design with different styles for sent/received messages.
 * Supports both text and snap messages with ephemeral behavior.
 * Snaps disappear after being viewed by the current user.
 */
export function MessageBubble({ message, isCurrentUser, chatType = 'individual' }: MessageBubbleProps) {
  const navigation = useNavigation<NavigationProp>();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [snapData, setSnapData] = useState<SnapData | null>(null);
  const [loadingSnap, setLoadingSnap] = useState(false);
  const [hasViewedSnap, setHasViewedSnap] = useState(false);
  const [challengeData, setChallengeData] = useState<{ concept: string; difficulty: string } | null>(null);
  const [loadingChallenge, setLoadingChallenge] = useState(false);

  /**
   * Load snap data if this is a snap message
   */
  const loadSnapData = React.useCallback(async () => {
    if (message.type === 'snap' && message.snapId && currentUser) {
      setLoadingSnap(true);
      try {
        const data = await getSnapData(message.snapId);
        setSnapData(data);
        // Check if current user has already viewed this snap
        if (data && data.viewers.includes(currentUser.uid)) {
          setHasViewedSnap(true);
        } else {
          setHasViewedSnap(false);
        }
      } catch (error) {
        console.error('Failed to load snap data:', error);
      } finally {
        setLoadingSnap(false);
      }
    }
  }, [message.type, message.snapId, currentUser]);

  /**
   * Load challenge data if this is a challenge message
   */
  const loadChallengeData = React.useCallback(async () => {
    if (message.type === 'challenge' && message.challengeSnapId && currentUser) {
      setLoadingChallenge(true);
      try {
        const challengeSnap = await getChallengeSnap(message.challengeSnapId);
        if (challengeSnap) {
          const challenge = await getMathChallenge(challengeSnap.challengeId);
          if (challenge) {
            setChallengeData({
              concept: challenge.concept,
              difficulty: challenge.difficulty,
            });
          }
        }
      } catch (error) {
        console.error('Failed to load challenge data:', error);
      } finally {
        setLoadingChallenge(false);
      }
    }
  }, [message.type, message.challengeSnapId, currentUser]);

  /**
   * Initial load of snap and challenge data
   */
  useEffect(() => {
    loadSnapData();
    loadChallengeData();
  }, [loadSnapData, loadChallengeData]);

  /**
   * Refresh data when screen comes into focus (e.g., returning from SnapViewer or ChallengeViewer)
   */
  useFocusEffect(
    React.useCallback(() => {
      if (message.type === 'snap') {
        loadSnapData();
      } else if (message.type === 'challenge') {
        loadChallengeData();
      }
    }, [loadSnapData, loadChallengeData, message.type])
  );

  const formatTime = (timestamp: any): string => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  /**
   * Handle snap message tap
   */
  const handleSnapTap = () => {
    if (message.type === 'snap' && message.snapId && snapData && !hasViewedSnap) {
      // Navigate to snap viewer for both individual and group chats
      navigation.navigate('SnapViewer', {
        snapId: message.snapId,
        chatType,
        senderId: message.senderId,
      });
    }
  };

  /**
   * Handle challenge message tap
   */
  const handleChallengeTap = () => {
    if (message.type === 'challenge' && message.challengeSnapId) {
      Alert.alert(
        'Math Challenge 🎯',
        'Ready to take on this challenge?',
        [
          { 
            text: 'View Challenge', 
            onPress: () => {
              // Navigate directly to the ChallengeViewer
              // Since we're in a chat context, we can navigate to any screen
              navigation.navigate('ChallengeViewer', {
                challengeSnapId: message.challengeSnapId!,
                senderId: message.senderId,
              });
            }
          },
          { text: 'Later', style: 'cancel' }
        ]
      );
    }
  };

  /**
   * Render snap message content
   */
  const renderSnapContent = () => {
    // If user has already viewed the snap, show "viewed" state
    if (hasViewedSnap && !isCurrentUser) {
      return (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 8,
          opacity: 0.6,
        }}>
          <View style={{
            width: 60,
            height: 60,
            borderRadius: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}>
            <Ionicons name="eye" size={24} color="rgba(255, 255, 255, 0.4)" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: 16,
              fontWeight: '500',
              fontStyle: 'italic',
            }}>
              Snap viewed
            </Text>
            <Text style={{
              color: 'rgba(255, 255, 255, 0.4)',
              fontSize: 14,
              marginTop: 2,
            }}>
              This snap has been opened
            </Text>
          </View>
        </View>
      );
    }

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

  /**
   * Render challenge message content
   */
  const renderChallengeContent = () => {
    if (loadingChallenge) {
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
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}>
            <Ionicons name="calculator" size={24} color="#3B82F6" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{
              color: '#FFFFFF',
              fontSize: 16,
              fontWeight: '500',
            }}>
              Loading challenge...
            </Text>
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity onPress={handleChallengeTap} activeOpacity={0.7}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 4,
        }}>
          {/* Challenge icon */}
          <View style={{
            width: 60,
            height: 60,
            borderRadius: 8,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            borderWidth: 2,
            borderColor: '#3B82F6',
          }}>
            <Text style={{
              fontSize: 24,
            }}>
              🎯
            </Text>
          </View>
          
          <View style={{ flex: 1 }}>
            <Text style={{
              color: isCurrentUser ? '#FFFFFF' : '#FFFFFF',
              fontSize: 16,
              fontWeight: '600',
            }}>
              🎯 Math Challenge
            </Text>
            <Text style={{
              color: isCurrentUser 
                ? 'rgba(255, 255, 255, 0.9)' 
                : 'rgba(255, 255, 255, 0.8)',
              fontSize: 14,
              marginTop: 2,
            }}>
              {challengeData ? `${challengeData.concept} • ${challengeData.difficulty.charAt(0).toUpperCase() + challengeData.difficulty.slice(1)}` : 'Loading challenge details...'}
            </Text>
            <Text style={{
              color: isCurrentUser 
                ? 'rgba(255, 255, 255, 0.7)' 
                : 'rgba(255, 255, 255, 0.6)',
              fontSize: 12,
              marginTop: 4,
              fontStyle: 'italic',
            }}>
              Tap to view and solve
            </Text>
          </View>
          
          <Ionicons 
            name="arrow-forward-circle" 
            size={24} 
            color={isCurrentUser ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.7)'} 
          />
        </View>
      </TouchableOpacity>
    );
  };

  // Don't render the message at all if it's a viewed snap from another user
  // This creates the true "ephemeral" experience where snaps disappear completely
  if (message.type === 'snap' && hasViewedSnap && !isCurrentUser && !loadingSnap) {
    return null;
  }

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
        ) : message.type === 'challenge' ? (
          renderChallengeContent()
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