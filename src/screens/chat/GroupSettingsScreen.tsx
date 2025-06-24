/**
 * Group Settings Screen
 * Manages group details, member management, and group settings
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
  Switch,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { Screen } from '../../components/common/Screen';
import { Button } from '../../components/common/Button';
import { UserCard } from '../../components/friends/UserCard';
import { useGroups } from '../../hooks/chat/use-groups';
import { useFriends } from '../../hooks/friends/use-friends';
import { getUserProfile, type UserProfile, type Group } from '../../services/firebase/firestore.service';
import type { RootState } from '../../store';
import type { AppStackParamList } from '../../types/navigation';

type GroupSettingsRouteProp = RouteProp<AppStackParamList, 'GroupSettings'>;

interface GroupMember extends UserProfile {
  isAdmin: boolean;
}

export default function GroupSettingsScreen() {
  const navigation = useNavigation();
  const route = useRoute<GroupSettingsRouteProp>();
  const { groupId } = route.params;
  
  const user = useSelector((state: RootState) => state.auth.user);
  const { friends } = useFriends();
  const { 
    groups, 
    updateGroupName, 
    addMembersToGroup, 
    removeMemberFromGroup,
    updateGroupSettings,
    leaveGroup 
  } = useGroups(user?.uid || '');

  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load group details and members
  React.useEffect(() => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setCurrentGroup(group);
      setNewGroupName(group.name);
      loadGroupMembers(group);
    }
  }, [groups, groupId]);

  /**
   * Load group member profiles
   */
  const loadGroupMembers = useCallback(async (group: Group) => {
    try {
      const memberProfiles: GroupMember[] = [];
      
      for (const participantId of group.participants) {
        const profile = await getUserProfile(participantId);
        if (profile) {
          memberProfiles.push({
            ...profile,
            isAdmin: group.admins.includes(participantId),
          });
        }
      }
      
      setGroupMembers(memberProfiles);
    } catch (error) {
      console.error('Error loading group members:', error);
    }
  }, []);

  /**
   * Save group name changes
   */
  const handleSaveGroupName = useCallback(async () => {
    if (!currentGroup || !newGroupName.trim()) return;
    
    try {
      setIsLoading(true);
      await updateGroupName(currentGroup.id, newGroupName.trim());
      setIsEditingName(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update group name');
    } finally {
      setIsLoading(false);
    }
  }, [currentGroup, newGroupName, updateGroupName]);

  /**
   * Remove member from group
   */
  const handleRemoveMember = useCallback(async (memberId: string, memberName: string) => {
    if (!currentGroup || !user) return;
    
    // Check if current user is admin
    if (!currentGroup.admins.includes(user.uid)) {
      Alert.alert('Permission Denied', 'Only group admins can remove members.');
      return;
    }
    
    // Prevent removing yourself
    if (memberId === user.uid) {
      Alert.alert('Cannot Remove Yourself', 'Use "Leave Group" to exit the group.');
      return;
    }
    
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${memberName} from the group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await removeMemberFromGroup(currentGroup.id, memberId);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove member');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  }, [currentGroup, user, removeMemberFromGroup]);

  /**
   * Leave group
   */
  const handleLeaveGroup = useCallback(() => {
    if (!currentGroup || !user) return;
    
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await leaveGroup(currentGroup.id, user.uid);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to leave group');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  }, [currentGroup, user, leaveGroup, navigation]);

  /**
   * Toggle group settings
   */
  const handleToggleSetting = useCallback(async (setting: keyof Group['settings'], value: boolean) => {
    if (!currentGroup || !user) return;
    
    // Check if current user is admin
    if (!currentGroup.admins.includes(user.uid)) {
      Alert.alert('Permission Denied', 'Only group admins can change group settings.');
      return;
    }
    
    try {
      await updateGroupSettings(currentGroup.id, {
        ...currentGroup.settings,
        [setting]: value,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to update group settings');
    }
  }, [currentGroup, user, updateGroupSettings]);

  /**
   * Render group member item
   */
  const renderMemberItem = useCallback(({ item }: { item: GroupMember }) => {
    const isCurrentUser = item.uid === user?.uid;
    const canRemove = currentGroup?.admins.includes(user?.uid || '') && !isCurrentUser;
    
    // Debug logging
    console.log('Member:', item.username, 'isAdmin:', item.isAdmin, 'uid:', item.uid);
    console.log('Group admins:', currentGroup?.admins);
    
    return (
      <View style={styles.memberItem}>
        <View style={styles.memberInfo}>
          <View style={styles.memberAvatar}>
            <Text style={styles.memberAvatarText}>
              {item.username?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.memberDetails}>
            <Text style={styles.memberName}>{item.username || 'Unknown User'}</Text>
            {item.displayName && (
              <Text style={styles.memberDisplayName}>{item.displayName}</Text>
            )}
          </View>
          {item.isAdmin && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          )}
        </View>
        {canRemove && (
          <TouchableOpacity
            style={styles.removeMemberButton}
            onPress={() => handleRemoveMember(item.uid, item.username || '')}
          >
            <Ionicons name="remove-circle" size={24} color="#FF3B30" />
          </TouchableOpacity>
        )}
      </View>
    );
  }, [currentGroup, user, handleRemoveMember]);

  if (!currentGroup) {
    return (
      <Screen style={styles.container}>
        <Text style={styles.loadingText}>Loading group settings...</Text>
      </Screen>
    );
  }

  const isAdmin = currentGroup.admins.includes(user?.uid || '');

  return (
    <Screen style={styles.container} keyboardAvoidingView>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Group Name Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Group Name</Text>
        {isEditingName ? (
          <View style={styles.editNameContainer}>
            <TextInput
              style={styles.nameInput}
              value={newGroupName}
              onChangeText={setNewGroupName}
              placeholder="Enter group name"
              autoFocus
            />
            <View style={styles.editNameButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsEditingName(false);
                  setNewGroupName(currentGroup.name);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveGroupName}
                disabled={isLoading}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.nameDisplayContainer}>
            <Text style={styles.groupName}>{currentGroup.name}</Text>
            {isAdmin && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditingName(true)}
              >
                <Ionicons name="pencil" size={20} color="#0084FF" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Members Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Members ({groupMembers.length})
          </Text>
        </View>
        <FlatList
          data={groupMembers}
          renderItem={renderMemberItem}
          keyExtractor={(item) => item.uid}
          style={styles.membersList}
        />
      </View>

      {/* Group Settings Section */}
      {isAdmin && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group Settings</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Allow new members</Text>
            <Switch
              value={currentGroup.settings.allowNewMembers}
              onValueChange={(value) => handleToggleSetting('allowNewMembers', value)}
              trackColor={{ false: '#767577', true: '#0084FF' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Only admins can message</Text>
            <Switch
              value={currentGroup.settings.onlyAdminsCanMessage}
              onValueChange={(value) => handleToggleSetting('onlyAdminsCanMessage', value)}
              trackColor={{ false: '#767577', true: '#0084FF' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Allow snap sharing</Text>
            <Switch
              value={currentGroup.settings.allowSnapSharing}
              onValueChange={(value) => handleToggleSetting('allowSnapSharing', value)}
              trackColor={{ false: '#767577', true: '#0084FF' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      )}

      {/* Leave Group Button */}
      <View style={styles.section}>
        <Button
          title="Leave Group"
          onPress={handleLeaveGroup}
          style={styles.leaveGroupButton}
          textStyle={styles.leaveGroupButtonText}
          disabled={isLoading}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  editNameContainer: {
    gap: 12,
  },
  nameInput: {
    backgroundColor: '#1C1C1E',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  editNameButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#333333',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#0084FF',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  nameDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupName: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  editButton: {
    padding: 8,
  },
  membersList: {
    maxHeight: 300,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  memberInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  memberDisplayName: {
    fontSize: 14,
    color: '#767577',
  },
  adminBadge: {
    backgroundColor: '#0084FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  removeMemberButton: {
    padding: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  leaveGroupButton: {
    backgroundColor: '#FF3B30',
  },
  leaveGroupButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loadingText: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 50,
  },
}); 