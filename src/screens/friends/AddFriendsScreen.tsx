import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/common/Screen';
import { UserCard } from '../../components/friends/UserCard';
import { FriendRequestCard } from '../../components/friends/FriendRequestCard';
import { useFriends } from '../../hooks/friends/use-friends';
import { getUserProfile } from '../../services/firebase/firestore.service';

/**
 * Add Friends screen for searching users and managing friend requests.
 * Provides search functionality, displays pending requests, and allows friend management.
 * Features glassmorphic design with real-time search and request handling.
 */

export function AddFriendsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [requestingUsers, setRequestingUsers] = useState<Record<string, any>>({});
  
  const {
    searchResults,
    pendingRequests,
    isSearching,
    isSendingRequest,
    isProcessingRequest,
    searchError,
    requestsError,
    searchUsers,
    sendRequest,
    acceptRequest,
    declineRequest,
    refreshRequests,
    clearSearch,
  } = useFriends();

  /**
   * Handle search input changes with debouncing
   */
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    
    if (text.trim().length >= 2) {
      // Debounce search to avoid too many API calls
      const timeoutId = setTimeout(() => {
        searchUsers(text);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    } else if (text.trim().length === 0) {
      clearSearch();
    }
  }, [searchUsers, clearSearch]);

  /**
   * Handle sending friend request
   */
  const handleSendRequest = useCallback(async (userId: string) => {
    try {
      await sendRequest(userId);
      Alert.alert('Success', 'Friend request sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send friend request. Please try again.');
    }
  }, [sendRequest]);

  /**
   * Handle accepting friend request
   */
  const handleAcceptRequest = useCallback(async (friendshipId: string) => {
    try {
      await acceptRequest(friendshipId);
      Alert.alert('Success', 'Friend request accepted!');
    } catch (error) {
      Alert.alert('Error', 'Failed to accept friend request. Please try again.');
    }
  }, [acceptRequest]);

  /**
   * Handle declining friend request
   */
  const handleDeclineRequest = useCallback(async (friendshipId: string) => {
    try {
      await declineRequest(friendshipId);
    } catch (error) {
      Alert.alert('Error', 'Failed to decline friend request. Please try again.');
    }
  }, [declineRequest]);

  /**
   * Load requesting user profiles for friend requests
   */
  React.useEffect(() => {
    const loadRequestingUsers = async () => {
      const userProfiles: Record<string, any> = {};
      
      for (const request of pendingRequests) {
        if (!requestingUsers[request.requestedBy]) {
          try {
            const profile = await getUserProfile(request.requestedBy);
            if (profile) {
              userProfiles[request.requestedBy] = profile;
            }
          } catch (error) {
            console.error('Error loading requesting user profile:', error);
          }
        }
      }
      
      if (Object.keys(userProfiles).length > 0) {
        setRequestingUsers(prev => ({ ...prev, ...userProfiles }));
      }
    };

    if (pendingRequests.length > 0) {
      loadRequestingUsers();
    }
  }, [pendingRequests]);

  /**
   * Clear search when screen focuses
   */
  React.useEffect(() => {
    return () => {
      clearSearch();
      setSearchQuery('');
    };
  }, [clearSearch]);

  return (
    <Screen backgroundColor="#000000" statusBarStyle="light-content">
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Add Friends</Text>
          <Text style={styles.subtitle}>Search for friends by username</Text>
        </View>

        {/* Search Section */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="rgba(255, 255, 255, 0.6)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search username..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  clearSearch();
                }}
              >
                <Ionicons name="close-circle" size={20} color="rgba(255, 255, 255, 0.6)" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={refreshRequests}
              tintColor="white"
            />
          }
        >
          {/* Search Results */}
          {searchQuery.length >= 2 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Search Results
                {isSearching && (
                  <Text style={styles.loadingText}> (Searching...)</Text>
                )}
              </Text>
              
              {searchError && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{searchError}</Text>
                </View>
              )}
              
              {searchResults.length === 0 && !isSearching && !searchError && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No users found</Text>
                </View>
              )}
              
              {searchResults.map((user) => (
                <UserCard
                  key={user.uid}
                  user={user}
                  actionType="addFriend"
                  isLoading={isSendingRequest}
                  onActionPress={() => handleSendRequest(user.uid)}
                />
              ))}
            </View>
          )}

          {/* Friend Requests */}
          {pendingRequests.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Friend Requests ({pendingRequests.length})
              </Text>
              
              {requestsError && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{requestsError}</Text>
                </View>
              )}
              
              {pendingRequests.map((request) => (
                <FriendRequestCard
                  key={request.id}
                  request={request}
                  requestingUser={requestingUsers[request.requestedBy] || null}
                  isLoading={isProcessingRequest}
                  onAccept={() => handleAcceptRequest(request.id)}
                  onDecline={() => handleDeclineRequest(request.id)}
                />
              ))}
            </View>
          )}

          {/* Empty State */}
          {pendingRequests.length === 0 && searchQuery.length < 2 && (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="people" size={60} color="rgba(255, 255, 255, 0.3)" />
              <Text style={styles.emptyStateTitle}>Find Friends</Text>
              <Text style={styles.emptyStateText}>
                Search for friends by their username to send friend requests
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
    marginHorizontal: 20,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: 'normal',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
    marginBottom: 12,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
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
  },
}); 