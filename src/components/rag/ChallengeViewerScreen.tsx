/**
 * ChallengeViewerScreen Component
 * 
 * Displays math challenges with submission interface, progress tracking,
 * and AI-powered feedback. Handles both daily challenges and received challenge snaps.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useDailyChallenge } from '../../hooks/challenges/use-daily-challenge';
import { useMathChallenges } from '../../hooks/math/use-math-challenges';
import { getUserProfile } from '../../services/firebase/firestore.service';

interface ChallengeViewerScreenProps {
  navigation: any;
  route?: {
    params?: {
      challengeSnapId?: string;
      senderId?: string;
    };
  };
}

export function ChallengeViewerScreen({ navigation, route }: ChallengeViewerScreenProps) {
  // Get route parameters
  const challengeSnapId = route?.params?.challengeSnapId;
  const senderId = route?.params?.senderId;
  
  // Determine if this is a daily challenge or a received challenge
  const isDailyChallenge = !challengeSnapId;

  // Hooks for different challenge types
  const dailyChallengeHook = useDailyChallenge();
  const mathChallengesHook = useMathChallenges();
  
  // State for received challenges
  const [receivedChallenge, setReceivedChallenge] = useState<any>(null);
  const [isLoadingReceived, setIsLoadingReceived] = useState(false);
  const [receivedError, setReceivedError] = useState<string | null>(null);
  const [senderUsername, setSenderUsername] = useState<string | null>(null);

  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);

  // Use appropriate hook based on challenge type
  const {
    challenge,
    stats,
    isLoading,
    error,
    isSubmitting,
    hasSubmitted,
    lastResult,
    loadChallenge,
    submitChallengeAnswer,
    clearError,
  } = isDailyChallenge ? dailyChallengeHook : {
    challenge: receivedChallenge?.challenge,
    stats: null,
    isLoading: isLoadingReceived,
    error: receivedError,
    isSubmitting: false,
    hasSubmitted: false,
    lastResult: null,
    loadChallenge: async () => {},
    submitChallengeAnswer: async (answer: string, type: string) => {
      if (challengeSnapId) {
        return await mathChallengesHook.submitAnswer(challengeSnapId, answer);
      }
      throw new Error('No challenge snap ID');
    },
    clearError: () => setReceivedError(null),
  };

  // Load challenge based on type
  useEffect(() => {
    console.log('🔄 useEffect triggered:', { isDailyChallenge, challengeSnapId });
    
    if (isDailyChallenge) {
      console.log('📅 Loading daily challenge...');
      loadChallenge();
    } else if (challengeSnapId) {
      console.log('🎯 Loading received challenge...');
      
      // Load received challenge inline to avoid dependency issues
      const loadReceivedChallenge = async () => {
        console.log('🔍 Loading received challenge with ID:', challengeSnapId);
        setIsLoadingReceived(true);
        setReceivedError(null);
        
        try {
          console.log('📞 Calling mathChallengesHook.viewChallenge...');
          const result = await mathChallengesHook.viewChallenge(challengeSnapId);
          console.log('📦 viewChallenge result:', result);
          
          if (result) {
            console.log('✅ Setting received challenge data:', result);
            setReceivedChallenge(result);
            
            // Fetch sender's username
            if (result.challengeSnap?.senderId) {
              try {
                const senderProfile = await getUserProfile(result.challengeSnap.senderId);
                setSenderUsername(senderProfile?.username || null);
              } catch (error) {
                console.log('Failed to fetch sender profile:', error);
              }
            }
          } else {
            console.log('❌ No result from viewChallenge');
            setReceivedError('Challenge not found');
          }
        } catch (error) {
          console.log('💥 Error in loadReceivedChallenge:', error);
          setReceivedError(error instanceof Error ? error.message : 'Failed to load challenge');
        } finally {
          console.log('🏁 Setting isLoadingReceived to false');
          setIsLoadingReceived(false);
        }
      };
      
      loadReceivedChallenge();
    } else {
      console.log('⚠️ No challenge type determined');
    }
  }, [isDailyChallenge, challengeSnapId]); // Removed problematic dependencies

  /**
   * Reload received challenge (for retry/refresh buttons)
   */
  const reloadReceivedChallenge = useCallback(async () => {
    if (!challengeSnapId) return;
    
    setIsLoadingReceived(true);
    setReceivedError(null);
    
    try {
      const result = await mathChallengesHook.viewChallenge(challengeSnapId);
      if (result) {
        setReceivedChallenge(result);
      } else {
        setReceivedError('Challenge not found');
      }
    } catch (error) {
      setReceivedError(error instanceof Error ? error.message : 'Failed to load challenge');
    } finally {
      setIsLoadingReceived(false);
    }
  }, [challengeSnapId, mathChallengesHook]);

  const handleSubmit = async () => {
    if (!answer.trim()) {
      Alert.alert('Missing Answer', 'Please provide an answer before submitting.');
      return;
    }

    try {
      const result = await submitChallengeAnswer(answer, 'text');
      setAnswer('');
      
      // For received challenges, automatically close after submission
      if (!isDailyChallenge) {
        // Small delay to let the user see the success alert from the hook
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      }
      
      // Note: The result alert is already shown by the math challenges hook
      // so we don't need to show another one here
    } catch (error) {
      Alert.alert('Submission Error', 'Failed to submit your answer. Please try again.');
    }
  };

  const handleImageSubmit = async () => {
    try {
      // For now, show a placeholder alert since expo-image-picker isn't installed
      Alert.alert(
        'Image Submission',
        'Image submission feature coming soon! Please use text input for now.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Image Submission Error', 'Failed to submit your image. Please try again.');
    }
  };

  // Share Results Function (Wordle-style)
  const handleShareResults = async () => {
    if (!lastResult || !stats || !challenge) return;

    const { score, isCorrect } = lastResult;
    const { currentStreak, totalPoints } = stats;

    // Create Wordle-style share message
    const today = new Date().toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });

    const scoreEmoji = isCorrect ? '🎯' : '📚';
    const streakEmoji = currentStreak > 0 ? '🔥' : '💪';

    const shareMessage = `Snap Factor Daily Challenge ${today}

${scoreEmoji} Score: ${score}/${challenge.points || 100} points
${streakEmoji} Streak: ${currentStreak} days
📊 Total: ${totalPoints} points

Challenge yourself at Snap Factor! 🧮✨`;

    try {
      // Use React Native's built-in Share API
      await Share.share({
        message: shareMessage,
        title: 'My Daily Challenge Results',
      });
    } catch (error) {
      // Fallback: copy to clipboard and show alert
      try {
        await Clipboard.setStringAsync(shareMessage);
        Alert.alert(
          'Results Copied!',
          'Your challenge results have been copied to clipboard. You can now paste and share them anywhere!',
          [{ text: 'OK' }]
        );
      } catch (clipboardError) {
        // Final fallback: show the message in an alert
        Alert.alert(
          'Share Your Results',
          shareMessage,
          [
            { text: 'Copy', onPress: async () => {
              try {
                await Clipboard.setStringAsync(shareMessage);
              } catch (e) {
                console.log('Failed to copy to clipboard');
              }
            }},
            { text: 'Close', style: 'cancel' }
          ]
        );
      }
    }
  };

  // Success State - Show results if user has submitted and we have results
  if (hasSubmitted && lastResult) {
    const { score, feedback, explanation, isCorrect } = lastResult;

    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {isDailyChallenge ? 'Daily Challenge Complete!' : 'Challenge Complete!'}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Scrollable Content */}
        <ScrollView 
          style={styles.scrollContent} 
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Success Indicator */}
          <View style={styles.successSection}>
            <View style={[
              styles.scoreCircle,
              { backgroundColor: isCorrect ? '#10B981' : '#F59E0B' }
            ]}>
              <Ionicons
                name={isCorrect ? 'checkmark' : 'close'}
                size={40}
                color="white"
              />
            </View>
            <Text style={[
              styles.scoreText,
              { color: isCorrect ? '#10B981' : '#F59E0B' }
            ]}>
              {isCorrect ? 'Excellent!' : 'Good Try!'}
            </Text>
            <Text style={styles.scoreSubtext}>
              You scored {score} points • {isCorrect ? 'Keep it up!' : 'Practice makes perfect!'}
            </Text>
          </View>

          {/* Feedback */}
          {feedback && (
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackTitle}>Feedback</Text>
              <Text style={styles.feedbackText}>{feedback}</Text>
            </View>
          )}

          {/* Explanation */}
          {explanation && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>Explanation</Text>
              <Text style={styles.explanationText}>{explanation}</Text>
            </View>
          )}

          {/* Progress Stats */}
          {stats && (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {stats.currentStreak}
                </Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {stats.totalPoints}
                </Text>
                <Text style={styles.statLabel}>Total Points</Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={handleShareResults}
              style={styles.primaryButton}
            >
              <Ionicons name="share" size={20} color="white" />
              <Text style={styles.primaryButtonText}>
                Share Results
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>
                Back to Math Hub
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Loading State - check both daily challenge loading and received challenge loading
  if (isLoading || isLoadingReceived) {
    console.log('🔄 Showing loading screen:', { isLoading, isLoadingReceived, isDailyChallenge, challengeSnapId });
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>
            {isDailyChallenge ? "Loading today's challenge..." : "Loading challenge..."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error State - check both error sources
  if (receivedError || error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>
            Oops! Something went wrong
          </Text>
          <Text style={styles.errorText}>
            {receivedError || error}
          </Text>

          <TouchableOpacity
            onPress={() => {
              clearError();
              if (receivedError) {
                setReceivedError(null);
              }
              if (isDailyChallenge) {
                loadChallenge();
              } else {
                reloadReceivedChallenge();
              }
            }}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // No Challenge State - check both challenge sources
  if (!challenge) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="calendar" size={64} color="#6B7280" />
          <Text style={styles.errorTitle}>
            No Challenge Available
          </Text>
          <Text style={styles.errorText}>
            There's no challenge available for today. Check back tomorrow for a new challenge!
          </Text>

          <TouchableOpacity
            onPress={isDailyChallenge ? loadChallenge : reloadReceivedChallenge}
            style={styles.refreshButton}
          >
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Already Submitted State (but no results yet)
  if (hasSubmitted && !lastResult) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="checkmark-circle" size={64} color="#10B981" />
          <Text style={styles.errorTitle}>
            Challenge Completed!
          </Text>
          <Text style={styles.errorText}>
            You've already completed today's challenge. Come back tomorrow for a new one!
          </Text>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.refreshButton}
          >
            <Text style={styles.refreshButtonText}>Back to Math Hub</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Main Challenge View
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.challengeHeader}>
          <View style={styles.challengeHeaderContent}>
            <Text style={styles.challengeTitle}>
              {isDailyChallenge ? 'Daily Challenge' : `Math Challenge from ${senderUsername || 'Friend'}`}
            </Text>
            <Text style={styles.challengeGrade}>
              {challenge.gradeLevel} • {isDailyChallenge && challenge.points ? `${challenge.points} points` : challenge.concept}
            </Text>

            {stats && isDailyChallenge && (
              <View style={styles.streakContainer}>
                <Text style={styles.streakNumber}>
                  {stats.currentStreak}
                </Text>
                <Text style={styles.streakLabel}>day streak</Text>
              </View>
            )}
          </View>
        </View>

        {/* Challenge Content */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.challengeContent}>
            <View style={styles.problemContainer}>
              <Text style={styles.problemTitle}>
                {isDailyChallenge ? "Today's Problem" : "Challenge Problem"}
              </Text>
              <Text style={styles.problemText}>
                {challenge.problem}
              </Text>
            </View>

            {/* Hint Section */}
            {challenge.hint && (
              <View style={styles.hintSection}>
                {!showHint ? (
                  <TouchableOpacity
                    onPress={() => setShowHint(true)}
                    style={styles.hintButton}
                  >
                    <Ionicons name="bulb" size={20} color="#D97706" />
                    <Text style={styles.hintButtonText}>
                      Need a hint?
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.hintContainer}>
                    <View style={styles.hintHeader}>
                      <Ionicons name="bulb" size={20} color="#D97706" />
                      <Text style={styles.hintTitle}>Hint</Text>
                    </View>
                    <Text style={styles.hintText}>
                      {challenge.hint}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Answer Input */}
            <View style={styles.answerSection}>
              <Text style={styles.answerLabel}>Your Answer:</Text>
              <TextInput
                style={styles.answerInput}
                value={answer}
                onChangeText={setAnswer}
                placeholder="Type your answer here..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <View style={styles.submitButtons}>
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isSubmitting || !answer.trim()}
                  style={[
                    styles.submitButton,
                    (!answer.trim() || isSubmitting) && styles.submitButtonDisabled
                  ]}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Ionicons name="send" size={20} color="white" />
                  )}
                  <Text style={styles.submitButtonText}>
                    {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleImageSubmit}
                  disabled={isSubmitting}
                  style={[styles.imageButton, isSubmitting && styles.imageButtonDisabled]}
                >
                  <Ionicons name="camera" size={20} color="#374151" />
                  <Text style={styles.imageButtonText}>Submit Photo</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scoreSubtext: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
  },
  feedbackContainer: {
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  feedbackTitle: {
    color: '#1E40AF',
    fontWeight: '500',
    marginBottom: 8,
  },
  feedbackText: {
    color: '#1E3A8A',
    lineHeight: 24,
  },
  explanationContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  explanationTitle: {
    color: '#111827',
    fontWeight: '500',
    marginBottom: 8,
  },
  explanationText: {
    color: '#374151',
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F3E8FF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  statLabel: {
    color: '#6D28D9',
    fontWeight: '500',
  },
  actionButtons: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 18,
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  secondaryButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 18,
    textAlign: 'center',
  },
  loadingText: {
    color: '#6B7280',
    marginTop: 16,
    fontSize: 18,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  challengeHeader: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  challengeHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  challengeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  challengeGrade: {
    color: '#6B7280',
  },
  streakContainer: {
    alignItems: 'flex-end',
  },
  streakNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  streakLabel: {
    color: '#6D28D9',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  challengeContent: {
    padding: 24,
  },
  problemContainer: {
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  problemTitle: {
    color: '#1E40AF',
    fontWeight: '500',
    marginBottom: 8,
  },
  problemText: {
    color: '#1E3A8A',
    fontSize: 18,
    lineHeight: 28,
  },
  hintSection: {
    marginBottom: 24,
  },
  hintButton: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  hintButtonText: {
    color: '#92400E',
    fontWeight: '500',
    marginLeft: 8,
  },
  hintContainer: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 8,
    padding: 16,
  },
  hintHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  hintTitle: {
    color: '#92400E',
    fontWeight: '500',
    marginLeft: 8,
  },
  hintText: {
    color: '#B45309',
    lineHeight: 24,
  },
  answerSection: {
    marginBottom: 24,
  },
  answerLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  answerInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    marginBottom: 16,
  },
  submitButtons: {
    gap: 12,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  imageButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  imageButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
}); 