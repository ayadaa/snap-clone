/**
 * @fileoverview Math Hub Screen for Snap Factor
 * 
 * This component serves as the main entry point for all Snap Factor features.
 * Provides navigation to Define Mode, Concept Explorer, Homework Helper, and Math Challenge.
 */

import * as React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MathStackParamList } from '../../navigation/MathStackNavigator';
import { DailyChallengeCard } from './DailyChallengeCard';

const { width } = Dimensions.get('window');

type MathHubNavigationProp = NativeStackNavigationProp<MathStackParamList, 'MathHub'>;

/**
 * Available math features
 */
const MATH_FEATURES = [
  {
    id: 'define-mode',
    title: '📖 Define Mode',
    description: 'Get instant definitions for math terms',
    subtitle: 'Perfect for understanding new vocabulary',
    route: 'DefineMode' as keyof MathStackParamList,
    color: '#4CAF50',
    available: true,
  },
  {
    id: 'concept-explorer',
    title: '🔍 Concept Explorer',
    description: 'Explore math concepts in depth with examples',
    subtitle: 'Deep dive into mathematical concepts',
    route: 'ConceptExplorer' as keyof MathStackParamList,
    color: '#2196F3',
    available: true,
  },
];

/**
 * Math Hub Screen Component
 */
export const MathHubScreen: React.FC = () => {
  const navigation = useNavigation<MathHubNavigationProp>();
  const insets = useSafeAreaInsets();

  /**
   * Handle feature selection
   */
  const handleFeaturePress = (feature: typeof MATH_FEATURES[0]) => {
    if (feature.available) {
      navigation.navigate(feature.route as any);
    }
  };

  /**
   * Render feature card
   */
  const renderFeatureCard = (feature: typeof MATH_FEATURES[0]) => (
    <TouchableOpacity
      key={feature.id}
      style={[
        styles.featureCard,
        { borderLeftColor: feature.color },
        !feature.available && styles.featureCardDisabled
      ]}
      onPress={() => handleFeaturePress(feature)}
      disabled={!feature.available}
    >
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDescription}>{feature.description}</Text>
        <Text style={[
          styles.featureSubtitle,
          !feature.available && styles.comingSoonText
        ]}>
          {feature.subtitle}
        </Text>
      </View>
      <View style={[styles.featureIndicator, { backgroundColor: feature.color }]}>
        <Text style={styles.featureArrow}>
          {feature.available ? '→' : '⏳'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.title}>🧮 Snap Factor Hub</Text>
          <Text style={styles.subtitle}>
            Your AI-powered math learning companion
          </Text>
          <Text style={styles.description}>
            Choose a feature below to start exploring math concepts, 
            get definitions, or solve problems with AI assistance.
          </Text>
        </View>

        {/* Daily Challenge */}
        <DailyChallengeCard />

        {/* Features Grid */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Available Features</Text>
          {MATH_FEATURES.map(renderFeatureCard)}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>7,249</Text>
              <Text style={styles.statLabel}>Textbook Concepts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Math Textbooks</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>K-12</Text>
              <Text style={styles.statLabel}>Grade Levels</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>AI</Text>
              <Text style={styles.statLabel}>Powered</Text>
            </View>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.sectionTitle}>💡 Tips for Success</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>
              • Use Define Mode when you encounter unfamiliar math terms
            </Text>
            <Text style={styles.tipItem}>
              • Try Concept Explorer for deeper understanding of topics
            </Text>
            <Text style={styles.tipItem}>
              • Select your grade level for age-appropriate explanations
            </Text>
            <Text style={styles.tipItem}>
              • Check the sources to learn more from your textbooks
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

/**
 * Styles for the Math Hub Screen
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    lineHeight: 20,
  },
  featuresContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    minHeight: 80,
    maxHeight: 100,
  },
  featureCardDisabled: {
    opacity: 0.6,
  },
  featureContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
    lineHeight: 16,
  },
  featureSubtitle: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    lineHeight: 14,
  },
  comingSoonText: {
    color: '#FF9800',
    fontWeight: '500',
  },
  featureIndicator: {
    width: 40,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureArrow: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  statsContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
    minWidth: (width - 80) / 4,
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  tipsContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
    marginBottom: 20,
  },
  tipsList: {
    marginTop: 8,
  },
  tipItem: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default MathHubScreen; 