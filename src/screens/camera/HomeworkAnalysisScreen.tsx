import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  StyleSheet 
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { CameraStackParamList } from '../../types/navigation';
import { Screen } from '../../components/common/Screen';
import { analyzeMathSnap, ExtendedRagResponse } from '../../services/firebase/rag.service';
import { uploadSnap } from '../../services/firebase/storage.service';
import { useAuth } from '../../hooks/auth/use-auth';

/**
 * Homework Analysis Screen - analyzes homework images using RAG system
 * 
 * This screen takes a captured homework image, uploads it to storage,
 * analyzes it using OpenAI Vision API, and provides step-by-step explanations
 * using the RAG system with textbook context.
 */

type HomeworkAnalysisScreenNavigationProp = StackNavigationProp<CameraStackParamList, 'HomeworkAnalysis'>;
type HomeworkAnalysisScreenRouteProp = RouteProp<CameraStackParamList, 'HomeworkAnalysis'>;

interface AnalysisState {
  isLoading: boolean;
  result: ExtendedRagResponse | null;
  error: string | null;
  stage: 'uploading' | 'analyzing' | 'generating' | 'complete';
}

export function HomeworkAnalysisScreen() {
  const navigation = useNavigation<HomeworkAnalysisScreenNavigationProp>();
  const route = useRoute<HomeworkAnalysisScreenRouteProp>();
  const { user } = useAuth();
  
  const { imageUri, gradeLevel } = route.params;
  
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isLoading: true,
    result: null,
    error: null,
    stage: 'uploading'
  });

  /**
   * Start homework analysis process
   */
  useEffect(() => {
    analyzeHomework();
  }, []);

  /**
   * Analyze homework image using RAG system
   */
  const analyzeHomework = async () => {
    try {
      if (!user) {
        throw new Error('User must be logged in to analyze homework');
      }

      setAnalysisState(prev => ({ ...prev, stage: 'uploading' }));
      
      // Upload image to Firebase Storage
      const uploadResult = await uploadSnap(imageUri, user.uid, 'photo');
      
      setAnalysisState(prev => ({ ...prev, stage: 'analyzing' }));
      
      // Analyze image using RAG system
      const result = await analyzeMathSnap({
        imageUrl: uploadResult.downloadURL,
        gradeLevel,
        analysisType: 'homework'
      });
      
      setAnalysisState({
        isLoading: false,
        result,
        error: null,
        stage: 'complete'
      });
      
    } catch (error) {
      console.error('Error analyzing homework:', error);
      setAnalysisState({
        isLoading: false,
        result: null,
        error: error instanceof Error ? error.message : 'Failed to analyze homework',
        stage: 'complete'
      });
    }
  };

  /**
   * Retry analysis
   */
  const handleRetry = () => {
    setAnalysisState({
      isLoading: true,
      result: null,
      error: null,
      stage: 'uploading'
    });
    analyzeHomework();
  };

  /**
   * Navigate back to camera
   */
  const handleGoBack = () => {
    navigation.goBack();
  };

  /**
   * Get stage description for loading UI
   */
  const getStageDescription = () => {
    switch (analysisState.stage) {
      case 'uploading':
        return 'Uploading your homework...';
      case 'analyzing':
        return 'Reading the math problems...';
      case 'generating':
        return 'Finding helpful explanations...';
      case 'complete':
        return 'Analysis complete!';
      default:
        return 'Processing...';
    }
  };

  /**
   * Render confidence indicator
   */
  const renderConfidenceIndicator = (confidence: number) => {
    const getColor = () => {
      if (confidence >= 80) return '#4CAF50';
      if (confidence >= 60) return '#FF9800';
      return '#F44336';
    };

    return (
      <View style={styles.confidenceContainer}>
        <Text style={styles.confidenceLabel}>Confidence:</Text>
        <View style={[styles.confidenceBar, { backgroundColor: getColor() }]}>
          <Text style={styles.confidenceText}>{confidence}%</Text>
        </View>
      </View>
    );
  };

  /**
   * Render sources section
   */
  const renderSources = (sources: ExtendedRagResponse['sources']) => {
    if (!sources || sources.length === 0) return null;

    return (
      <View style={styles.sourcesContainer}>
        <Text style={styles.sourcesTitle}>📚 Sources</Text>
        {sources.map((source, index) => (
          <View key={index} style={styles.sourceItem}>
            <Text style={styles.sourceText}>
              {source.book}
              {source.chapter && `, Chapter ${source.chapter}`}
              {source.section && `, ${source.section}`}
            </Text>
            <Text style={styles.sourceRelevance}>
              {Math.round(source.relevanceScore * 100)}% relevant
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <Screen backgroundColor="#f5f5f5">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Homework Helper</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Image Preview */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
          </View>

          {/* Loading State */}
          {analysisState.isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>{getStageDescription()}</Text>
              <Text style={styles.loadingSubtext}>
                This may take a few moments while we analyze your homework
              </Text>
            </View>
          )}

          {/* Error State */}
          {analysisState.error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color="#F44336" />
              <Text style={styles.errorTitle}>Analysis Failed</Text>
              <Text style={styles.errorText}>{analysisState.error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Results */}
          {analysisState.result && (
            <View style={styles.resultsContainer}>
              {/* Confidence Indicator */}
              {renderConfidenceIndicator(analysisState.result.confidence)}

              {/* Image Analysis Info */}
              {analysisState.result.imageAnalysis && (
                <View style={styles.imageAnalysisContainer}>
                  <Text style={styles.sectionTitle}>🔍 What I Found</Text>
                  <Text style={styles.extractedText}>
                    {analysisState.result.imageAnalysis.extractedText}
                  </Text>
                  
                  {/* Math Problems */}
                  {analysisState.result.imageAnalysis.mathProblems.map((problem, index) => (
                    <View key={index} style={styles.problemContainer}>
                      <Text style={styles.problemType}>
                        {problem.type.replace('_', ' ').toUpperCase()} • {problem.difficulty.toUpperCase()}
                      </Text>
                      <Text style={styles.problemText}>{problem.problem}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Explanation */}
              <View style={styles.explanationContainer}>
                <Text style={styles.sectionTitle}>💡 Step-by-Step Help</Text>
                <Text style={styles.explanationText}>
                  {analysisState.result.explanation}
                </Text>
              </View>

              {/* Sources */}
              {renderSources(analysisState.result.sources)}
            </View>
          )}
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#F44336',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    padding: 16,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  confidenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 12,
  },
  confidenceBar: {
    flex: 1,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confidenceText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  imageAnalysisContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  extractedText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  problemContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  problemType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  problemText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  explanationContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  explanationText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  sourcesContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sourcesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  sourceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sourceText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  sourceRelevance: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
}); 