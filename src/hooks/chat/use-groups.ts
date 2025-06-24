import { useState, useEffect, useCallback } from 'react';
import {
  createGroup,
  getUserGroups,
  subscribeToUserGroups,
  addMembersToGroup as addMembersToGroupService,
  removeMemberFromGroup as removeMemberFromGroupService,
  updateGroupSettings as updateGroupSettingsService,
  type Group,
} from '../../services/firebase/firestore.service';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { sendGroupMessage } from '../../services/firebase/firestore.service';

/**
 * Custom hook for managing group functionality.
 * Handles group creation, member management, and settings.
 */
export function useGroups(currentUserId: string) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load user's groups
   */
  const loadGroups = useCallback(async () => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      setError(null);
      const userGroups = await getUserGroups(currentUserId);
      setGroups(userGroups);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  /**
   * Create a new group
   */
  const createNewGroup = useCallback(async (
    groupData: {
      name: string;
      description?: string;
      participants: string[];
    }
  ): Promise<string> => {
    try {
      setError(null);
      const groupId = await createGroup(groupData, currentUserId);
      await loadGroups(); // Refresh groups list
      return groupId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create group';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [currentUserId, loadGroups]);

  /**
   * Add members to a group
   */
  const addMembersToGroup = useCallback(async (
    groupId: string,
    memberIds: string[]
  ): Promise<void> => {
    try {
      setError(null);
      await addMembersToGroupService(groupId, memberIds, currentUserId);
      await loadGroups(); // Refresh groups list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add members';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [currentUserId, loadGroups]);

  /**
   * Remove a member from a group
   */
  const removeMemberFromGroup = useCallback(async (
    groupId: string,
    memberId: string
  ): Promise<void> => {
    try {
      setError(null);
      await removeMemberFromGroupService(groupId, memberId, currentUserId);
      await loadGroups(); // Refresh groups list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove member';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [currentUserId, loadGroups]);

  /**
   * Update group settings
   */
  const updateSettings = useCallback(async (
    groupId: string,
    settings: Partial<Group['settings']>
  ): Promise<void> => {
    try {
      setError(null);
      await updateGroupSettingsService(groupId, settings);
      await loadGroups(); // Refresh groups list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [loadGroups]);

  /**
   * Check if user is admin of a group
   */
  const isAdmin = useCallback((group: Group): boolean => {
    return group.admins.includes(currentUserId);
  }, [currentUserId]);

  /**
   * Check if user can message in a group
   */
  const canMessage = useCallback((group: Group): boolean => {
    if (!group.settings.onlyAdminsCanMessage) return true;
    return group.admins.includes(currentUserId);
  }, [currentUserId]);

  /**
   * Update group name
   */
  const updateGroupName = useCallback(async (groupId: string, newName: string): Promise<void> => {
    try {
      setError(null);
      await updateDoc(doc(db, 'groups', groupId), {
        name: newName,
      });
      
      // Send system message about name change
      await sendGroupMessage(groupId, {
        senderId: currentUserId,
        type: 'system',
        systemMessageType: 'name_changed',
        metadata: {
          newName,
        },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update group name';
      setError(errorMessage);
      throw err;
    }
  }, [currentUserId]);

  /**
   * Update group settings
   */
  const updateGroupSettings = useCallback(async (
    groupId: string, 
    settings: Partial<Group['settings']>
  ): Promise<void> => {
    try {
      setError(null);
      await updateDoc(doc(db, 'groups', groupId), {
        settings,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update group settings';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Leave group
   */
  const leaveGroup = useCallback(async (groupId: string, userId: string): Promise<void> => {
    try {
      setError(null);
      await removeMemberFromGroupService(groupId, userId, userId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to leave group';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Set up real-time listener for groups
  useEffect(() => {
    if (!currentUserId) return;

    const unsubscribe = subscribeToUserGroups(currentUserId, (updatedGroups) => {
      setGroups(updatedGroups);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  // Initial load
  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  return {
    groups,
    loading,
    error,
    createNewGroup,
    addMembersToGroup,
    removeMemberFromGroup,
    updateGroupName,
    updateGroupSettings,
    leaveGroup,
    refreshGroups: loadGroups,
  };
} 