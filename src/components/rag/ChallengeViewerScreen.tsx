/**
 * @fileoverview Challenge Viewer Screen Component
 * 
 * This component handles the viewing and response interface for math challenges.
 * It provides:
 * - Challenge problem display
 * - Answer input interface
 * - Solution checking
 * - Result feedback
 * - Score tracking
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useMathChallenges } from '../../hooks/math/use-math-challenges';
import { type MathChallenge, type ChallengeSnap } from '../../services/firebase/firestore.service';

const { width, height } = Dimensions.get('window');

/**
 * Navigation types for challenge viewer
 */
type ChallengeViewerRouteProp = RouteProp<{
  ChallengeViewer: {
    challengeSnapId: string;
    senderId: string;
  };
}, 'ChallengeViewer'>;

type ChallengeViewerNavigationProp = StackNavigationProp<any>;

/**
 * Challenge Viewer Screen Component
 */
export const ChallengeViewerScreen: React.FC = () => {
  const route = useRoute<ChallengeViewerRouteProp>();
  const navigation = useNavigation<ChallengeViewerNavigationProp>();
  const { challengeSnapId, senderId } = route.params;

  const [challenge, setChallenge] = useState<MathChallenge | null>(null);
  const [challengeSnap, setChallengeSnap] = useState<ChallengeSnap | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [result, setResult] = useState<{ isCorrect: boolean; explanation?: string } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const { viewChallenge, submitAnswer, isLoading } = useMathChallenges();

  /**
   * Load challenge data on mount
   */
  useEffect(() => {
    const loadChallengeData = async () => {
      try {
        const data = await viewChallenge(challengeSnapId);
        if (data) {
          setChallenge(data.challenge);
          setChallengeSnap(data.challengeSnap);
          setHasAnswered(data.challengeSnap.status === 'answered');
          
          // Set up timer if challenge has time limit
          if (data.challenge.timeLimit && data.challengeSnap.status === 'viewed') {
            const elapsed = Math.floor((Date.now() - data.challengeSnap.viewedAt!.toMillis()) / 1000);
            const remaining = Math.max(0, data.challenge.timeLimit - elapsed);
            setTimeRemaining(remaining);
          }
        }
      } catch (error) {
        Alert.alert(
          'Error',
          'Failed to load challenge. Please try again.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    };

    loadChallengeData();
  }, [challengeSnapId, viewChallenge, navigation]);

  /**
   * Timer countdown effect
   */
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || hasAnswered) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          Alert.alert(
            'Time\'s Up! ⏰',
            'The challenge has expired. You can still view the problem but cannot submit an answer.',
            [{ text: 'OK' }]
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, hasAnswered]);

  /**
   * Handle answer submission
   */
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      Alert.alert('Answer Required', 'Please enter your answer before submitting.');
      return;
    }

    if (timeRemaining === 0) {
      Alert.alert('Time Expired', 'Sorry, the time limit for this challenge has expired.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitAnswer(challengeSnapId, userAnswer.trim());
      setResult(result);
      setHasAnswered(true);
    } catch (error) {
      Alert.alert(
        'Submission Failed',
        'Failed to submit your answer. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Format time remaining display
   */
  const formatTimeRemaining = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  /**
   * Get difficulty color
   */
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'basic': return '#10B981';
      case 'intermediate': return '#F59E0B';
      case 'advanced': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (isLoading || !challenge || !challengeSnap) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading challenge...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Math Challenge 🎯</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Challenge Info */}
        <View style={styles.challengeInfo}>
          <View style={styles.challengeHeader}>
            <Text style={styles.conceptText}>{challenge.concept}</Text>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(challenge.difficulty) }]}>
              <Text style={styles.difficultyText}>
                {challenge.difficulty.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.gradeLevelText}>Grade Level: {challenge.gradeLevel}</Text>
        </View>

        {/* Timer */}
        {timeRemaining !== null && timeRemaining > 0 && !hasAnswered && (
          <View style={styles.timerContainer}>
            <Ionicons name="time-outline" size={20} color="#F59E0B" />
            <Text style={styles.timerText}>
              Time Remaining: {formatTimeRemaining(timeRemaining)}
            </Text>
          </View>
        )}

        {/* Problem */}
        <View style={styles.problemContainer}>
          <Text style={styles.problemLabel}>Problem:</Text>
          <Text style={styles.problemText}>{challenge.problem}</Text>
        </View>

        {/* Answer Input or Result */}
        {!hasAnswered ? (
          <View style={styles.answerContainer}>
            <Text style={styles.answerLabel}>Your Answer:</Text>
            <TextInput
              style={styles.answerInput}
              value={userAnswer}
              onChangeText={setUserAnswer}
              placeholder="Enter your answer here..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              multiline={true}
              numberOfLines={3}
              editable={timeRemaining !== 0}
            />
            
            <TouchableOpacity
              style={[
                styles.submitButton,
                (isSubmitting || !userAnswer.trim() || timeRemaining === 0) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmitAnswer}
              disabled={isSubmitting || !userAnswer.trim() || timeRemaining === 0}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Answer</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.resultContainer}>
            <View style={[styles.resultHeader, result?.isCorrect ? styles.correctHeader : styles.incorrectHeader]}>
              <Ionicons
                name={result?.isCorrect ? "checkmark-circle" : "close-circle"}
                size={32}
                color="#FFFFFF"
              />
              <Text style={styles.resultTitle}>
                {result?.isCorrect ? 'Correct! 🎉' : 'Not Quite Right 🤔'}
              </Text>
            </View>
            
            <Text style={styles.yourAnswerText}>
              Your Answer: {challengeSnap.recipientAnswer}
            </Text>
            
            {result?.explanation && (
              <View style={styles.explanationContainer}>
                <Text style={styles.explanationLabel}>Explanation:</Text>
                <Text style={styles.explanationText}>{result.explanation}</Text>
              </View>
            )}
          </View>
        )}

        {/* Challenge Info Footer */}
        <View style={styles.challengeFooter}>
          <Text style={styles.footerText}>
            Challenge from a friend • {new Date(challengeSnap.sentAt.toMillis()).toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#2a2a2a',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  challengeInfo: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  conceptText: {
    color: '#3B82F6',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  gradeLevelText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  timerText: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  problemContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  problemLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  problemText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 26,
  },
  answerContainer: {
    marginBottom: 20,
  },
  answerLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  answerInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    marginBottom: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  correctHeader: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  incorrectHeader: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  resultTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  yourAnswerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  explanationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  explanationLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  explanationText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    lineHeight: 22,
  },
  challengeFooter: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
}); 