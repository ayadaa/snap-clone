import { useState, useEffect, useCallback } from 'react';
import {
  createGroup,
  getUserGroups,
  subscribeToUserGroups,
  addMembersToGroup,
  removeMemberFromGroup,
  updateGroupSettings,
  type Group,
} from '../../services/firebase/firestore.service';

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
  const addMembers = useCallback(async (
    groupId: string,
    memberIds: string[]
  ): Promise<void> => {
    try {
      setError(null);
      await addMembersToGroup(groupId, memberIds, currentUserId);
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
  const removeMember = useCallback(async (
    groupId: string,
    memberId: string
  ): Promise<void> => {
    try {
      setError(null);
      await removeMemberFromGroup(groupId, memberId, currentUserId);
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
      await updateGroupSettings(groupId, settings);
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
    addMembers,
    removeMember,
    updateSettings,
    isAdmin,
    canMessage,
    refreshGroups: loadGroups,
  };
} 