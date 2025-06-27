/**
 * @fileoverview Custom hook for managing math challenges
 * 
 * This hook provides functionality for:
 * - Creating math challenges from practice problems
 * - Sending challenge snaps to friends
 * - Managing challenge responses
 * - Tracking challenge history
 */

import { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Alert } from 'react-native';
import {
  createMathChallenge,
  sendChallengeSnap,
  getMathChallenge,
  getChallengeSnap,
  submitChallengeAnswer,
  markChallengeSnapAsViewed,
  getReceivedChallengeSnaps,
  getSentChallengeSnaps,
  createOrGetChat,
  type MathChallenge,
  type ChallengeSnap,
} from '../../services/firebase/firestore.service';
import { RootState } from '../../store';

/**
 * Interface for creating a challenge from a practice problem
 */
export interface CreateChallengeData {
  problem: string;
  concept: string;
  gradeLevel: string;
  correctAnswer: string;
  explanation?: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  timeLimit?: number;
}

/**
 * Interface for challenge hook return type
 */
interface UseMathChallengesReturn {
  // State
  isLoading: boolean;
  error: string | null;
  receivedChallenges: ChallengeSnap[];
  sentChallenges: ChallengeSnap[];
  
  // Actions
  createAndSendChallenge: (challengeData: CreateChallengeData, recipientId: string) => Promise<void>;
  viewChallenge: (challengeSnapId: string) => Promise<{ challenge: MathChallenge; challengeSnap: ChallengeSnap } | null>;
  submitAnswer: (challengeSnapId: string, answer: string) => Promise<{ isCorrect: boolean; explanation?: string }>;
  loadChallenges: () => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook for managing math challenges
 */
export function useMathChallenges(): UseMathChallengesReturn {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receivedChallenges, setReceivedChallenges] = useState<ChallengeSnap[]>([]);
  const [sentChallenges, setSentChallenges] = useState<ChallengeSnap[]>([]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Load all challenges (received and sent)
   */
  const loadChallenges = useCallback(async () => {
    if (!currentUser?.uid) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [received, sent] = await Promise.all([
        getReceivedChallengeSnaps(currentUser.uid),
        getSentChallengeSnaps(currentUser.uid),
      ]);

      setReceivedChallenges(received);
      setSentChallenges(sent);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load challenges';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.uid]);

  /**
   * Create a challenge and send it to a friend
   */
  const createAndSendChallenge = useCallback(async (
    challengeData: CreateChallengeData,
    recipientId: string
  ) => {
    if (!currentUser?.uid) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create the math challenge
      const challengeId = await createMathChallenge({
        ...challengeData,
        createdBy: currentUser.uid,
      });

      // Get or create chat with recipient
      const chatId = await createOrGetChat(currentUser.uid, recipientId);

      // Send the challenge snap
      await sendChallengeSnap(challengeId, currentUser.uid, recipientId, chatId);

      // Refresh challenges list
      await loadChallenges();

      Alert.alert(
        'Challenge Sent! 🎯',
        'Your math challenge has been sent to your friend.',
        [{ text: 'OK' }]
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send challenge';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.uid, loadChallenges]);

  /**
   * View a challenge (for recipients)
   */
  const viewChallenge = useCallback(async (challengeSnapId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get challenge snap data
      const challengeSnap = await getChallengeSnap(challengeSnapId);
      if (!challengeSnap) {
        throw new Error('Challenge not found');
      }

      // Get the actual challenge data
      const challenge = await getMathChallenge(challengeSnap.challengeId);
      if (!challenge) {
        throw new Error('Challenge data not found');
      }

      // Mark as viewed if not already viewed
      if (challengeSnap.status === 'sent') {
        await markChallengeSnapAsViewed(challengeSnapId);
        await loadChallenges(); // Refresh to show updated status
      }

      return { challenge, challengeSnap };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to view challenge';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [loadChallenges]);

  /**
   * Submit an answer to a challenge
   */
  const submitAnswer = useCallback(async (challengeSnapId: string, answer: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await submitChallengeAnswer(challengeSnapId, answer);
      
      // Refresh challenges to show updated status
      await loadChallenges();

      // Show result to user
      Alert.alert(
        result.isCorrect ? 'Correct! 🎉' : 'Not quite right 🤔',
        result.isCorrect 
          ? 'Great job! You solved the challenge correctly.'
          : `The correct answer was different. ${result.explanation ? '\n\n' + result.explanation : ''}`,
        [{ text: 'OK' }]
      );

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit answer';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [loadChallenges]);

  /**
   * Load challenges on mount
   */
  useEffect(() => {
    if (currentUser?.uid) {
      loadChallenges();
    }
  }, [currentUser?.uid, loadChallenges]);

  return {
    // State
    isLoading,
    error,
    receivedChallenges,
    sentChallenges,
    
    // Actions
    createAndSendChallenge,
    viewChallenge,
    submitAnswer,
    loadChallenges,
    clearError,
  };
} 