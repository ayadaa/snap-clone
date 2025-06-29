/**
 * @fileoverview Concept Explorer Screen Component
 * 
 * This component implements User Story #4: "Concept Explorer"
 * Allows students to explore mathematical concepts in depth with:
 * - Comprehensive explanations
 * - Clear examples
 * - Practice problems
 * - Visual aids (text-based for now)
 * - Grade-level appropriate content
 */

import * as React from 'react';
import { useState, useEffect } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
// Removed Picker import - using custom dropdown instead
import { AppDispatch } from '../../store';
import {
  fetchConcept,
  setActiveMode,
  setUserGradeLevel,
  setPreferredDepth,
  selectIsLoading,
  selectError,
  selectCurrentConcept,
  selectUserGradeLevel,
  selectHistory,
} from '../../store/slices/rag.slice';
import { formatConfidence, getConfidenceColor } from '../../services/firebase/rag.service';
import { useMathChallenges, type CreateChallengeData } from '../../hooks/math/use-math-challenges';
import { useFriends } from '../../hooks/friends/use-friends';
import { useVisualGeneration } from '../../hooks/rag/use-visual-generation';
import { VisualViewerModal } from './VisualViewerModal';

const { width } = Dimensions.get('window');

/**
 * Grade level options for concept exploration
 */
const GRADE_LEVELS = [
  { label: 'Elementary (K-5)', value: 'elementary' },
  { label: '6th Grade', value: '6th' },
  { label: '7th Grade', value: '7th' },
  { label: '8th Grade', value: '8th' },
  { label: '9th Grade', value: '9th' },
  { label: '10th Grade', value: '10th' },
  { label: '11th Grade', value: '11th' },
  { label: '12th Grade', value: '12th' },
  { label: 'General', value: 'general' },
];

/**
 * Depth level options for concept exploration
 */
const DEPTH_LEVELS = [
  { label: 'Basic Overview', value: 'basic' },
  { label: 'Detailed Explanation', value: 'intermediate' },
  { label: 'Advanced Analysis', value: 'advanced' },
];

/**
 * Popular math concepts for quick access
 */
const POPULAR_CONCEPTS = [
  'Pythagorean theorem',
  'Quadratic equations',
  'Derivatives',
  'Fractions',
  'Algebra',
  'Geometry',
  'Trigonometry',
  'Statistics',
  'Probability',
  'Calculus',
];

/**
 * Generate practice problems based on concept and grade level
 */
function generatePracticeProblems(concept: string, gradeLevel: string): { problem: string; solution: string } {
  // Enhanced problem generation with randomization to create variety
  const problemGenerators = {
    'pythagorean theorem': (grade: string) => {
      const leg1 = 3 + Math.floor(Math.random() * 15);
      const leg2 = 4 + Math.floor(Math.random() * 12);
      const scenarios = [
        {
          problem: `A right triangle has legs of ${leg1} and ${leg2}. Find the hypotenuse.`,
          solution: `Solution:\n1. Use the Pythagorean theorem: a² + b² = c²\n2. Substitute: ${leg1}² + ${leg2}² = c²\n3. Calculate: ${leg1 * leg1} + ${leg2 * leg2} = c²\n4. Add: ${leg1 * leg1 + leg2 * leg2} = c²\n5. Take square root: c = ${Math.sqrt(leg1 * leg1 + leg2 * leg2).toFixed(2)}`
        },
        {
          problem: `A ladder ${leg1 + leg2} feet long leans against a wall. The base is ${leg1} feet from the wall. How high up the wall does it reach?`,
          solution: `Solution:\n1. This forms a right triangle\n2. Ladder = hypotenuse = ${leg1 + leg2} ft\n3. Base = one leg = ${leg1} ft\n4. Height = other leg = ?\n5. Use: ${leg1}² + h² = ${leg1 + leg2}²\n6. Calculate: ${leg1 * leg1} + h² = ${(leg1 + leg2) * (leg1 + leg2)}\n7. Solve: h² = ${(leg1 + leg2) * (leg1 + leg2) - leg1 * leg1}\n8. Therefore: h = ${Math.sqrt((leg1 + leg2) * (leg1 + leg2) - leg1 * leg1).toFixed(2)} ft`
        }
      ];
      return scenarios[Math.floor(Math.random() * scenarios.length)];
    },
    
    'quadratic equations': (grade: string) => {
      const a = 1 + Math.floor(Math.random() * 3);
      const b = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.floor(Math.random() * 6));
      const c = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 8));
      const problems = [
        {
          problem: `Solve: ${a}x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0`,
          solution: `Solution:\n1. Use the quadratic formula: x = [-b ± √(b² - 4ac)] / 2a\n2. Identify: a = ${a}, b = ${b}, c = ${c}\n3. Substitute: x = [${-b} ± √(${b}² - 4(${a})(${c}))] / 2(${a})\n4. Calculate discriminant: ${b * b - 4 * a * c}\n5. Solve for x using the quadratic formula`
        },
        {
          problem: `Factor: x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0`,
          solution: `Solution:\n1. Look for two numbers that multiply to ${c} and add to ${b}\n2. Factor the expression\n3. Set each factor equal to zero\n4. Solve for x`
        }
      ];
      return problems[Math.floor(Math.random() * problems.length)];
    },
    
    'derivatives': (grade: string) => {
      const coeff = 1 + Math.floor(Math.random() * 5);
      const power = 2 + Math.floor(Math.random() * 3);
      const linear = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 10));
      const problems = [
        {
          problem: `Find the derivative of f(x) = ${coeff}x^${power} ${linear >= 0 ? '+' : ''}${linear}x`,
          solution: `Solution:\n1. Use the power rule: d/dx[x^n] = n·x^(n-1)\n2. For ${coeff}x^${power}: ${coeff} · ${power} · x^${power-1} = ${coeff * power}x^${power-1}\n3. For ${linear}x: ${linear} · 1 · x^0 = ${linear}\n4. Combine: f'(x) = ${coeff * power}x^${power-1} ${linear >= 0 ? '+' : ''}${linear}`
        },
        {
          problem: `What is the slope of y = ${coeff}x^${power} at x = 2?`,
          solution: `Solution:\n1. Find the derivative: y' = ${coeff * power}x^${power-1}\n2. Substitute x = 2: y'(2) = ${coeff * power}(2)^${power-1}\n3. Calculate: y'(2) = ${coeff * power * Math.pow(2, power-1)}\n4. The slope at x = 2 is ${coeff * power * Math.pow(2, power-1)}`
        }
      ];
      return problems[Math.floor(Math.random() * problems.length)];
    }
  };

  const conceptKey = concept.toLowerCase();
  if (problemGenerators[conceptKey as keyof typeof problemGenerators]) {
    return problemGenerators[conceptKey as keyof typeof problemGenerators](gradeLevel);
  }

  // Enhanced fallback for other concepts
  const enhancedFallbacks = {
    'fractions': {
      problem: `Sarah ate ${1 + Math.floor(Math.random() * 3)}/${2 + Math.floor(Math.random() * 6)} of a pizza and Tom ate ${1 + Math.floor(Math.random() * 2)}/${3 + Math.floor(Math.random() * 5)} of the same pizza. How much pizza did they eat together?`,
      solution: 'Solution:\n1. Find a common denominator\n2. Convert both fractions\n3. Add the numerators\n4. Simplify if possible'
    },
    'algebra': {
      problem: `Solve for x: ${2 + Math.floor(Math.random() * 5)}x + ${1 + Math.floor(Math.random() * 8)} = ${10 + Math.floor(Math.random() * 15)}`,
      solution: 'Solution:\n1. Subtract the constant from both sides\n2. Divide both sides by the coefficient of x\n3. Simplify to find x'
    }
  };

  if (enhancedFallbacks[conceptKey as keyof typeof enhancedFallbacks]) {
    return enhancedFallbacks[conceptKey as keyof typeof enhancedFallbacks];
  }

  return {
    problem: `Create a ${concept} problem using the concepts you've learned. Apply the principles at a ${gradeLevel} level with specific numbers and clear objectives.`,
    solution: `Break down the problem step by step:\n1. Identify what's given\n2. Determine what to find\n3. Choose the right formula/method\n4. Substitute and calculate\n5. Check your answer`
  };
}

/**
 * Show detailed solution for a specific problem
 */
function showSolution(problem: string, solution: string, concept?: string, gradeLevel?: string): void {
  Alert.alert(
    'Step-by-Step Solution',
    `Problem: ${problem}\n\nSolution:\n${solution}`,
    [
      { 
        text: 'Generate New Problem', 
        onPress: () => {
          if (concept && gradeLevel) {
            generateNewProblem(concept, gradeLevel);
          }
        }
      },
      { text: 'Close', style: 'cancel' }
    ]
  );
}

/**
 * Generate a new practice problem
 */
function generateNewProblem(concept: string, gradeLevel: string): void {
  const problemData = generatePracticeProblems(concept, gradeLevel);
  Alert.alert(
    'New Practice Problem',
    problemData.problem,
    [
      { text: 'Show Solution', onPress: () => showSolution(problemData.problem, problemData.solution, concept, gradeLevel) },
      { text: 'Another Problem', onPress: () => generateNewProblem(concept, gradeLevel) },
      { text: 'Close', style: 'cancel' }
    ]
  );
}

/**
 * Explore related concepts
 */
function exploreRelatedConcepts(concept: string): void {
  const relatedConcepts: Record<string, string[]> = {
    'pythagorean theorem': ['Right triangles', 'Distance formula', 'Trigonometry', 'Special right triangles'],
    'quadratic equations': ['Factoring', 'Completing the square', 'Parabolas', 'Vertex form'],
    'derivatives': ['Limits', 'Chain rule', 'Product rule', 'Applications of derivatives'],
    'fractions': ['Decimals', 'Percentages', 'Ratios', 'Proportions'],
    'geometry': ['Area and perimeter', 'Volume', 'Similar triangles', 'Coordinate geometry']
  };

  const related = relatedConcepts[concept.toLowerCase()] || ['Basic algebra', 'Number theory', 'Mathematical reasoning'];
  const conceptList = related.map((c, i) => `${i + 1}. ${c}`).join('\n');
  
  Alert.alert(
    'Related Concepts',
    `Concepts related to ${concept}:\n\n${conceptList}\n\nExploring these will deepen your understanding!`,
    [
      { text: 'Close', style: 'cancel' }
    ]
  );
}

// Note: exploreVisualConcept function is now handled by the component's visual generation functionality

/**
 * Concept Explorer Screen Component
 */
export const ConceptExplorerScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const currentConcept = useSelector(selectCurrentConcept);
  const userGradeLevel = useSelector(selectUserGradeLevel);
  const history = useSelector(selectHistory);
  const insets = useSafeAreaInsets();

  const [concept, setConcept] = useState('');
  const [gradeLevel, setGradeLevel] = useState(userGradeLevel);
  const [depth, setDepth] = useState<'basic' | 'intermediate' | 'advanced'>('intermediate');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Challenge functionality
  const { createAndSendChallenge, isLoading: challengeLoading } = useMathChallenges();
  const { friends } = useFriends();

  // Visual generation functionality
  const { generateVisual, isLoading: visualLoading, currentVisual, clearVisual } = useVisualGeneration();
  const [showVisualModal, setShowVisualModal] = useState(false);

  /**
   * Handle visual representation generation
   */
  const handleGenerateVisual = async (conceptName: string) => {
    try {
      console.log('🎯 handleGenerateVisual called with:', conceptName);
      setShowVisualModal(true);
      
      const request = {
        concept: conceptName,
        gradeLevel: gradeLevel,
        visualType: 'auto' as const,
        style: 'detailed' as const
      };
      
      console.log('📝 Visual request:', request);
      
      await generateVisual(request);
      console.log('🎉 Visual generation completed successfully');
    } catch (error) {
      console.error('💥 Error in handleGenerateVisual:', error);
      Alert.alert(
        'Visual Generation Failed',
        `Unable to generate visual representation. Please try again.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [{ text: 'OK', onPress: () => setShowVisualModal(false) }]
      );
    }
  };

  /**
   * Set active mode when component mounts
   */
  useEffect(() => {
    dispatch(setActiveMode('concept'));
    return () => {
      dispatch(setActiveMode(null));
    };
  }, [dispatch]);

  /**
   * Handle concept exploration
   */
  const handleExploreConcept = async () => {
    if (!concept.trim()) {
      Alert.alert('Input Required', 'Please enter a mathematical concept to explore.');
      return;
    }

    try {
      // Update user preferences
      dispatch(setUserGradeLevel(gradeLevel));
      dispatch(setPreferredDepth(depth));

      // Fetch concept explanation
      await dispatch(fetchConcept({
        concept: concept.trim(),
        gradeLevel,
        depth,
      })).unwrap();

    } catch (error) {
      Alert.alert(
        'Exploration Failed',
        'Unable to explore the concept. Please check your connection and try again.'
      );
    }
  };

  /**
   * Handle creating a challenge from a practice problem
   */
  const handleChallengeFromProblem = (problem: string, conceptName: string, gradeLevel: string) => {
    if (friends.length === 0) {
      Alert.alert(
        'No Friends',
        'You need to add friends before you can send challenges. Add some friends first!',
        [{ text: 'OK' }]
      );
      return;
    }

    // Show friend selection dialog
    const friendOptions = friends.map(friend => ({
      text: friend.username,
      onPress: () => createChallengeForFriend(problem, conceptName, gradeLevel, friend.uid)
    }));

    Alert.alert(
      'Challenge a Friend 🎯',
      'Who would you like to challenge with this problem?',
      [
        ...friendOptions,
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  /**
   * Create and send challenge to selected friend
   */
  const createChallengeForFriend = async (
    problem: string,
    conceptName: string,
    gradeLevelValue: string,
    friendId: string
  ) => {
    try {
      // Extract answer from problem or ask user to provide it
      Alert.prompt(
        'Set Challenge Answer',
        `What's the correct answer to this problem?\n\n"${problem}"`,
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Create Challenge',
            onPress: async (answer) => {
              if (!answer?.trim()) {
                Alert.alert('Answer Required', 'Please provide the correct answer for this challenge.');
                return;
              }

              const challengeData: CreateChallengeData = {
                problem,
                concept: conceptName,
                gradeLevel: gradeLevelValue,
                correctAnswer: answer.trim(),
                explanation: `This problem involves ${conceptName}. Think step by step!`,
                difficulty: depth,
                timeLimit: 300, // 5 minutes
              };

              await createAndSendChallenge(challengeData, friendId);
            }
          }
        ],
        'plain-text'
      );
    } catch (error) {
      Alert.alert(
        'Challenge Failed',
        'Failed to create challenge. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  /**
   * Handle quick concept selection
   */
  const handleQuickConcept = async (selectedConcept: string) => {
    setConcept(selectedConcept);
    
    try {
      // Update user preferences
      dispatch(setUserGradeLevel(gradeLevel));
      dispatch(setPreferredDepth(depth));

      // Fetch concept explanation
      await dispatch(fetchConcept({
        concept: selectedConcept.trim(),
        gradeLevel,
        depth,
      })).unwrap();

    } catch (error) {
      Alert.alert(
        'Exploration Failed',
        'Unable to explore the concept. Please check your connection and try again.'
      );
    }
  };

  /**
   * Render concept response
   */
  const renderConceptResponse = () => {
    if (!currentConcept) return null;

    return (
      <View style={styles.responseContainer}>
        <View style={styles.responseHeader}>
          <Text style={styles.responseTitle}>Concept Exploration</Text>
          <View style={[
            styles.confidenceBadge,
            { backgroundColor: getConfidenceColor(currentConcept.confidence) }
          ]}>
            <Text style={styles.confidenceText}>
              {formatConfidence(currentConcept.confidence)}
            </Text>
          </View>
        </View>

        <ScrollView style={styles.explanationContainer}>
          <Text style={styles.explanationText}>
            {currentConcept.explanation}
          </Text>

          {/* Suggested Actions */}
          {currentConcept.suggestedActions && currentConcept.suggestedActions.length > 0 && (
            <View style={styles.actionsContainer}>
              <Text style={styles.actionsTitle}>Try These Next:</Text>
              {currentConcept.suggestedActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.actionButton}
                  onPress={() => {
                    if (action.type === 'practice_problem') {
                      // Generate a practice problem based on the concept
                      const problemData = generatePracticeProblems(concept, gradeLevel);
                      Alert.alert(
                        'Practice Problem',
                        problemData.problem,
                                                  [
                          { text: 'Show Solution', onPress: () => showSolution(problemData.problem, problemData.solution, concept, gradeLevel) },
                          { text: 'Challenge Friend', onPress: () => handleChallengeFromProblem(problemData.problem, concept, gradeLevel) },
                          { text: 'New Problem', onPress: () => generateNewProblem(concept, gradeLevel) },
                          { text: 'Close', style: 'cancel' }
                        ]
                      );
                    } else if (action.type === 'visual_aid') {
                      // Directly generate visual representation
                      handleGenerateVisual(concept);
                    } else if (action.type === 'related_concept') {
                      setConcept(action.description);
                      handleExploreConcept();
                    }
                  }}
                >
                  <Text style={styles.actionButtonText}>
                    {action.type === 'practice_problem' ? '📝' : 
                     action.type === 'visual_aid' ? '📊' :
                     action.type === 'related_concept' ? '🔗' : '💡'} {action.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Sources */}
          <View style={styles.sourcesContainer}>
            <Text style={styles.sourcesTitle}>Sources:</Text>
            {currentConcept.sources.map((source, index) => (
              <View key={index} style={styles.sourceItem}>
                <Text style={styles.sourceText}>
                  • {source.book}
                  {source.chapter && ` - Chapter ${source.chapter}`}
                  {source.section && ` - ${source.section}`}
                </Text>
                <Text style={styles.relevanceText}>
                  Relevance: {Math.round(source.relevanceScore * 100)}%
                </Text>
              </View>
            ))}
          </View>

          {/* Processing Time */}
          {currentConcept.processingTime && (
            <Text style={styles.processingTime}>
              Processed in {(currentConcept.processingTime / 1000).toFixed(1)}s
            </Text>
          )}
        </ScrollView>
      </View>
    );
  };

  /**
   * Render recent concepts from history
   */
  const renderRecentConcepts = () => {
    const recentConcepts = history
      .filter(item => item.type === 'concept')
      .slice(0, 5);

    if (recentConcepts.length === 0) return null;

    return (
      <View style={styles.recentContainer}>
        <Text style={styles.recentTitle}>Recent Explorations:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {recentConcepts.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.recentItem}
              onPress={() => {
                setConcept(item.query);
                handleExploreConcept();
              }}
            >
              <Text style={styles.recentItemText}>{item.query}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.title}>🔍 Concept Explorer</Text>
          <Text style={styles.subtitle}>
            Explore mathematical concepts in depth with examples and practice problems
          </Text>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Mathematical Concept:</Text>
          <TextInput
            style={styles.conceptInput}
            value={concept}
            onChangeText={setConcept}
            placeholder="e.g., Pythagorean theorem, derivatives, fractions..."
            placeholderTextColor="#999"
            multiline={false}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Grade Level Selection */}
          <Text style={styles.inputLabel}>Grade Level:</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => {
              Alert.alert(
                'Select Grade Level',
                'Choose your grade level',
                GRADE_LEVELS.map(level => ({
                  text: level.label,
                  onPress: () => setGradeLevel(level.value)
                }))
              );
            }}
          >
            <Text style={styles.dropdownText}>
              {GRADE_LEVELS.find(level => level.value === gradeLevel)?.label || 'Select Grade'}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>

          {/* Advanced Options Toggle */}
          <TouchableOpacity
            style={styles.advancedToggle}
            onPress={() => setShowAdvancedOptions(!showAdvancedOptions)}
          >
            <Text style={styles.advancedToggleText}>
              {showAdvancedOptions ? '▼' : '▶'} Advanced Options
            </Text>
          </TouchableOpacity>

          {/* Advanced Options */}
          {showAdvancedOptions && (
            <View style={styles.advancedOptions}>
              <Text style={styles.inputLabel}>Explanation Depth:</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => {
                  Alert.alert(
                    'Select Explanation Depth',
                    'Choose how detailed you want the explanation',
                    DEPTH_LEVELS.map(level => ({
                      text: level.label,
                      onPress: () => setDepth(level.value as 'basic' | 'intermediate' | 'advanced')
                    }))
                  );
                }}
              >
                <Text style={styles.dropdownText}>
                  {DEPTH_LEVELS.find(level => level.value === depth)?.label || 'Select Depth'}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Explore Button */}
          <TouchableOpacity
            style={[styles.exploreButton, isLoading && styles.exploreButtonDisabled]}
            onPress={handleExploreConcept}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.exploreButtonText}>🔍 Explore Concept</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Access to Popular Concepts */}
        <View style={styles.quickAccessContainer}>
          <Text style={styles.quickAccessTitle}>Popular Concepts:</Text>
          <View style={styles.quickAccessGrid}>
            {POPULAR_CONCEPTS.map((popularConcept) => (
              <TouchableOpacity
                key={popularConcept}
                style={styles.quickAccessButton}
                onPress={() => handleQuickConcept(popularConcept)}
                disabled={isLoading}
              >
                <Text style={styles.quickAccessButtonText}>{popularConcept}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Concepts */}
        {renderRecentConcepts()}

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* Concept Response */}
        {renderConceptResponse()}
      </ScrollView>

      {/* Visual Viewer Modal */}
      <VisualViewerModal
        visible={showVisualModal}
        onClose={() => {
          setShowVisualModal(false);
          clearVisual();
        }}
        visual={currentVisual}
        concept={concept}
        isLoading={visualLoading}
      />
    </View>
  );
};

/**
 * Styles for the Concept Explorer Screen
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  inputSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  conceptInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    minHeight: 50,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 50,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  advancedToggle: {
    paddingVertical: 12,
    marginTop: 8,
  },
  advancedToggleText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  advancedOptions: {
    marginTop: 8,
  },
  exploreButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  exploreButtonDisabled: {
    backgroundColor: '#ccc',
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  quickAccessContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  quickAccessTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAccessButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    minWidth: (width - 60) / 2,
    alignItems: 'center',
  },
  quickAccessButtonText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  recentContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  recentItem: {
    backgroundColor: '#e3f2fd',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
  },
  recentItemText: {
    fontSize: 14,
    color: '#1976d2',
  },
  errorContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    fontSize: 16,
    color: '#c62828',
  },
  responseContainer: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  responseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  explanationContainer: {
    maxHeight: 400,
  },
  explanationText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    padding: 16,
  },
  actionsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: '#e8f4fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#1976d2',
  },
  sourcesContainer: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  sourcesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  sourceItem: {
    marginBottom: 8,
  },
  sourceText: {
    fontSize: 14,
    color: '#555',
  },
  relevanceText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  processingTime: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    padding: 8,
    fontStyle: 'italic',
  },
  actionButtonsContainer: {
    padding: 16,
    gap: 12,
  },
  primaryActionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  primaryActionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryActionButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  secondaryActionButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ConceptExplorerScreen; 