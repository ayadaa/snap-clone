import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../../components/common/Screen';
import { UserCard } from '../../components/friends/UserCard';
import { useFriends } from '../../hooks/friends/use-friends';
import { useChats } from '../../hooks/chat/use-chats';
import { useAuth } from '../../hooks/auth/use-auth';

/**
 * Friends List screen displaying all accepted friends with their online status.
 * Provides navigation to individual chats and friend management options.
 * Features pull-to-refresh and real-time status indicators.
 */

export function FriendsListScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const {
    friends,
    isLoadingFriends,
    friendsError,
    refreshFriends,
  } = useFriends();

  const { createChat } = useChats(user?.uid || '');

  /**
   * Handle friend card press - navigate to chat
   */
  const handleFriendPress = async (friendId: string, username: string) => {
    try {
      const chatId = await createChat(friendId);
      const friend = friends.find(f => f.uid === friendId);
      
      if (friend) {
        (navigation as any).navigate('IndividualChat', {
          chatId,
          otherUser: friend,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start chat. Please try again.');
      console.error('Error creating chat:', error);
    }
  };

  /**
   * Navigate to Add Friends screen
   */
  const handleAddFriendsPress = () => {
    navigation.navigate('AddFriends' as never);
  };

  /**
   * Handle refresh
   */
  const handleRefresh = async () => {
    try {
      await refreshFriends();
    } catch (error) {
      console.error('Error refreshing friends:', error);
    }
  };

  return (
    <Screen backgroundColor="#000000" statusBarStyle="light-content">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Friends</Text>
            <Text style={styles.subtitle}>
              {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddFriendsPress}
          >
            <Ionicons name="person-add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Error State */}
        {friendsError && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={24} color="#FF3B30" />
            <Text style={styles.errorText}>{friendsError}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRefresh}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Friends List */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoadingFriends}
              onRefresh={handleRefresh}
              tintColor="white"
            />
          }
        >
          {friends.length > 0 ? (
            <View style={styles.friendsList}>
              {friends.map((friend) => (
                <UserCard
                  key={friend.uid}
                  user={friend}
                  actionType="friendStatus"
                  onPress={() => handleFriendPress(friend.uid, friend.username)}
                />
              ))}
            </View>
          ) : (
            /* Empty State */
            <View style={styles.emptyStateContainer}>
              <Ionicons name="people-outline" size={80} color="rgba(255, 255, 255, 0.3)" />
              <Text style={styles.emptyStateTitle}>No Friends Yet</Text>
              <Text style={styles.emptyStateText}>
                Start by adding some friends to chat and share snaps with them
              </Text>
              <TouchableOpacity
                style={styles.addFriendsButton}
                onPress={handleAddFriendsPress}
              >
                <Ionicons name="person-add" size={20} color="white" />
                <Text style={styles.addFriendsButtonText}>Add Friends</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Online Friends Section */}
          {friends.filter(f => f.isOnline).length > 0 && (
            <View style={styles.onlineSection}>
              <Text style={styles.sectionTitle}>
                Online Now ({friends.filter(f => f.isOnline).length})
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.onlineScrollView}
              >
                {friends
                  .filter(friend => friend.isOnline)
                  .map((friend) => (
                    <TouchableOpacity
                      key={`online-${friend.uid}`}
                      style={styles.onlineFriendCard}
                      onPress={() => handleFriendPress(friend.uid, friend.username)}
                    >
                      <View style={styles.onlineAvatar}>
                        <Text style={styles.onlineAvatarText}>
                          {friend.username.charAt(0).toUpperCase()}
                        </Text>
                        <View style={styles.onlineIndicator} />
                      </View>
                      <Text style={styles.onlineUsername} numberOfLines={1}>
                        {friend.username}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 132, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 132, 255, 0.3)',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 8,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  friendsList: {
    paddingBottom: 20,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  addFriendsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 132, 255, 0.8)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 132, 255, 0.3)',
  },
  addFriendsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  onlineSection: {
    marginTop: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
    marginHorizontal: 20,
  },
  onlineScrollView: {
    paddingLeft: 20,
  },
  onlineFriendCard: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  onlineAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 136, 0.6)',
    position: 'relative',
  },
  onlineAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#00FF88',
    borderWidth: 2,
    borderColor: '#000000',
  },
  onlineUsername: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
    textAlign: 'center',
  },
}); 