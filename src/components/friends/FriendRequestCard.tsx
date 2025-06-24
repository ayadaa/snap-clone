import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Friendship, UserProfile } from '../../services/firebase/firestore.service';

/**
 * Component for displaying friend requests with accept/decline actions.
 * Shows the requesting user's information and provides action buttons.
 * Follows glassmorphic design with proper loading states.
 */

interface FriendRequestCardProps {
  request: Friendship;
  requestingUser: UserProfile | null;
  isLoading?: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function FriendRequestCard({ 
  request, 
  requestingUser, 
  isLoading = false,
  onAccept,
  onDecline 
}: FriendRequestCardProps) {

  if (!requestingUser) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading request...</Text>
        </View>
      </View>
    );
  }

  /**
   * Format the request timestamp
   */
  const formatRequestTime = (timestamp: any) => {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <View style={styles.container}>
      {/* User Info */}
      <View style={styles.userSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {requestingUser.username?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.username}>{requestingUser.username || 'Unknown User'}</Text>
          {requestingUser.displayName && (
            <Text style={styles.displayName}>{requestingUser.displayName}</Text>
          )}
          <Text style={styles.requestTime}>
            Sent {formatRequestTime(request.createdAt)}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton, isLoading && styles.buttonDisabled]}
          onPress={onAccept}
          disabled={isLoading}
        >
          <Ionicons 
            name={isLoading ? "hourglass" : "checkmark"} 
            size={20} 
            color="white" 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.declineButton, isLoading && styles.buttonDisabled]}
          onPress={onDecline}
          disabled={isLoading}
        >
          <Ionicons 
            name={isLoading ? "hourglass" : "close"} 
            size={20} 
            color="white" 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 16,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  displayName: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  requestTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    width: 60,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  acceptButton: {
    backgroundColor: 'rgba(0, 255, 136, 0.8)',
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  declineButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  buttonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
}); 