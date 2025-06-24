/**
 * Create Group Screen
 * Allows users to create new group chats by selecting friends and setting group name
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { Screen } from '../../components/common/Screen';
import { Button } from '../../components/common/Button';
import { UserCard } from '../../components/friends/UserCard';
import { useFriends } from '../../hooks/friends/use-friends';
import { useGroups } from '../../hooks/chat/use-groups';
import { type UserProfile } from '../../services/firebase/firestore.service';
import type { RootState } from '../../store';
import type { NavigationProp } from '../../types/navigation';

interface SelectedFriend {
  uid: string;
  username: string;
}

export default function CreateGroupScreen() {
  const navigation = useNavigation<NavigationProp>();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const { friends, isLoadingFriends } = useFriends();
  const { createNewGroup } = useGroups(user?.uid || '');
  
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<SelectedFriend[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  /**
   * Toggle friend selection
   */
  const toggleFriendSelection = useCallback((friend: { uid: string; username: string }) => {
    setSelectedFriends(prev => {
      const isSelected = prev.some(f => f.uid === friend.uid);
      if (isSelected) {
        return prev.filter(f => f.uid !== friend.uid);
      } else {
        return [...prev, friend];
      }
    });
  }, []);

  /**
   * Check if a friend is selected
   */
  const isFriendSelected = useCallback((friendId: string): boolean => {
    return selectedFriends.some(f => f.uid === friendId);
  }, [selectedFriends]);

  /**
   * Handle group creation
   */
  const handleCreateGroup = useCallback(async () => {
    if (!groupName.trim()) {
      Alert.alert('Group Name Required', 'Please enter a name for your group.');
      return;
    }

    if (selectedFriends.length === 0) {
      Alert.alert('Select Friends', 'Please select at least one friend to add to the group.');
      return;
    }

    if (!user) return;

    setIsCreating(true);

    try {
      const groupId = await createNewGroup({
        name: groupName.trim(),
        participants: selectedFriends.map(f => f.uid),
      });

      Alert.alert(
        'Group Created!',
        `"${groupName}" has been created successfully.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to the new group chat
              navigation.navigate('GroupChat', { groupId });
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to create group. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCreating(false);
    }
  }, [groupName, selectedFriends, user, createNewGroup, navigation]);

  /**
   * Render friend item with selection checkbox
   */
  const renderFriendItem = useCallback(({ item }: { item: UserProfile }) => {
    const isSelected = isFriendSelected(item.uid);
    
    return (
      <TouchableOpacity
        style={styles.friendItem}
        onPress={() => toggleFriendSelection(item)}
      >
        <View style={styles.friendInfo}>
          <UserCard user={item} />
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && (
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          )}
        </View>
      </TouchableOpacity>
    );
  }, [isFriendSelected, toggleFriendSelection]);

  /**
   * Render selected friends count
   */
  const renderSelectedCount = () => {
    if (selectedFriends.length === 0) return null;
    
    return (
      <View style={styles.selectedContainer}>
        <Text style={styles.selectedText}>
          {selectedFriends.length} friend{selectedFriends.length !== 1 ? 's' : ''} selected
        </Text>
      </View>
    );
  };

  return (
    <Screen style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Group</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Group Name Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Group Name</Text>
        <TextInput
          style={styles.textInput}
          value={groupName}
          onChangeText={setGroupName}
          placeholder="Enter group name..."
          placeholderTextColor="#AAAAAA"
          maxLength={50}
        />
      </View>

      {/* Selected Friends Count */}
      {renderSelectedCount()}

      {/* Friends List */}
      <View style={styles.friendsContainer}>
        <Text style={styles.sectionTitle}>Select Friends</Text>
        
        {isLoadingFriends ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading friends...</Text>
          </View>
        ) : friends.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No friends found</Text>
            <Text style={styles.emptySubtext}>
              Add friends to create group chats
            </Text>
          </View>
        ) : (
          <FlatList
            data={friends}
            renderItem={renderFriendItem}
            keyExtractor={(item) => item.uid}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.friendsList}
          />
        )}
      </View>

      {/* Create Button */}
      <View style={styles.buttonContainer}>
        <Button
          title={isCreating ? 'Creating...' : 'Create Group'}
          onPress={handleCreateGroup}
          disabled={isCreating || !groupName.trim() || selectedFriends.length === 0}
          style={styles.createButton}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  inputContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 132, 255, 0.1)',
  },
  selectedText: {
    fontSize: 14,
    color: '#0084FF',
    fontWeight: '500',
  },
  friendsContainer: {
    flex: 1,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  friendsList: {
    paddingBottom: 100,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  friendInfo: {
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  checkboxSelected: {
    backgroundColor: '#0084FF',
    borderColor: '#0084FF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#AAAAAA',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  createButton: {
    backgroundColor: '#0084FF',
    paddingVertical: 16,
  },
}); 