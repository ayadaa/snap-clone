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
import * as admin from 'firebase-admin';

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
 * Daily Challenge Interfaces
 */
interface DailyChallengeRequest {
  gradeLevel: string; // e.g., "3rd", "7th", "11th"
  challengeType?: 'word-problem' | 'equation' | 'multiple-choice' | 'concept';
  date?: string; // ISO date string, defaults to today
}

interface DailyChallengeResponse {
  success: boolean;
  challenge?: {
    id: string;
    date: string;
    gradeLevel: string;
    type: string;
    problem: string;
    hint?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    points: number;
    concepts: string[];
    sources: Array<{
      book: string;
      chapter: string;
      section: string;
    }>;
  };
  error?: string;
}

interface ChallengeSubmissionRequest {
  challengeId: string;
  answer: string;
  submissionType: 'text' | 'image';
  imageUrl?: string;
}

interface ChallengeSubmissionResponse {
  success: boolean;
  result?: {
    isCorrect: boolean;
    score: number;
    feedback: string;
    correctAnswer?: string;
    explanation?: string;
    streak?: number;
    totalPoints?: number;
  };
  error?: string;
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

/**
 * Generate Daily Math Challenge
 * Creates a daily math challenge tailored to the user's grade level
 */
export const generateDailyChallenge = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '1GB',
    secrets: ['OPENAI_API_KEY', 'PINECONE_API_KEY']
  })
  .https
  .onCall(async (data: DailyChallengeRequest, context): Promise<DailyChallengeResponse> => {
    try {
      // Verify authentication
      if (!context.auth) {
        throw new functions.https.HttpsError(
          'unauthenticated',
          'User must be authenticated to generate daily challenges.'
        );
      }

      const { gradeLevel, challengeType = 'word-problem', date } = data;
      const challengeDate = date || new Date().toISOString().split('T')[0];
      
      functions.logger.info('Generating daily challenge:', { gradeLevel, challengeType, challengeDate });

      // Check if challenge already exists for this date and grade level
      const existingChallenge = await admin.firestore()
        .collection('dailyChallenges')
        .where('date', '==', challengeDate)
        .where('gradeLevel', '==', gradeLevel)
        .limit(1)
        .get();

      if (!existingChallenge.empty) {
        const challenge = existingChallenge.docs[0].data();
        return {
          success: true,
          challenge: {
            id: existingChallenge.docs[0].id,
            ...challenge
          } as any
        };
      }

             // Generate new challenge using RAG
       const challengePrompt = `Generate a ${challengeType} math problem appropriate for ${gradeLevel} grade level. 
       The problem should be engaging and educational, suitable for a daily challenge.
       Include a hint that guides students without giving away the answer.
       Format: Problem statement, followed by [HINT: helpful guidance]`;

       const ragResponse = await processRagQuery({
         query: challengePrompt,
         queryType: 'concept_exploration',
         gradeLevel,
         includeExamples: true
       });

             if (!ragResponse.explanation) {
         throw new Error('Failed to generate challenge content');
       }

       // Parse the generated content
       const content = ragResponse.explanation;
       const hintMatch = content.match(/\[HINT:\s*(.*?)\]/);
       const problem = content.replace(/\[HINT:.*?\]/, '').trim();
       const hint = hintMatch ? hintMatch[1] : undefined;

      // Determine difficulty and points based on grade level
      const gradeNum = parseInt(gradeLevel.replace(/\D/g, '')) || 1;
      let difficulty: 'easy' | 'medium' | 'hard';
      let points: number;

      if (gradeNum <= 3) {
        difficulty = 'easy';
        points = 10;
      } else if (gradeNum <= 8) {
        difficulty = 'medium';
        points = 15;
      } else {
        difficulty = 'hard';
        points = 25;
      }

      // Create challenge object
      const challenge = {
        id: `challenge_${challengeDate}_${gradeLevel}`,
        date: challengeDate,
        gradeLevel,
        type: challengeType,
        problem,
        hint,
        difficulty,
        points,
                 concepts: [], // Will be extracted from sources
        sources: ragResponse.sources || [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        )
      };

      // Save to Firestore
      await admin.firestore()
        .collection('dailyChallenges')
        .doc(challenge.id)
        .set(challenge);

      functions.logger.info('Daily challenge generated successfully:', challenge.id);

      return {
        success: true,
        challenge: {
          ...challenge,
          createdAt: undefined, // Remove server timestamp for response
          expiresAt: undefined
        } as any
      };

    } catch (error) {
      functions.logger.error('Error generating daily challenge:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate daily challenge'
      };
    }
  });

/**
 * Submit Challenge Answer
 * Processes and scores user submissions for daily challenges
 */
export const submitChallengeAnswer = functions
  .runWith({
    timeoutSeconds: 300,
    memory: '512MB',
    secrets: ['OPENAI_API_KEY']
  })
  .https
  .onCall(async (data: ChallengeSubmissionRequest, context): Promise<ChallengeSubmissionResponse> => {
    try {
      // Verify authentication
      if (!context.auth) {
        throw new functions.https.HttpsError(
          'unauthenticated',
          'User must be authenticated to submit challenge answers.'
        );
      }

      const { challengeId, answer, submissionType, imageUrl } = data;
      const userId = context.auth.uid;

      functions.logger.info('Processing challenge submission:', { challengeId, submissionType, userId });

      // Get challenge details
      const challengeDoc = await admin.firestore()
        .collection('dailyChallenges')
        .doc(challengeId)
        .get();

      if (!challengeDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Challenge not found');
      }

      const challenge = challengeDoc.data()!;

      // Check if user already submitted for this challenge
      const existingSubmission = await admin.firestore()
        .collection('challengeSubmissions')
        .where('userId', '==', userId)
        .where('challengeId', '==', challengeId)
        .limit(1)
        .get();

      if (!existingSubmission.empty) {
        throw new functions.https.HttpsError('already-exists', 'You have already submitted an answer for this challenge');
      }

             // Process image submission if needed
       let processedAnswer = answer;
       if (submissionType === 'image' && imageUrl) {
         try {
           const visionResponse = await analyzeImageForMath({
             imageUrl,
             analysisType: 'general'
           });
           processedAnswer = visionResponse.extractedText || answer;
         } catch (error) {
           functions.logger.warn('Failed to process image submission:', error);
           // Continue with text answer as fallback
         }
       }

      // Get the expected correct answer if available
      const expectedAnswer = challenge.correctAnswer || null;
      
      // First, try simple numerical comparison if we have an expected answer
      let isCorrectSimple = false;
      if (expectedAnswer) {
        // Extract numbers from both answers for comparison
        const extractNumber = (str: string): number | null => {
          const cleaned = str.replace(/[^\d.-]/g, '');
          const num = parseFloat(cleaned);
          return isNaN(num) ? null : num;
        };
        
        const studentNum = extractNumber(processedAnswer);
        const expectedNum = extractNumber(expectedAnswer);
        
        if (studentNum !== null && expectedNum !== null) {
          // Allow for small floating point differences
          isCorrectSimple = Math.abs(studentNum - expectedNum) < 0.001;
          functions.logger.info('Simple numerical comparison:', { 
            studentNum, 
            expectedNum, 
            isCorrect: isCorrectSimple 
          });
        }
      }
      
      // Evaluate answer using OpenAI
      const evaluationPrompt = `
        Math Problem: ${challenge.problem}
        Student Answer: ${processedAnswer}
        ${expectedAnswer ? `Expected Answer: ${expectedAnswer}` : ''}
        
        IMPORTANT: Be EXTREMELY generous in your evaluation. Accept equivalent answers in ANY format.
        
        Examples of equivalent answers:
        - Numbers: "7", "7 marbles", "seven", "seven marbles", "7.0", "7 items"
        - Money: "$12", "12 dollars", "$12.00", "twelve dollars"
        - Fractions: "1/2", "0.5", "50%", "one half", "half"
        - Units: "5 weeks" = "35 days", "2 hours" = "120 minutes"
        - Text variations: "7 marbles" = "7" = "seven marbles" = "seven"
        
        Key rules:
        1. Extract the numerical value from the student's answer
        2. Ignore extra words like units, articles, or descriptive text
        3. Accept any reasonable representation of the same number
        4. Focus on mathematical correctness, not exact format matching
        
        Evaluate if the student's answer is mathematically correct or equivalent.
        
        Provide encouraging feedback regardless of correctness. If correct, celebrate their success!
        If incorrect, be supportive and educational.
        
        Format your response as JSON:
        {
          "isCorrect": boolean,
          "feedback": "string (always encouraging)",
          "correctAnswer": "string (only if incorrect)",
          "explanation": "string (brief solution steps)"
        }
      `;

      const openai = getOpenAIClient();
      const evaluationResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful math tutor evaluating student answers. Be encouraging and educational.'
          },
          {
            role: 'user',
            content: evaluationPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const evaluationContent = evaluationResponse.choices[0]?.message?.content;
      if (!evaluationContent) {
        throw new Error('Failed to evaluate answer');
      }

      // Clean and parse JSON response (remove markdown code blocks if present)
      const cleanedContent = evaluationContent
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();

      let evaluation;
      try {
        evaluation = JSON.parse(cleanedContent);
      } catch (parseError) {
        functions.logger.error('Failed to parse evaluation response:', { 
          content: evaluationContent, 
          cleaned: cleanedContent,
          error: parseError 
        });
        throw new Error('Failed to parse evaluation response');
      }
      // Use simple numerical comparison if it was successful, otherwise use AI evaluation
      const isCorrect = isCorrectSimple || evaluation.isCorrect;
      
      // More generous scoring system
      let score: number;
      if (isCorrect) {
        // Full points for correct answers
        score = challenge.points;
      } else {
        // More generous partial credit (50% instead of 30%)
        score = Math.floor(challenge.points * 0.5);
      }

      // Update user's challenge progress
      const userProgressRef = admin.firestore()
        .collection('users')
        .doc(userId)
        .collection('challengeProgress')
        .doc('stats');

      const userProgress = await userProgressRef.get();
      const currentStats = userProgress.exists ? userProgress.data()! : {
        totalChallenges: 0,
        correctAnswers: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalPoints: 0,
        lastChallengeDate: null
      };

      // Calculate streak
      const today = new Date().toISOString().split('T')[0];
      const lastDate = currentStats.lastChallengeDate;
      let newStreak = currentStats.currentStreak;

      if (isCorrect) {
        if (lastDate === today) {
          // Same day, don't change streak
        } else if (lastDate === new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]) {
          // Yesterday, increment streak
          newStreak = currentStats.currentStreak + 1;
        } else {
          // Gap in days, reset streak
          newStreak = 1;
        }
      } else {
        // Incorrect answer doesn't break streak but doesn't extend it
      }

      const updatedStats = {
        totalChallenges: currentStats.totalChallenges + 1,
        correctAnswers: currentStats.correctAnswers + (isCorrect ? 1 : 0),
        currentStreak: newStreak,
        bestStreak: Math.max(currentStats.bestStreak, newStreak),
        totalPoints: currentStats.totalPoints + score,
        lastChallengeDate: today
      };

      // Save submission and update stats
      const batch = admin.firestore().batch();

      // Save submission
      const submissionRef = admin.firestore().collection('challengeSubmissions').doc();
      batch.set(submissionRef, {
        userId,
        challengeId,
        answer: processedAnswer,
        submissionType,
        imageUrl: imageUrl || null,
        isCorrect,
        score,
        feedback: evaluation.feedback,
        submittedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Update user stats
      batch.set(userProgressRef, updatedStats, { merge: true });

      await batch.commit();

      functions.logger.info('Challenge submission processed:', { userId, challengeId, isCorrect, score });

      return {
        success: true,
        result: {
          isCorrect,
          score,
          feedback: evaluation.feedback,
          correctAnswer: evaluation.correctAnswer,
          explanation: evaluation.explanation,
          streak: newStreak,
          totalPoints: updatedStats.totalPoints
        }
      };

    } catch (error) {
      functions.logger.error('Error processing challenge submission:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process submission'
      };
    }
  });

/**
 * Internal helper function to generate a new daily challenge
 */
async function generateNewDailyChallenge(gradeLevel: string, challengeDate: string): Promise<DailyChallengeResponse> {
  try {
    const challengeType = 'word-problem';
    
    functions.logger.info('Generating daily challenge:', { gradeLevel, challengeType, challengeDate });

    // Generate new challenge using OpenAI directly for better control
    const openai = getOpenAIClient();
    
    const challengePrompt = `Create a ${challengeType} math problem for ${gradeLevel} grade students.

Requirements:
- Age-appropriate and engaging scenario
- Clear, concise problem statement
- Specific numerical answer
- Educational value
- Fun context (sports, games, food, animals, etc.)

Format your response as JSON:
{
  "problem": "Clear problem statement with specific question",
  "hint": "Helpful guidance without giving away the answer",
  "correctAnswer": "The exact numerical answer",
  "explanation": "Brief explanation of the solution method"
}

Example for 7th grade:
{
  "problem": "Sarah is saving money for a new bike. She saves $15 each week. After 8 weeks, she has enough money to buy the bike and has $20 left over. How much does the bike cost?",
  "hint": "Think about how much Sarah saved in total, then subtract what she has left over.",
  "correctAnswer": "100",
  "explanation": "Sarah saved $15 × 8 = $120 total. Since she has $20 left over, the bike costs $120 - $20 = $100."
}`;

    const challengeResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a math teacher creating engaging daily challenge problems for students. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: challengePrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const challengeContent = challengeResponse.choices[0]?.message?.content;
    if (!challengeContent) {
      throw new Error('Failed to generate challenge content');
    }

    // Parse the JSON response
    const cleanedContent = challengeContent
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    let challengeData;
    try {
      challengeData = JSON.parse(cleanedContent);
    } catch (parseError) {
      functions.logger.error('Failed to parse challenge response:', { 
        content: challengeContent, 
        cleaned: cleanedContent,
        error: parseError 
      });
      throw new Error('Failed to parse challenge response');
    }

    const { problem, hint, correctAnswer, explanation } = challengeData;

    // Determine difficulty and points based on grade level
    const gradeNum = parseInt(gradeLevel.replace(/\D/g, '')) || 1;
    let difficulty: 'easy' | 'medium' | 'hard';
    let points: number;

    if (gradeNum <= 3) {
      difficulty = 'easy';
      points = 10;
    } else if (gradeNum <= 8) {
      difficulty = 'medium';
      points = 15;
    } else {
      difficulty = 'hard';
      points = 25;
    }

    // Create challenge object
    const challenge = {
      id: `challenge_${challengeDate}_${gradeLevel}`,
      date: challengeDate,
      gradeLevel,
      type: challengeType,
      problem,
      hint: hint || null, // Ensure hint is not undefined
      difficulty,
      points,
      concepts: [], // Challenge-specific concepts
      sources: [], // Generated challenges don't have textbook sources
      correctAnswer, // Store the correct answer for validation
      explanation, // Store the solution explanation
      version: 2, // Version 2 uses new format
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      )
    };

    // Save to Firestore
    await admin.firestore()
      .collection('dailyChallenges')
      .doc(challenge.id)
      .set(challenge);

    functions.logger.info('Daily challenge generated successfully:', challenge.id);

    return {
      success: true,
      challenge: {
        ...challenge,
        createdAt: undefined, // Remove server timestamp for response
        expiresAt: undefined
      } as any
    };

  } catch (error) {
    functions.logger.error('Error generating daily challenge:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate daily challenge'
    };
  }
}

/**
 * Get Daily Challenge
 * Retrieves the daily challenge for a user's grade level
 */
export const getDailyChallenge = functions
  .runWith({
    secrets: [openaiApiKey, pineconeApiKey]
  })
  .https
  .onCall(async (data: { gradeLevel: string; date?: string }, context): Promise<DailyChallengeResponse> => {
    try {
      checkAuth(context, 'get daily challenges');

      const { gradeLevel, date } = data;
      const challengeDate = date || new Date().toISOString().split('T')[0];

      // Try to get existing challenge
      const challengeQuery = await admin.firestore()
        .collection('dailyChallenges')
        .where('date', '==', challengeDate)
        .where('gradeLevel', '==', gradeLevel)
        .limit(1)
        .get();

      if (!challengeQuery.empty) {
        const challenge = challengeQuery.docs[0].data();
        
        // Check if this is an old version challenge (version < 2)
        if (!challenge.version || challenge.version < 2) {
          functions.logger.info('Found old version challenge, regenerating...');
          // Delete the old challenge
          await challengeQuery.docs[0].ref.delete();
          // Generate a new one
          return await generateNewDailyChallenge(gradeLevel, challengeDate);
        }
        
        return {
          success: true,
          challenge: {
            id: challengeQuery.docs[0].id,
            ...challenge
          } as any
        };
      }

             // If no challenge exists, generate one
       return await generateNewDailyChallenge(gradeLevel, challengeDate);

    } catch (error) {
      functions.logger.error('Error getting daily challenge:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get daily challenge'
      };
    }
  }); 