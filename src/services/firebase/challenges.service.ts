/**
 * @fileoverview Firebase service for daily math challenges
 * 
 * This service handles all interactions with the daily challenge system:
 * - Fetching daily challenges
 * - Submitting challenge answers
 * - Tracking user progress and streaks
 * - Managing challenge statistics
 */

import { httpsCallable } from 'firebase/functions';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { functions, db } from '../../config/firebase';

/**
 * Daily Challenge Types
 */
export interface DailyChallenge {
  id: string;
  date: string;
  gradeLevel: string;
  type: 'word-problem' | 'equation' | 'multiple-choice' | 'concept';
  problem: string;
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  concepts: string[];
  sources: Array<{
    book: string;
    chapter: string;
    section: string;
  }>;
}

export interface ChallengeSubmission {
  challengeId: string;
  answer: string;
  submissionType: 'text' | 'image';
  imageUrl?: string;
}

export interface ChallengeResult {
  isCorrect: boolean;
  score: number;
  feedback: string;
  correctAnswer?: string;
  explanation?: string;
  streak?: number;
  totalPoints?: number;
}

export interface ChallengeStats {
  totalChallenges: number;
  correctAnswers: number;
  currentStreak: number;
  bestStreak: number;
  totalPoints: number;
  lastChallengeDate: string | null;
  accuracyRate: number;
}

export interface ChallengeHistory {
  challengeId: string;
  date: string;
  problem: string;
  isCorrect: boolean;
  score: number;
  difficulty: 'easy' | 'medium' | 'hard';
  submittedAt: Date;
}

/**
 * Cloud Function callable instances
 */
const generateDailyChallengeCallable = httpsCallable(functions, 'generateDailyChallenge');
const submitChallengeAnswerCallable = httpsCallable(functions, 'submitChallengeAnswer');
const getDailyChallengeCallable = httpsCallable(functions, 'getDailyChallenge');

/**
 * Get today's daily challenge for a specific grade level
 */
export async function getTodaysChallenge(gradeLevel: string): Promise<DailyChallenge> {
  try {
    const result = await getDailyChallengeCallable({ gradeLevel });
    const data = result.data as { success: boolean; challenge?: DailyChallenge; error?: string };
    
    if (!data.success || !data.challenge) {
      throw new Error(data.error || 'Failed to get daily challenge');
    }
    
    return data.challenge;
  } catch (error) {
    console.error('Error getting daily challenge:', error);
    throw new Error('Failed to load today\'s challenge. Please try again.');
  }
}

/**
 * Generate a new daily challenge for a specific date and grade level
 */
export async function generateChallenge(
  gradeLevel: string, 
  challengeType: 'word-problem' | 'equation' | 'multiple-choice' | 'concept' = 'word-problem',
  date?: string
): Promise<DailyChallenge> {
  try {
    const result = await generateDailyChallengeCallable({
      gradeLevel,
      challengeType,
      date
    });
    
    const data = result.data as { success: boolean; challenge?: DailyChallenge; error?: string };
    
    if (!data.success || !data.challenge) {
      throw new Error(data.error || 'Failed to generate challenge');
    }
    
    return data.challenge;
  } catch (error) {
    console.error('Error generating challenge:', error);
    throw new Error('Failed to generate challenge. Please try again.');
  }
}

/**
 * Submit an answer for a daily challenge
 */
export async function submitAnswer(submission: ChallengeSubmission): Promise<ChallengeResult> {
  try {
    const result = await submitChallengeAnswerCallable(submission);
    const data = result.data as { success: boolean; result?: ChallengeResult; error?: string };
    
    if (!data.success || !data.result) {
      throw new Error(data.error || 'Failed to submit answer');
    }
    
    return data.result;
  } catch (error) {
    console.error('Error submitting answer:', error);
    
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('already submitted')) {
        throw new Error('You have already submitted an answer for this challenge today.');
      }
      if (error.message.includes('not found')) {
        throw new Error('Challenge not found. Please try refreshing the page.');
      }
    }
    
    throw new Error('Failed to submit answer. Please try again.');
  }
}

/**
 * Get user's challenge statistics
 */
export async function getUserChallengeStats(userId: string): Promise<ChallengeStats> {
  try {
    const statsDoc = await getDoc(
      doc(db, 'users', userId, 'challengeProgress', 'stats')
    );
    
    if (!statsDoc.exists()) {
      // Return default stats for new users
      return {
        totalChallenges: 0,
        correctAnswers: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalPoints: 0,
        lastChallengeDate: null,
        accuracyRate: 0
      };
    }
    
    const data = statsDoc.data();
    return {
      ...data,
      accuracyRate: data.totalChallenges > 0 
        ? Math.round((data.correctAnswers / data.totalChallenges) * 100) 
        : 0
    } as ChallengeStats;
  } catch (error) {
    console.error('Error getting challenge stats:', error);
    throw new Error('Failed to load challenge statistics.');
  }
}

/**
 * Get user's challenge history (recent submissions)
 */
export async function getChallengeHistory(userId: string, limitCount: number = 10): Promise<ChallengeHistory[]> {
  try {
    const historyQuery = query(
      collection(db, 'challengeSubmissions'),
      where('userId', '==', userId),
      orderBy('submittedAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(historyQuery);
    const history: ChallengeHistory[] = [];
    
    for (const docSnapshot of snapshot.docs) {
      const submission = docSnapshot.data();
      
      // Get challenge details
      const challengeDoc = await getDoc(
        doc(db, 'dailyChallenges', submission.challengeId)
      );
      
      if (challengeDoc.exists()) {
        const challenge = challengeDoc.data() as DailyChallenge;
        history.push({
          challengeId: submission.challengeId,
          date: challenge.date,
          problem: challenge.problem,
          isCorrect: submission.isCorrect,
          score: submission.score,
          difficulty: challenge.difficulty,
          submittedAt: submission.submittedAt.toDate()
        });
      }
    }
    
    return history;
  } catch (error) {
    console.error('Error getting challenge history:', error);
    throw new Error('Failed to load challenge history.');
  }
}

/**
 * Check if user has already submitted for today's challenge
 */
export async function hasSubmittedToday(userId: string, challengeId: string): Promise<boolean> {
  try {
    const submissionQuery = query(
      collection(db, 'challengeSubmissions'),
      where('userId', '==', userId),
      where('challengeId', '==', challengeId),
      limit(1)
    );
    
    const snapshot = await getDocs(submissionQuery);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking submission status:', error);
    return false; // Default to allowing submission on error
  }
}

/**
 * Get challenge leaderboard (top users by points)
 */
export async function getChallengeLeaderboard(limitCount: number = 10): Promise<Array<{
  userId: string;
  username: string;
  totalPoints: number;
  currentStreak: number;
  rank: number;
}>> {
  try {
    // Note: This would require a composite index in Firestore
    // For now, we'll implement a simpler version
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const leaderboard: Array<{
      userId: string;
      username: string;
      totalPoints: number;
      currentStreak: number;
      rank: number;
    }> = [];
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      try {
        const stats = await getUserChallengeStats(userId);
        if (stats.totalPoints > 0) {
          leaderboard.push({
            userId,
            username: userData.username || 'Anonymous',
            totalPoints: stats.totalPoints,
            currentStreak: stats.currentStreak,
            rank: 0 // Will be set after sorting
          });
        }
      } catch {
        // Skip users with no challenge stats
        continue;
      }
    }
    
    // Sort by total points and assign ranks
    leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    return leaderboard.slice(0, limitCount);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw new Error('Failed to load leaderboard.');
  }
}

/**
 * Update user's grade level preference for challenges
 */
export async function updateUserGradeLevel(userId: string, gradeLevel: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', userId), {
      preferredGradeLevel: gradeLevel,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating grade level:', error);
    throw new Error('Failed to update grade level preference.');
  }
}

/**
 * Get user's preferred grade level
 */
export async function getUserGradeLevel(userId: string): Promise<string> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const gradeLevel = userData.preferredGradeLevel || 'middle'; // Default to middle school
      
      // Convert specific grade to category if needed
      return convertGradeLevelToCategory(gradeLevel);
    }
    
    return 'middle'; // Default for new users
  } catch (error) {
    console.error('Error getting user grade level:', error);
    return 'middle'; // Default on error
  }
}

/**
 * Convert specific grade levels to categories expected by backend
 */
function convertGradeLevelToCategory(gradeLevel: string): string {
  // If already in category format, return as is
  if (['elementary', 'middle', 'high'].includes(gradeLevel)) {
    return gradeLevel;
  }
  
  // Extract numeric grade if format is like "6th", "K", etc.
  const numericGrade = parseInt(gradeLevel.replace(/\D/g, ''));
  
  if (isNaN(numericGrade)) {
    // Handle special cases like "K" for Kindergarten
    if (gradeLevel.toLowerCase().includes('k')) {
      return 'elementary';
    }
    return 'middle'; // Default fallback
  }
  
  // Convert numeric grades to categories
  if (numericGrade <= 5) {
    return 'elementary';
  } else if (numericGrade <= 8) {
    return 'middle';
  } else {
    return 'high';
  }
} 