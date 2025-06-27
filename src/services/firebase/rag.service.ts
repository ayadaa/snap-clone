/**
 * @fileoverview RAG Service for Snap Factor Frontend
 * 
 * This service provides the frontend interface for interacting with
 * Snap Factor's RAG (Retrieval-Augmented Generation) Cloud Functions.
 * It handles math explanations, definitions, concept exploration, and image analysis.
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from '../../config/firebase';

/**
 * Interface for definition requests
 */
export interface DefinitionRequest {
  term: string;
  gradeLevel?: string;
  context?: string;
}

/**
 * Interface for concept exploration requests
 */
export interface ConceptRequest {
  concept: string;
  gradeLevel?: string;
  depth?: 'basic' | 'intermediate' | 'advanced';
}

/**
 * Interface for math help requests
 */
export interface MathHelpRequest {
  query: string;
  queryType?: 'homework_help' | 'definition' | 'concept_exploration' | 'text';
  gradeLevel?: string;
}

/**
 * Interface for image analysis requests
 */
export interface ImageAnalysisRequest {
  imageUrl: string;
  gradeLevel?: string;
  analysisType?: 'homework' | 'textbook' | 'worksheet' | 'general';
}

/**
 * Interface for RAG responses
 */
export interface RagResponse {
  explanation: string;
  sources: Array<{
    book: string;
    chapter?: string;
    section?: string;
    relevanceScore: number;
  }>;
  suggestedActions?: Array<{
    type: 'practice_problem' | 'related_concept' | 'visual_aid';
    description: string;
    data?: any;
  }>;
  confidence: number;
  processingTime?: number;
}

/**
 * Interface for image analysis results
 */
export interface ImageAnalysisResult {
  extractedText: string;
  mathProblems: Array<{
    problem: string;
    type: 'equation' | 'word_problem' | 'graph' | 'geometry' | 'unknown';
    difficulty: 'elementary' | 'middle' | 'high_school' | 'unknown';
  }>;
  confidence: number;
  suggestedQuery: string;
}

/**
 * Extended RAG response with image analysis
 */
export interface ExtendedRagResponse extends RagResponse {
  imageAnalysis?: ImageAnalysisResult;
}

/**
 * Interface for smart caption generation requests
 */
export interface SmartCaptionRequest {
  imageUrl: string;
  gradeLevel?: string;
  captionStyle?: 'casual' | 'celebratory' | 'educational' | 'motivational';
  includeHashtags?: boolean;
  includeEmojis?: boolean;
}

/**
 * Interface for smart caption response
 */
export interface SmartCaptionResponse {
  captions: string[];
  detectedConcepts: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  processingTime: number;
}

/**
 * Get definition for a math term
 * 
 * @param request - Definition request parameters
 * @returns Promise with definition and sources
 */
export async function getDefinition(request: DefinitionRequest): Promise<ExtendedRagResponse> {
  try {
    const getDefinitionFunction = httpsCallable<DefinitionRequest, ExtendedRagResponse>(
      functions,
      'getDefinition'
    );

    const result = await getDefinitionFunction(request);
    return result.data;
  } catch (error) {
    console.error('Error getting definition:', error);
    throw new Error('Failed to get definition. Please try again.');
  }
}

/**
 * Explore a mathematical concept in depth
 * 
 * @param request - Concept exploration request parameters
 * @returns Promise with detailed explanation and examples
 */
export async function exploreConcept(request: ConceptRequest): Promise<ExtendedRagResponse> {
  try {
    const exploreConceptFunction = httpsCallable<ConceptRequest, ExtendedRagResponse>(
      functions,
      'exploreConcept'
    );

    const result = await exploreConceptFunction(request);
    return result.data;
  } catch (error) {
    console.error('Error exploring concept:', error);
    throw new Error('Failed to explore concept. Please try again.');
  }
}

/**
 * Get math explanation for text queries
 * 
 * @param request - Math help request parameters
 * @returns Promise with step-by-step explanation
 */
export async function getMathExplanation(request: MathHelpRequest): Promise<ExtendedRagResponse> {
  try {
    const getMathExplanationFunction = httpsCallable<MathHelpRequest, ExtendedRagResponse>(
      functions,
      'getMathExplanation'
    );

    const result = await getMathExplanationFunction(request);
    return result.data;
  } catch (error) {
    console.error('Error getting math explanation:', error);
    throw new Error('Failed to get math explanation. Please try again.');
  }
}

/**
 * Analyze math problems from Snap images
 * 
 * @param request - Image analysis request parameters
 * @returns Promise with image analysis and explanation
 */
export async function analyzeMathSnap(request: ImageAnalysisRequest): Promise<ExtendedRagResponse> {
  try {
    const analyzeMathSnapFunction = httpsCallable<ImageAnalysisRequest, ExtendedRagResponse>(
      functions,
      'analyzeMathSnap'
    );

    const result = await analyzeMathSnapFunction(request);
    return result.data;
  } catch (error) {
    console.error('Error analyzing math snap:', error);
    throw new Error('Failed to analyze math snap. Please try again.');
  }
}

/**
 * Check RAG system health
 * 
 * @returns Promise with system health status
 */
export async function checkRagHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  confidence: number;
  sourcesFound: number;
  message: string;
  timestamp: string;
}> {
  try {
    const checkRagHealthFunction = httpsCallable(functions, 'checkRagHealth');
    const result = await checkRagHealthFunction();
    return result.data as {
      status: 'healthy' | 'degraded' | 'unhealthy';
      confidence: number;
      sourcesFound: number;
      message: string;
      timestamp: string;
    };
  } catch (error) {
    console.error('Error checking RAG health:', error);
    throw new Error('Failed to check system health.');
  }
}

/**
 * Format confidence score for display
 * 
 * @param confidence - Confidence score (0-100)
 * @returns Formatted confidence string
 */
export function formatConfidence(confidence: number): string {
  if (confidence >= 90) return 'Very High';
  if (confidence >= 75) return 'High';
  if (confidence >= 60) return 'Medium';
  if (confidence >= 40) return 'Low';
  return 'Very Low';
}

/**
 * Get confidence color for UI display
 * 
 * @param confidence - Confidence score (0-100)
 * @returns Color string for UI
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 75) return '#10B981'; // Green
  if (confidence >= 60) return '#F59E0B'; // Yellow
  if (confidence >= 40) return '#F97316'; // Orange
  return '#EF4444'; // Red
}

/**
 * Validate grade level input
 * 
 * @param gradeLevel - Grade level string
 * @returns Boolean indicating if valid
 */
export function isValidGradeLevel(gradeLevel: string): boolean {
  const validGrades = [
    'elementary', 'kindergarten', '1st', '2nd', '3rd', '4th', '5th',
    'middle', '6th', '7th', '8th',
    'high_school', '9th', '10th', '11th', '12th',
    'college', 'general'
  ];
  
  return validGrades.includes(gradeLevel.toLowerCase());
}

/**
 * Generate smart captions for math Snaps
 * 
 * This function calls the generateSmartCaption Cloud Function to create
 * engaging, educational captions for students sharing their math work.
 * 
 * @param request - Smart caption generation request
 * @returns Promise resolving to smart caption response
 */
export async function generateSmartCaption(
  request: SmartCaptionRequest
): Promise<SmartCaptionResponse> {
  try {
    console.log('🎨 Generating smart caption for image:', request.imageUrl.substring(0, 50) + '...');
    
    const generateSmartCaptionFunction = httpsCallable<SmartCaptionRequest, SmartCaptionResponse>(
      functions, 
      'generateSmartCaption'
    );
    
    const result = await generateSmartCaptionFunction(request);
    
    console.log('✅ Smart caption generated successfully:', {
      captionsCount: result.data.captions.length,
      difficulty: result.data.difficulty,
      processingTime: result.data.processingTime
    });
    
    return result.data;
  } catch (error) {
    console.error('❌ Error generating smart caption:', error);
    throw new Error('Failed to generate smart caption. Please try again.');
  }
} 