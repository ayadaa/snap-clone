/**
 * @fileoverview Callable Cloud Functions for Snap Factor RAG features
 * 
 * This file contains all the callable functions for Snap Factor's math learning features:
 * 1. getMathExplanation - Get explanations for math concepts and problems
 * 2. analyzeMathSnap - Process image Snaps for math problem analysis
 * 3. getDefinition - Get definitions for math terms
 * 4. exploreConcept - Deep dive into mathematical concepts
 * 5. generateSmartCaption - Generate AI captions for math snaps
 * 6. checkRagHealth - Health check for RAG system
 */

import * as functions from 'firebase-functions';
import { defineSecret } from 'firebase-functions/params';
import { processRagQuery, RagQueryRequest, RagResponse } from '../services/rag.service';
import { 
  analyzeImageForMath, 
  convertImageAnalysisToQuery, 
  determineQueryTypeFromImage,
  ImageAnalysisRequest,
  ImageAnalysisResult 
} from '../services/vision.service';

// Define secrets
const openaiApiKey = defineSecret('OPENAI_API_KEY');
const pineconeApiKey = defineSecret('PINECONE_API_KEY');

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
 * Interface for smart caption generation requests
 */
interface SmartCaptionRequest {
  imageUrl: string;
  gradeLevel?: string;
  captionStyle?: 'casual' | 'celebratory' | 'educational' | 'motivational';
  includeHashtags?: boolean;
  includeEmojis?: boolean;
}

/**
 * Interface for smart caption response
 */
interface SmartCaptionResponse {
  captions: string[];
  detectedConcepts: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  processingTime: number;
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
 * Get OpenAI client instance
 */
function getOpenAIClient() {
  const OpenAI = require('openai');
  return new OpenAI({
    apiKey: openaiApiKey.value(),
  });
}

/**
 * Get math explanation for text queries
 * 
 * This function processes text-based math questions and returns detailed explanations
 * using the RAG system to provide contextual, curriculum-aligned responses.
 */
export const getMathExplanation = functions
  .runWith({
    secrets: [openaiApiKey, pineconeApiKey]
  })
  .https.onCall(
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
export const analyzeMathSnap = functions
  .runWith({
    secrets: [openaiApiKey, pineconeApiKey]
  })
  .https.onCall(
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
export const getDefinition = functions
  .runWith({
    secrets: [openaiApiKey, pineconeApiKey]
  })
  .https.onCall(
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
export const exploreConcept = functions
  .runWith({
    secrets: [openaiApiKey, pineconeApiKey]
  })
  .https.onCall(
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
export const checkRagHealth = functions
  .runWith({
    secrets: [openaiApiKey, pineconeApiKey]
  })
  .https.onCall(
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

/**
 * Generate smart captions for math Snaps
 * 
 * This function analyzes math images and generates engaging, educational captions
 * that students can use when sharing their work on social media or stories.
 */
export const generateSmartCaption = functions
  .runWith({
    secrets: [openaiApiKey, pineconeApiKey]
  })
  .https.onCall(
    async (data: SmartCaptionRequest, context: functions.https.CallableContext): Promise<SmartCaptionResponse> => {
      const startTime = Date.now();
      
      try {
        checkAuth(context, 'generate smart captions');

        const { 
          imageUrl, 
          gradeLevel, 
          captionStyle = 'casual',
          includeHashtags = true,
          includeEmojis = true 
        } = data;

        if (!imageUrl || typeof imageUrl !== 'string') {
          throw new functions.https.HttpsError(
            'invalid-argument',
            'Image URL is required and must be a string'
          );
        }

        // Step 1: Analyze the image to understand the math content
        const imageAnalysis: ImageAnalysisResult = await analyzeImageForMath({
          imageUrl,
          gradeLevel,
          analysisType: 'general'
        });

        if (!imageAnalysis.extractedText) {
          throw new functions.https.HttpsError(
            'failed-precondition',
            'Could not extract math content from the image for caption generation.'
          );
        }

        // Step 2: Generate multiple caption options using OpenAI
        const captionPrompt = buildCaptionPrompt(
          imageAnalysis, 
          captionStyle, 
          gradeLevel,
          includeHashtags,
          includeEmojis
        );

        const openai = getOpenAIClient();
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a creative social media caption generator for math students. Generate engaging, positive captions that celebrate learning achievements.'
            },
            {
              role: 'user',
              content: captionPrompt
            }
          ],
          max_tokens: 500,
          temperature: 0.8, // Higher temperature for more creative captions
        });

        const captionText = response.choices[0]?.message?.content;
        if (!captionText) {
          throw new functions.https.HttpsError(
            'internal',
            'Failed to generate caption content'
          );
        }

        // Parse the response to extract multiple captions
        const captions = parseCaptionResponse(captionText);
        
        // Extract detected concepts and difficulty
        const detectedConcepts = extractMathConcepts(imageAnalysis.extractedText);
        const difficulty = determineDifficulty(imageAnalysis, gradeLevel);

        const result: SmartCaptionResponse = {
          captions,
          detectedConcepts,
          difficulty,
          processingTime: Date.now() - startTime
        };

        return result;

      } catch (error) {
        functions.logger.error('Error in generateSmartCaption:', error);
        
        if (error instanceof functions.https.HttpsError) {
          throw error;
        }

        throw new functions.https.HttpsError(
          'internal',
          'An error occurred while generating smart captions',
          { originalError: error instanceof Error ? error.message : String(error) }
        );
      }
    }
  );

/**
 * Build caption generation prompt based on image analysis and preferences
 */
function buildCaptionPrompt(
  imageAnalysis: ImageAnalysisResult, 
  style: string, 
  gradeLevel?: string,
  includeHashtags: boolean = true,
  includeEmojis: boolean = true
): string {
  const mathContent = imageAnalysis.extractedText;
  const concepts = imageAnalysis.mathProblems.map(p => p.type).filter(type => type !== 'unknown');
  
  let styleDescription = '';
  switch (style) {
    case 'celebratory':
      styleDescription = 'celebratory and triumphant, showing pride in completing the work';
      break;
    case 'educational':
      styleDescription = 'educational and informative, highlighting what was learned';
      break;
    case 'motivational':
      styleDescription = 'motivational and inspiring, encouraging others to keep learning';
      break;
    default:
      styleDescription = 'casual and relatable, like a student sharing with friends';
  }

  return `
Generate 3 different social media captions for a student who just completed this math work:

Math Content: "${mathContent}"
Detected Concepts: ${concepts.join(', ')}
Grade Level: ${gradeLevel || 'Not specified'}
Caption Style: ${styleDescription}

Requirements:
- Each caption should be unique and engaging
- ${includeEmojis ? 'Include relevant emojis (📐📊🧮🎯✨💪🔥📚)' : 'Do not include emojis'}
- ${includeHashtags ? 'Include 2-3 relevant hashtags like #MathWhiz #StudyLife #MathWins #LearningJourney #MathSuccess' : 'Do not include hashtags'}
- Keep each caption under 280 characters
- Make them sound authentic and age-appropriate
- Celebrate the achievement without giving away answers
- Be positive and encouraging

Format your response as:
1. [First caption]
2. [Second caption]  
3. [Third caption]
`;
}

/**
 * Parse caption response from OpenAI into array of captions
 */
function parseCaptionResponse(response: string): string[] {
  const lines = response.split('\n').filter(line => line.trim().length > 0);
  const captions: string[] = [];
  
  for (const line of lines) {
    // Look for numbered lines (1. 2. 3.) or bullet points
    const match = line.match(/^[0-9]+\.\s*(.+)$/) || line.match(/^[-•]\s*(.+)$/);
    if (match) {
      captions.push(match[1].trim());
    }
  }
  
  // Fallback: if no numbered format found, split by sentences
  if (captions.length === 0) {
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences.slice(0, 3).map(s => s.trim());
  }
  
  return captions.slice(0, 3); // Return max 3 captions
}

/**
 * Extract math concepts from text
 */
function extractMathConcepts(text: string): string[] {
  const concepts: string[] = [];
  const mathTerms = [
    'algebra', 'geometry', 'calculus', 'trigonometry', 'statistics',
    'equation', 'function', 'derivative', 'integral', 'limit',
    'polynomial', 'quadratic', 'linear', 'exponential', 'logarithm',
    'triangle', 'circle', 'rectangle', 'square', 'angle',
    'fraction', 'decimal', 'percentage', 'ratio', 'proportion'
  ];
  
  const lowerText = text.toLowerCase();
  for (const term of mathTerms) {
    if (lowerText.includes(term)) {
      concepts.push(term);
    }
  }
  
  return [...new Set(concepts)]; // Remove duplicates
}

/**
 * Determine difficulty level based on image analysis
 */
function determineDifficulty(imageAnalysis: ImageAnalysisResult, gradeLevel?: string): 'easy' | 'medium' | 'hard' {
  const text = imageAnalysis.extractedText.toLowerCase();
  
  // Check for advanced concepts
  if (text.includes('derivative') || text.includes('integral') || text.includes('limit')) {
    return 'hard';
  }
  
  // Check for intermediate concepts
  if (text.includes('quadratic') || text.includes('trigonometry') || text.includes('logarithm')) {
    return 'medium';
  }
  
  // Check grade level
  if (gradeLevel) {
    const grade = parseInt(gradeLevel);
    if (grade >= 11) return 'hard';
    if (grade >= 8) return 'medium';
  }
  
  return 'easy';
} 