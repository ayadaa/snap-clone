/**
 * Send To Screen
 * Allows users to select friends to send their snap to
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/common/Screen';
import { Button } from '../../components/common/Button';
import { UserCard } from '../../components/friends/UserCard';
import { useFriends } from '../../hooks/friends/use-friends';
import { useSnaps } from '../../hooks/snaps/use-snaps';
import { CameraStackParamList } from '../../types/navigation';

type SendToScreenRouteProp = RouteProp<CameraStackParamList, 'SendTo'>;
type SendToScreenNavigationProp = StackNavigationProp<CameraStackParamList, 'SendTo'>;

interface SendToScreenProps {}

/**
 * Screen for selecting recipients for a snap
 */
export function SendToScreen({}: SendToScreenProps) {
  const navigation = useNavigation<SendToScreenNavigationProp>();
  const route = useRoute<SendToScreenRouteProp>();
  
  const { mediaUri, mediaType, duration, hasText, hasDrawing } = route.params;
  
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  
  const { friends, isLoadingFriends: friendsLoading, friendsError } = useFriends();
  const { sendSnap, uploadProgress, error: snapError } = useSnaps();

  /**
   * Toggle friend selection
   */
  const toggleFriendSelection = useCallback((friendId: string) => {
    setSelectedFriends(prev => {
      if (prev.includes(friendId)) {
        return prev.filter(id => id !== friendId);
      } else {
        return [...prev, friendId];
      }
    });
  }, []);

  /**
   * Handle sending snap to selected friends
   */
  const handleSendSnap = useCallback(async () => {
    if (selectedFriends.length === 0) {
      Alert.alert('No Recipients', 'Please select at least one friend to send your snap to.');
      return;
    }

    setIsSending(true);

    try {
      await sendSnap({
        recipientIds: selectedFriends,
        mediaUri,
        mediaType,
        duration,
        hasText,
        hasDrawing
      });

      Alert.alert(
        'Snap Sent!',
        `Your snap was sent to ${selectedFriends.length} friend${selectedFriends.length > 1 ? 's' : ''}.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('CameraCapture')
          }
        ]
      );
    } catch (error) {
      console.error('Error sending snap:', error);
      Alert.alert(
        'Send Failed',
        'Failed to send your snap. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSending(false);
    }
  }, [selectedFriends, sendSnap, mediaUri, mediaType, duration, hasText, hasDrawing, navigation]);

  /**
   * Handle back navigation
   */
  const handleBack = useCallback(() => {
    if (isSending) {
      Alert.alert(
        'Sending Snap',
        'Your snap is currently being sent. Are you sure you want to cancel?',
        [
          { text: 'Continue Sending', style: 'cancel' },
          { 
            text: 'Cancel', 
            style: 'destructive',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [isSending, navigation]);

  /**
   * Render friend item with selection state
   */
  const renderFriendItem = useCallback(({ item: friend }: { item: any }) => {
    const isSelected = selectedFriends.includes(friend.uid);
    
    return (
              <TouchableOpacity
          onPress={() => toggleFriendSelection(friend.uid)}
          style={[styles.friendItem, isSending && styles.disabled]}
          disabled={isSending}
        >
        <View style={styles.friendItemContent}>
          <UserCard
            user={friend}
            actionType="none"
          />
          
          {/* Selection indicator */}
          <View style={styles.selectionIndicator}>
            <View
              style={[
                styles.checkbox,
                isSelected ? styles.checkboxSelected : styles.checkboxUnselected
              ]}
            >
              {isSelected && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [selectedFriends, toggleFriendSelection, isSending]);

  /**
   * Show error alert if there's an error
   */
  useEffect(() => {
    if (friendsError) {
      Alert.alert('Error', friendsError);
    }
    if (snapError) {
      Alert.alert('Send Error', snapError);
    }
  }, [friendsError, snapError]);

  return (
    <Screen style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          disabled={isSending}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          Send To
        </Text>
        
        <View style={styles.headerSpacer} />
      </View>

      {/* Selected count */}
      {selectedFriends.length > 0 && (
        <View style={styles.selectedCount}>
          <Text style={styles.selectedCountText}>
            {selectedFriends.length} friend{selectedFriends.length > 1 ? 's' : ''} selected
          </Text>
        </View>
      )}

      {/* Upload progress */}
      {uploadProgress && (
        <View style={styles.uploadProgress}>
          <Text style={styles.uploadProgressText}>
            Uploading... {Math.round(uploadProgress.progress)}%
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${uploadProgress.progress}%` }]}
            />
          </View>
        </View>
      )}

      {/* Friends list */}
      <View style={styles.friendsList}>
        {friendsLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading friends...</Text>
          </View>
        ) : friends.length === 0 ? (
          <View style={styles.centered}>
            <Ionicons name="people-outline" size={64} color="#6B7280" />
            <Text style={styles.emptyTitle}>
              No Friends Yet
            </Text>
            <Text style={styles.emptySubtitle}>
              Add some friends to start sending snaps!
            </Text>
          </View>
        ) : (
          <FlatList
            data={friends}
            renderItem={renderFriendItem}
            keyExtractor={(item) => item.uid}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
          />
        )}
      </View>

      {/* Send button */}
      {friends.length > 0 && (
        <View style={styles.sendButtonContainer}>
                                  <Button
              title={isSending 
                ? "Sending..." 
                : `Send to ${selectedFriends.length} friend${selectedFriends.length !== 1 ? 's' : ''}`
              }
              onPress={handleSendSnap}
              disabled={selectedFriends.length === 0 || isSending}
              loading={isSending}
              style={{
                ...styles.sendButton,
                ...(selectedFriends.length > 0 && !isSending
                  ? styles.sendButtonActive 
                  : styles.sendButtonDisabled)
              }}
            />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 32,
  },
  selectedCount: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  selectedCountText: {
    color: '#60A5FA',
    textAlign: 'center',
  },
  uploadProgress: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  uploadProgressText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
  },
  friendsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 16,
  },
  emptyTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  flatListContent: {
    paddingVertical: 16,
  },
  friendItem: {
    marginBottom: 12,
  },
  friendItemContent: {
    position: 'relative',
  },
  disabled: {
    opacity: 0.5,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkboxUnselected: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  sendButtonContainer: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sendButton: {
    paddingVertical: 16,
    borderRadius: 25,
  },
  sendButtonActive: {
    backgroundColor: '#3B82F6',
  },
  sendButtonDisabled: {
    backgroundColor: '#4B5563',
  },

}); 