/**
 * @fileoverview Callable Cloud Functions for MathSnap RAG features
 * 
 * These functions provide the main API endpoints that the frontend app will call:
 * 1. getMathExplanation - Process text queries for math help
 * 2. analyzeMathSnap - Process image Snaps for math problem analysis
 * 3. getDefinition - Get definitions for math terms
 * 4. exploreConcept - Explore mathematical concepts in depth
 */

import * as functions from 'firebase-functions';
import { processRagQuery, RagQueryRequest, RagResponse } from '../services/rag.service';
import { 
  analyzeImageForMath, 
  convertImageAnalysisToQuery, 
  determineQueryTypeFromImage,
  ImageAnalysisRequest,
  ImageAnalysisResult 
} from '../services/vision.service';

// Test mode flag - set to false in production
const TEST_MODE = false;

/**
 * Interface for text-based math help requests
 */
interface MathHelpRequest {
  query: string;
  queryType?: 'homework_help' | 'definition' | 'concept_exploration' | 'text';
  gradeLevel?: string;
}

/**
 * Interface for definition lookup requests
 */
interface DefinitionRequest {
  term: string;
  gradeLevel?: string;
  context?: string;
}

/**
 * Interface for concept exploration requests
 */
interface ConceptRequest {
  concept: string;
  gradeLevel?: string;
  depth?: 'basic' | 'intermediate' | 'advanced';
}

/**
 * Extended RAG response with additional properties for frontend
 */
interface ExtendedRagResponse extends RagResponse {
  processingTime?: number;
  imageAnalysis?: ImageAnalysisResult;
}

/**
 * Helper function to check authentication
 */
function checkAuth(context: functions.https.CallableContext, operation: string): void {
  if (!TEST_MODE && !context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      `User must be authenticated to ${operation}`
    );
  }
}

/**
 * Get math explanation for text queries
 * 
 * This function processes text-based math questions and returns detailed explanations
 * using the RAG system to provide contextual, curriculum-aligned responses.
 */
export const getMathExplanation = functions.https.onCall(
  async (data: MathHelpRequest, context: functions.https.CallableContext): Promise<ExtendedRagResponse> => {
    const startTime = Date.now();
    
    try {
      checkAuth(context, 'use math help');

      const { query, queryType = 'homework_help', gradeLevel } = data;

      if (!query || typeof query !== 'string') {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Query is required and must be a string'
        );
      }

      // Build RAG request
      const ragRequest: RagQueryRequest = {
        query,
        queryType,
        gradeLevel
      };

      // Process through RAG system
      const result = await processRagQuery(ragRequest);
      
      // Add processing time
      const extendedResult: ExtendedRagResponse = {
        ...result,
        processingTime: Date.now() - startTime
      };

      return extendedResult;

    } catch (error) {
      functions.logger.error('Error in getMathExplanation:', error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        'internal',
        'An error occurred while processing your math question',
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }
);

/**
 * Analyze math problems from Snap images
 * 
 * This function uses computer vision to analyze images of math problems
 * and then provides explanations using the RAG system.
 */
export const analyzeMathSnap = functions.https.onCall(
  async (data: ImageAnalysisRequest, context: functions.https.CallableContext): Promise<ExtendedRagResponse> => {
    const startTime = Date.now();
    
    try {
      checkAuth(context, 'analyze math snaps');

      const { imageUrl, gradeLevel, analysisType = 'homework' } = data;

      if (!imageUrl || typeof imageUrl !== 'string') {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Image URL is required and must be a string'
        );
      }

      // Step 1: Analyze the image
      const imageAnalysis: ImageAnalysisResult = await analyzeImageForMath({
        imageUrl,
        gradeLevel,
        analysisType
      });

      if (!imageAnalysis.extractedText) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Could not extract text from the image. Please ensure the image contains clear math content.'
        );
      }

      // Step 2: Convert image analysis to RAG query
      const ragQuery = convertImageAnalysisToQuery(imageAnalysis, gradeLevel);
      const queryType = determineQueryTypeFromImage(imageAnalysis);

      // Step 3: Build RAG request
      const ragRequest: RagQueryRequest = {
        query: ragQuery,
        queryType,
        gradeLevel
      };

      // Step 4: Process through RAG system
      const result = await processRagQuery(ragRequest);
      
      // Add processing time and image analysis info
      const extendedResult: ExtendedRagResponse = {
        ...result,
        processingTime: Date.now() - startTime,
        imageAnalysis
      };

      return extendedResult;

    } catch (error) {
      functions.logger.error('Error in analyzeMathSnap:', error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        'internal',
        'An error occurred while analyzing your math snap',
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }
);

/**
 * Get definitions for math terms
 * 
 * This function provides clear, grade-appropriate definitions for mathematical
 * terms and concepts using the RAG system.
 */
export const getDefinition = functions.https.onCall(
  async (data: DefinitionRequest, context: functions.https.CallableContext): Promise<ExtendedRagResponse> => {
    const startTime = Date.now();
    
    try {
      if (!TEST_MODE) {
        checkAuth(context, 'get definitions');
      }

      const { term, gradeLevel, context: termContext } = data;

      if (!term || typeof term !== 'string') {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Term is required and must be a string'
        );
      }

      // Build definition query
      let query = `What is ${term}?`;
      if (termContext) {
        query += ` In the context of ${termContext}.`;
      }
      query += ` Please provide a clear, simple definition.`;

      // Build RAG request
      const ragRequest: RagQueryRequest = {
        query,
        queryType: 'definition',
        gradeLevel
      };

      // Process through RAG system
      const result = await processRagQuery(ragRequest);
      
      // Add processing time
      const extendedResult: ExtendedRagResponse = {
        ...result,
        processingTime: Date.now() - startTime
      };

      return extendedResult;

    } catch (error) {
      functions.logger.error('Error in getDefinition:', error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        'internal',
        'An error occurred while getting the definition',
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }
);

/**
 * Explore mathematical concepts in depth
 * 
 * This function provides comprehensive explanations of mathematical concepts
 * with examples, applications, and related topics.
 */
export const exploreConcept = functions.https.onCall(
  async (data: ConceptRequest, context: functions.https.CallableContext): Promise<ExtendedRagResponse> => {
    const startTime = Date.now();
    
    try {
      checkAuth(context, 'explore concepts');

      const { concept, gradeLevel, depth = 'intermediate' } = data;

      if (!concept || typeof concept !== 'string') {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Concept is required and must be a string'
        );
      }

      // Build exploration query based on depth
      let query = `Explain the concept of ${concept}`;
      
      switch (depth) {
        case 'basic':
          query += ' in simple terms with basic examples';
          break;
        case 'advanced':
          query += ' in detail with advanced applications and connections to other concepts';
          break;
        default:
          query += ' with clear explanations and practical examples';
      }

      // Build RAG request
      const ragRequest: RagQueryRequest = {
        query,
        queryType: 'concept_exploration',
        gradeLevel
      };

      // Process through RAG system
      const result = await processRagQuery(ragRequest);
      
      // Add processing time
      const extendedResult: ExtendedRagResponse = {
        ...result,
        processingTime: Date.now() - startTime
      };

      return extendedResult;

    } catch (error) {
      functions.logger.error('Error in exploreConcept:', error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        'internal',
        'An error occurred while exploring the concept',
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }
);

/**
 * Health check for the RAG system
 * 
 * This function performs a simple test of the RAG pipeline to ensure
 * all components (Pinecone, OpenAI) are working correctly.
 */
export const checkRagHealth = functions.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    try {
      if (!TEST_MODE) {
        checkAuth(context, 'check system health');
      }

      // Perform a simple test query
      const testRequest: RagQueryRequest = {
        query: 'What is addition?',
        queryType: 'definition',
        gradeLevel: 'elementary'
      };

      const result = await processRagQuery(testRequest);

      return {
        status: result.confidence > 0 ? 'healthy' : 'degraded',
        confidence: result.confidence,
        sourcesFound: result.sources?.length || 0,
        message: result.confidence > 0 
          ? 'RAG system is functioning normally' 
          : 'RAG system may be experiencing issues',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      functions.logger.error('Health check failed:', error);
      
      return {
        status: 'unhealthy',
        confidence: 0,
        sourcesFound: 0,
        message: 'RAG system is not responding correctly',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
    }
  }
); 