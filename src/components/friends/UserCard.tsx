import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile } from '../../services/firebase/firestore.service';

/**
 * Reusable user card component for displaying users in search results and friends lists.
 * Supports different action types (add friend, online status, etc.) with glassmorphic design.
 * Follows the app's dark minimalism design system.
 */

interface UserCardProps {
  user: UserProfile;
  actionType?: 'addFriend' | 'friendStatus' | 'none';
  isLoading?: boolean;
  onPress?: () => void;
  onActionPress?: () => void;
}

export function UserCard({ 
  user, 
  actionType = 'none', 
  isLoading = false,
  onPress,
  onActionPress 
}: UserCardProps) {
  
  /**
   * Render action button based on type
   */
  const renderActionButton = () => {
    switch (actionType) {
      case 'addFriend':
        return (
          <TouchableOpacity
            style={[styles.actionButton, isLoading && styles.actionButtonDisabled]}
            onPress={onActionPress}
            disabled={isLoading}
          >
            <Ionicons 
              name={isLoading ? "hourglass" : "person-add"} 
              size={20} 
              color="white" 
            />
          </TouchableOpacity>
        );
      
      case 'friendStatus':
        return (
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: user.isOnline ? '#00FF88' : '#666666' }
            ]} />
            <Text style={styles.statusText}>
              {user.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* User Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.username?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={styles.username}>{user.username || 'Unknown User'}</Text>
        {user.displayName && (
          <Text style={styles.displayName}>{user.displayName}</Text>
        )}
      </View>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        {renderActionButton()}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  actionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 132, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 132, 255, 0.3)',
  },
  actionButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
}); 