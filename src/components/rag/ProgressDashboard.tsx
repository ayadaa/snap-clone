/**
 * @fileoverview Progress Dashboard Component for Snap Factor
 * 
 * This component displays user progress and statistics for daily math challenges:
 * - Shows current streak, total points, and accuracy rate
 * - Displays recent challenge history
 * - Shows achievement badges and milestones
 * - Provides motivational feedback
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDailyChallenge } from '../../hooks/challenges/use-daily-challenge';

interface ProgressDashboardProps {
  onClose?: () => void;
  onViewHistory?: () => void;
  onViewLeaderboard?: () => void;
}

/**
 * Progress Dashboard component for tracking challenge progress
 */
export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  onClose,
  onViewHistory,
  onViewLeaderboard,
}) => {
  const { stats, isLoading, error } = useDailyChallenge();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading your progress...</Text>
        </View>
      </View>
    );
  }

  if (error || !stats) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Unable to load progress</Text>
          <Text style={styles.errorMessage}>
            {error || 'Progress data is not available'}
          </Text>
        </View>
      </View>
    );
  }

  const {
    currentStreak,
    bestStreak,
    totalChallenges,
    correctAnswers,
    totalPoints,
    accuracyRate,
  } = stats;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>Keep up the great work!</Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Main Stats */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.streakCard]}>
          <View style={styles.statIcon}>
            <Ionicons name="flame" size={24} color="#F59E0B" />
          </View>
          <Text style={styles.statNumber}>{currentStreak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>

        <View style={[styles.statCard, styles.pointsCard]}>
          <View style={styles.statIcon}>
            <Ionicons name="trophy" size={24} color="#10B981" />
          </View>
          <Text style={styles.statNumber}>{totalPoints}</Text>
          <Text style={styles.statLabel}>Total Points</Text>
        </View>

        <View style={[styles.statCard, styles.accuracyCard]}>
          <View style={styles.statIcon}>
            <Ionicons name="analytics" size={24} color="#3B82F6" />
          </View>
          <Text style={styles.statNumber}>{accuracyRate}%</Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </View>

        <View style={[styles.statCard, styles.bestStreakCard]}>
          <View style={styles.statIcon}>
            <Ionicons name="star" size={24} color="#8B5CF6" />
          </View>
          <Text style={styles.statNumber}>{bestStreak}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>
      </View>

      {/* Additional Stats */}
      <View style={styles.additionalStats}>
        <View style={styles.additionalStatItem}>
          <Text style={styles.additionalStatNumber}>{totalChallenges}</Text>
          <Text style={styles.additionalStatLabel}>Challenges Completed</Text>
        </View>
        <View style={styles.additionalStatItem}>
          <Text style={styles.additionalStatNumber}>{correctAnswers}</Text>
          <Text style={styles.additionalStatLabel}>Correct Answers</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {onViewHistory && (
          <TouchableOpacity
            onPress={onViewHistory}
            style={styles.actionButton}
          >
            <Ionicons name="time" size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>View History</Text>
          </TouchableOpacity>
        )}

        {onViewLeaderboard && (
          <TouchableOpacity
            onPress={onViewLeaderboard}
            style={styles.actionButton}
          >
            <Ionicons name="trophy" size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Leaderboard</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Motivational Message */}
      <View style={styles.motivationSection}>
        <Text style={styles.motivationTitle}>
          {currentStreak > 0 ? '🎉 You\'re on fire!' : '🚀 Ready to start?'}
        </Text>
        <Text style={styles.motivationText}>
          {currentStreak > 0 
            ? `You've solved ${totalChallenges} challenges and earned ${totalPoints} points. Keep your ${currentStreak}-day streak alive!`
            : 'Start your math journey today! Each challenge helps you learn and grow.'
          }
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    color: '#6B7280',
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  streakCard: {
    backgroundColor: '#FEF3C7',
  },
  pointsCard: {
    backgroundColor: '#D1FAE5',
  },
  accuracyCard: {
    backgroundColor: '#DBEAFE',
  },
  bestStreakCard: {
    backgroundColor: '#E9D5FF',
  },
  statIcon: {
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  additionalStats: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 12,
  },
  additionalStatItem: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  additionalStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  additionalStatLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionButtonText: {
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 6,
  },
  motivationSection: {
    margin: 24,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  motivationText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default ProgressDashboard; 