/**
 * @fileoverview Daily Challenge Card Component for Snap Factor
 * 
 * This component provides a preview card for the daily math challenge:
 * - Shows challenge status (available, completed, loading)
 * - Displays streak and points information
 * - Provides quick access to the full challenge screen
 * - Shows completion status and results
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDailyChallenge } from '../../hooks/challenges/use-daily-challenge';
import { useNavigation } from '@react-navigation/native';
import { MathStackNavigationProp } from '../../types/navigation';

interface DailyChallengeCardProps {
  onPress?: () => void;
}

/**
 * Daily Challenge Card component for Math Hub integration
 */
export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  onPress,
}) => {
  const navigation = useNavigation<MathStackNavigationProp>();
  const {
    challenge,
    stats,
    isLoading,
    hasSubmitted,
    lastResult,
    error,
    loadChallenge,
  } = useDailyChallenge();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('ChallengeViewer');
    }
  };

  const handleRetry = () => {
    loadChallenge();
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconContainer, styles.blueBackground]}>
              <Ionicons name="trophy" size={24} color="#3B82F6" />
            </View>
            <View>
              <Text style={styles.title}>Daily Challenge</Text>
              <Text style={styles.subtitle}>Loading...</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading today's challenge</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconContainer, styles.redBackground]}>
              <Ionicons name="alert-circle" size={24} color="#EF4444" />
            </View>
            <View>
              <Text style={styles.title}>Daily Challenge</Text>
              <Text style={styles.errorText}>Error loading</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.errorContainer}>
          <Text style={styles.errorMessage}>Unable to load today's challenge</Text>
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // No challenge available
  if (!challenge) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconContainer, styles.grayBackground]}>
              <Ionicons name="calendar" size={24} color="#6B7280" />
            </View>
            <View>
              <Text style={styles.title}>Daily Challenge</Text>
              <Text style={styles.subtitle}>Not available</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.unavailableContainer}>
          <Text style={styles.unavailableText}>
            No challenge available today. Check back soon!
          </Text>
          <TouchableOpacity onPress={handleRetry} style={styles.refreshButton}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Challenge completed
  if (hasSubmitted && lastResult) {
    const { isCorrect, score } = lastResult;
    
    return (
      <TouchableOpacity onPress={handlePress} style={styles.card} activeOpacity={0.7}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[
              styles.iconContainer, 
              isCorrect ? styles.greenBackground : styles.orangeBackground
            ]}>
              <Ionicons 
                name={isCorrect ? 'checkmark-circle' : 'help-circle'} 
                size={24} 
                color={isCorrect ? '#10B981' : '#F59E0B'} 
              />
            </View>
            <View>
              <Text style={styles.title}>Daily Challenge</Text>
              <Text style={[
                styles.statusText,
                isCorrect ? styles.successText : styles.warningText
              ]}>
                {isCorrect ? 'Completed!' : 'Attempted'}
              </Text>
            </View>
          </View>
          
          {stats && (
            <View style={styles.streakContainer}>
              <Text style={styles.streakNumber}>{stats.currentStreak}</Text>
              <Text style={styles.streakLabel}>streak</Text>
            </View>
          )}
        </View>

        {/* Challenge Preview */}
        <View style={styles.challengePreview}>
          <Text style={styles.challengeInfo}>
            {challenge.gradeLevel} • {challenge.difficulty}
          </Text>
          <Text style={styles.challengeProblem} numberOfLines={2}>
            {challenge.problem}
          </Text>
        </View>

        {/* Results Summary */}
        <View style={styles.resultsSummary}>
          <View style={styles.pointsContainer}>
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text style={styles.pointsText}>{score} points earned</Text>
          </View>
          <View style={styles.viewResultsContainer}>
            <Text style={styles.viewResultsText}>View Results</Text>
            <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Challenge available but not completed
  return (
    <TouchableOpacity onPress={handlePress} style={styles.card} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, styles.blueBackground]}>
            <Ionicons name="trophy" size={24} color="#3B82F6" />
          </View>
          <View>
            <Text style={styles.title}>Daily Challenge</Text>
            <Text style={styles.readyText}>Ready to solve!</Text>
          </View>
        </View>
        
        {stats && (
          <View style={styles.streakContainer}>
            <Text style={styles.streakNumber}>{stats.currentStreak}</Text>
            <Text style={styles.streakLabel}>streak</Text>
          </View>
        )}
      </View>

      {/* Challenge Preview */}
      <View style={styles.availablePreview}>
        <View style={styles.challengeHeader}>
          <Text style={styles.availableChallengeInfo}>
            {challenge.gradeLevel} • {challenge.difficulty}
          </Text>
          <View style={styles.pointsHeaderContainer}>
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text style={styles.pointsHeaderText}>{challenge.points} pts</Text>
          </View>
        </View>
        <Text style={styles.availableChallengeProblem} numberOfLines={2}>
          {challenge.problem}
        </Text>
      </View>

      {/* Call to Action */}
      <View style={styles.callToAction}>
        <Text style={styles.tapText}>Tap to start solving</Text>
        <View style={styles.startContainer}>
          <Text style={styles.startText}>Start Challenge</Text>
          <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  blueBackground: {
    backgroundColor: '#DBEAFE',
  },
  redBackground: {
    backgroundColor: '#FEE2E2',
  },
  grayBackground: {
    backgroundColor: '#F3F4F6',
  },
  greenBackground: {
    backgroundColor: '#DCFCE7',
  },
  orangeBackground: {
    backgroundColor: '#FEF3C7',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  successText: {
    color: '#059669',
  },
  warningText: {
    color: '#D97706',
  },
  readyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
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
    fontSize: 12,
    color: '#8B5CF6',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    color: '#6B7280',
    marginTop: 8,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  errorMessage: {
    color: '#991B1B',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  unavailableContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  unavailableText: {
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
  },
  refreshButton: {
    backgroundColor: '#4B5563',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  challengePreview: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  challengeInfo: {
    color: '#374151',
    fontWeight: '600',
    marginBottom: 4,
  },
  challengeProblem: {
    color: '#6B7280',
    lineHeight: 20,
  },
  resultsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    color: '#374151',
    marginLeft: 4,
  },
  viewResultsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewResultsText: {
    color: '#2563EB',
    fontWeight: '600',
    marginRight: 4,
  },
  availablePreview: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  availableChallengeInfo: {
    color: '#1E3A8A',
    fontWeight: '600',
  },
  pointsHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsHeaderText: {
    color: '#1E3A8A',
    marginLeft: 4,
    fontWeight: '600',
  },
  availableChallengeProblem: {
    color: '#1E40AF',
    lineHeight: 20,
  },
  callToAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tapText: {
    color: '#6B7280',
  },
  startContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startText: {
    color: '#2563EB',
    fontWeight: '600',
    marginRight: 4,
  },
});

export default DailyChallengeCard; 