/**
 * @fileoverview Define Mode Screen for Snap Factor
 * 
 * This screen allows users to get instant definitions of math terms
 * using the RAG system powered by OpenAI and math textbook data.
 * 
 * Features:
 * - Text input for math terms
 * - Grade level selection
 * - Real-time definition lookup
 * - Source citations display
 * - History of previous definitions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch } from '../../store';
import {
  fetchDefinition,
  selectIsLoading,
  selectError,
  selectCurrentDefinition,
  selectUserGradeLevel,
  selectHistory,
  setUserGradeLevel,
  clearError,
  clearCurrentResponses,
} from '../../store/slices/rag.slice';
import { formatConfidence, getConfidenceColor } from '../../services/firebase/rag.service';

/**
 * Grade level options for the picker
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
 * Define Mode Screen Component
 */
export function DefineModeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const currentDefinition = useSelector(selectCurrentDefinition);
  const userGradeLevel = useSelector(selectUserGradeLevel);
  const history = useSelector(selectHistory);
  
  // Local state
  const [term, setTerm] = useState('');
  const [context, setContext] = useState('');
  const [showGradePicker, setShowGradePicker] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  /**
   * Handle definition lookup
   */
  const handleLookupDefinition = async () => {
    if (!term.trim()) {
      Alert.alert('Missing Term', 'Please enter a math term to define.');
      return;
    }

    Keyboard.dismiss();
    
    try {
      await dispatch(fetchDefinition({
        term: term.trim(),
        gradeLevel: userGradeLevel,
        context: context.trim() || undefined,
      })).unwrap();
    } catch (error) {
      // Error is handled by Redux state
      console.error('Definition lookup failed:', error);
    }
  };

  /**
   * Handle grade level selection
   */
  const handleGradeLevelSelect = (gradeLevel: string) => {
    dispatch(setUserGradeLevel(gradeLevel));
    setShowGradePicker(false);
  };

  /**
   * Handle history item selection
   */
  const handleHistoryItemSelect = (historyItem: any) => {
    setTerm(historyItem.query);
    setShowHistory(false);
  };

  /**
   * Clear current results
   */
  const handleClear = () => {
    dispatch(clearCurrentResponses());
    setTerm('');
    setContext('');
  };

  /**
   * Clear error when component unmounts or term changes
   */
  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [term]);

  /**
   * Get filtered history (only definitions)
   */
  const definitionHistory = history.filter(item => item.type === 'definition').slice(0, 10);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>Define Mode</Text>
              <Text style={styles.subtitle}>Get instant math definitions</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowHistory(!showHistory)}
              style={styles.historyButton}
            >
              <Ionicons name="time-outline" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Input Section */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>
              What math term would you like to define?
            </Text>
            
            {/* Term Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Math Term</Text>
              <TextInput
                value={term}
                onChangeText={setTerm}
                placeholder="e.g., hypotenuse, derivative, polynomial..."
                style={styles.textInput}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                onSubmitEditing={handleLookupDefinition}
              />
            </View>

            {/* Context Input (Optional) */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Context (Optional)</Text>
              <TextInput
                value={context}
                onChangeText={setContext}
                placeholder="e.g., in geometry, in calculus..."
                style={styles.textInput}
                autoCapitalize="none"
                returnKeyType="done"
              />
            </View>

            {/* Grade Level Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Grade Level</Text>
              <TouchableOpacity
                onPress={() => setShowGradePicker(!showGradePicker)}
                style={styles.picker}
              >
                <Text style={styles.pickerText}>
                  {GRADE_LEVELS.find(g => g.value === userGradeLevel)?.label || 'Select Grade Level'}
                </Text>
                <Ionicons 
                  name={showGradePicker ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
              
              {/* Grade Level Picker */}
              {showGradePicker && (
                <View style={styles.pickerDropdown}>
                  {GRADE_LEVELS.map((grade) => (
                    <TouchableOpacity
                      key={grade.value}
                      onPress={() => handleGradeLevelSelect(grade.value)}
                      style={[
                        styles.pickerItem,
                        userGradeLevel === grade.value && styles.pickerItemSelected
                      ]}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        userGradeLevel === grade.value && styles.pickerItemTextSelected
                      ]}>
                        {grade.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={handleLookupDefinition}
                disabled={isLoading || !term.trim()}
                style={[
                  styles.primaryButton,
                  (isLoading || !term.trim()) && styles.primaryButtonDisabled
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Ionicons name="search" size={20} color="white" />
                )}
                <Text style={[
                  styles.primaryButtonText,
                  (isLoading || !term.trim()) && styles.primaryButtonTextDisabled
                ]}>
                  {isLoading ? 'Looking up...' : 'Get Definition'}
                </Text>
              </TouchableOpacity>
              
              {(currentDefinition || term) && (
                <TouchableOpacity
                  onPress={handleClear}
                  style={styles.secondaryButton}
                >
                  <Ionicons name="refresh" size={20} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <View style={styles.errorHeader}>
                <Ionicons name="alert-circle" size={20} color="#DC2626" />
                <Text style={styles.errorTitle}>Error</Text>
              </View>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Definition Result */}
          {currentDefinition && (
            <View style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>Definition</Text>
                <View 
                  style={[
                    styles.confidenceBadge,
                    { backgroundColor: getConfidenceColor(currentDefinition.confidence) + '20' }
                  ]}
                >
                  <Text 
                    style={[
                      styles.confidenceText,
                      { color: getConfidenceColor(currentDefinition.confidence) }
                    ]}
                  >
                    {formatConfidence(currentDefinition.confidence)} Confidence
                  </Text>
                </View>
              </View>
              
              <Text style={styles.definitionText}>
                {currentDefinition.explanation}
              </Text>

              {/* Sources */}
              {currentDefinition.sources && currentDefinition.sources.length > 0 && (
                <View style={styles.sourcesContainer}>
                  <Text style={styles.sourcesTitle}>Sources:</Text>
                  {currentDefinition.sources.map((source, index) => (
                    <View key={index} style={styles.sourceItem}>
                      <Text style={styles.sourceText}>
                        • {source.book}
                        {source.chapter && `, Chapter ${source.chapter}`}
                        {source.section && ` - ${source.section}`}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Processing Time */}
              {currentDefinition.processingTime && (
                <Text style={styles.processingTime}>
                  Response time: {(currentDefinition.processingTime / 1000).toFixed(1)}s
                </Text>
              )}
            </View>
          )}

          {/* History Section */}
          {showHistory && definitionHistory.length > 0 && (
            <View style={styles.historyContainer}>
              <Text style={styles.historyTitle}>Recent Definitions</Text>
              {definitionHistory.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleHistoryItemSelect(item)}
                  style={styles.historyItem}
                >
                  <Text style={styles.historyItemTitle}>{item.query}</Text>
                  <Text style={styles.historyItemPreview} numberOfLines={2}>
                    {item.response.explanation.substring(0, 100)}...
                  </Text>
                  <Text style={styles.historyItemDate}>
                    {new Date(item.timestamp).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Empty State */}
          {!currentDefinition && !isLoading && !error && (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyStateTitle}>
                Enter a math term to get started
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                Get instant definitions with examples and citations from your textbooks
              </Text>
            </View>
          )}
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
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  historyButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerText: {
    fontSize: 16,
    color: '#111827',
  },
  pickerDropdown: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
  },
  pickerItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerItemSelected: {
    backgroundColor: '#EFF6FF',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#111827',
  },
  pickerItemTextSelected: {
    color: '#2563EB',
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  primaryButtonText: {
    marginLeft: 8,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  primaryButtonTextDisabled: {
    color: '#6B7280',
  },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorTitle: {
    marginLeft: 8,
    color: '#991B1B',
    fontWeight: '500',
  },
  errorText: {
    color: '#B91C1C',
    marginTop: 4,
  },
  resultContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '500',
  },
  definitionText: {
    color: '#1E40AF',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  sourcesContainer: {
    marginBottom: 12,
  },
  sourcesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  sourceItem: {
    marginBottom: 4,
  },
  sourceText: {
    fontSize: 14,
    color: '#1D4ED8',
  },
  processingTime: {
    fontSize: 12,
    color: '#2563EB',
    marginTop: 12,
  },
  historyContainer: {
    marginBottom: 24,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  historyItem: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  historyItemTitle: {
    fontWeight: '500',
    color: '#111827',
  },
  historyItemPreview: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  historyItemDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
}); 