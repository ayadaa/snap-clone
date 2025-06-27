/**
 * @fileoverview Custom hook for managing daily math challenges
 * 
 * This hook provides:
 * - Loading today's challenge
 * - Submitting answers
 * - Tracking progress and streaks
 * - Managing challenge state
 */

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  getTodaysChallenge,
  submitAnswer,
  getUserChallengeStats,
  hasSubmittedToday,
  getUserGradeLevel,
  DailyChallenge,
  ChallengeResult,
  ChallengeStats,
  ChallengeSubmission
} from '../../services/firebase/challenges.service';

interface UseDailyChallengeState {
  challenge: DailyChallenge | null;
  stats: ChallengeStats | null;
  isLoading: boolean;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  error: string | null;
  lastResult: ChallengeResult | null;
}

interface UseDailyChallengeActions {
  loadChallenge: () => Promise<void>;
  submitChallengeAnswer: (answer: string, submissionType?: 'text' | 'image', imageUrl?: string) => Promise<ChallengeResult>;
  refreshStats: () => Promise<void>;
  clearError: () => void;
  resetChallenge: () => void;
}

export interface UseDailyChallengeReturn extends UseDailyChallengeState, UseDailyChallengeActions {}

/**
 * Custom hook for managing daily math challenges
 */
export function useDailyChallenge(): UseDailyChallengeReturn {
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [state, setState] = useState<UseDailyChallengeState>({
    challenge: null,
    stats: null,
    isLoading: false,
    isSubmitting: false,
    hasSubmitted: false,
    error: null,
    lastResult: null
  });

  /**
   * Load today's challenge for the user's grade level
   */
  const loadChallenge = useCallback(async () => {
    if (!user) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get user's preferred grade level
      const gradeLevel = await getUserGradeLevel(user.uid);
      
      // Load today's challenge
      const challenge = await getTodaysChallenge(gradeLevel);
      
      // Check if user has already submitted
      const submitted = await hasSubmittedToday(user.uid, challenge.id);
      
      setState(prev => ({
        ...prev,
        challenge,
        hasSubmitted: submitted,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error loading challenge:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load challenge',
        isLoading: false
      }));
    }
  }, [user]);

  /**
   * Submit an answer for the current challenge
   */
  const submitChallengeAnswer = useCallback(async (
    answer: string,
    submissionType: 'text' | 'image' = 'text',
    imageUrl?: string
  ): Promise<ChallengeResult> => {
    if (!user || !state.challenge) {
      throw new Error('No challenge available or user not authenticated');
    }

    if (state.hasSubmitted) {
      throw new Error('You have already submitted an answer for today\'s challenge');
    }

    setState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const submission: ChallengeSubmission = {
        challengeId: state.challenge.id,
        answer: answer.trim(),
        submissionType,
        imageUrl
      };

      const result = await submitAnswer(submission);
      
      setState(prev => ({
        ...prev,
        hasSubmitted: true,
        lastResult: result,
        isSubmitting: false
      }));

      // Refresh stats after successful submission
      await refreshStats();

      return result;
    } catch (error) {
      console.error('Error submitting answer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit answer';
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isSubmitting: false
      }));
      
      throw new Error(errorMessage);
    }
  }, [user, state.challenge, state.hasSubmitted]);

  /**
   * Refresh user's challenge statistics
   */
  const refreshStats = useCallback(async () => {
    if (!user) return;

    try {
      const stats = await getUserChallengeStats(user.uid);
      setState(prev => ({ ...prev, stats }));
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  }, [user]);

  /**
   * Clear any error messages
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Reset challenge state (useful for testing or manual refresh)
   */
  const resetChallenge = useCallback(() => {
    setState({
      challenge: null,
      stats: null,
      isLoading: false,
      isSubmitting: false,
      hasSubmitted: false,
      error: null,
      lastResult: null
    });
  }, []);

  // Load challenge and stats when user changes
  useEffect(() => {
    if (user) {
      loadChallenge();
      refreshStats();
    } else {
      resetChallenge();
    }
  }, [user, loadChallenge, refreshStats, resetChallenge]);

  // Auto-refresh challenge at midnight (new day)
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timer = setTimeout(() => {
      // Refresh challenge for new day
      loadChallenge();
    }, timeUntilMidnight);

    return () => clearTimeout(timer);
  }, [loadChallenge]);

  return {
    ...state,
    loadChallenge,
    submitChallengeAnswer,
    refreshStats,
    clearError,
    resetChallenge
  };
}

/**
 * Helper hook for challenge statistics only
 */
export function useChallengeStats() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [stats, setStats] = useState<ChallengeStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadStats = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const userStats = await getUserChallengeStats(user.uid);
      setStats(userStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadStats();
    } else {
      setStats(null);
    }
  }, [user, loadStats]);

  return {
    stats,
    isLoading,
    refreshStats: loadStats
  };
} 