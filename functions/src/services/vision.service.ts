/**
 * @fileoverview Vision service for analyzing math problems from images
 * 
 * This service uses OpenAI's Vision API to:
 * 1. Analyze images of math problems from Snaps
 * 2. Extract text and mathematical expressions
 * 3. Identify the type of math problem
 * 4. Format the extracted content for RAG processing
 */

import OpenAI from 'openai';
import * as functions from 'firebase-functions';
import { defineSecret } from 'firebase-functions/params';

// Define secret
const openaiApiKey = defineSecret('OPENAI_API_KEY');

/**
 * Get OpenAI client instance
 */
function getOpenAIClient(): OpenAI {
  return new OpenAI({
    apiKey: openaiApiKey.value(),
  });
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
 * Analyze an image containing math problems using OpenAI Vision API
 */
export async function analyzeImageForMath(
  request: ImageAnalysisRequest
): Promise<ImageAnalysisResult> {
  functions.logger.info('Analyzing image for math content', {
    imageUrl: request.imageUrl.substring(0, 50) + '...',
    analysisType: request.analysisType,
  });

  try {
    const gradeContext = request.gradeLevel 
      ? `The student is in ${request.gradeLevel}.`
      : 'This is for a K-12 student.';

    const analysisPrompt = `You are a math teacher analyzing an image that contains mathematical content. ${gradeContext}

Please analyze this image and provide:

1. Extract ALL mathematical text, equations, and problems you can see
2. Identify the type of each math problem (equation, word problem, graph, geometry, etc.)
3. Estimate the difficulty level (elementary, middle school, high school)
4. Suggest a clear, specific question that a student might ask about this content

Format your response as JSON with this structure:
{
  "extractedText": "All text and mathematical expressions found in the image",
  "mathProblems": [
    {
      "problem": "Specific math problem or equation",
      "type": "equation|word_problem|graph|geometry|unknown",
      "difficulty": "elementary|middle|high_school|unknown"
    }
  ],
  "confidence": 85,
  "suggestedQuery": "A clear question a student might ask about this math content"
}

Be thorough in extracting mathematical content, including:
- Equations and expressions
- Word problems
- Geometric figures and measurements
- Graphs and charts
- Mathematical symbols and notation

If you can't clearly see mathematical content, set confidence to a lower value and explain what you can see.`;

    const response = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: analysisPrompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: request.imageUrl,
                detail: 'high', // Use high detail for better math recognition
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.3, // Lower temperature for more consistent analysis
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content from Vision API');
    }

    // Parse the JSON response
    let analysisResult: ImageAnalysisResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      analysisResult = {
        extractedText: parsed.extractedText || 'No text could be extracted',
        mathProblems: Array.isArray(parsed.mathProblems) ? parsed.mathProblems : [],
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 50,
        suggestedQuery: parsed.suggestedQuery || 'What is this math problem asking?',
      };
    } catch (parseError) {
      functions.logger.warn('Failed to parse JSON response, using fallback', { 
        content: content.substring(0, 200) 
      });
      
      // Fallback: extract what we can from the text response
      analysisResult = {
        extractedText: content,
        mathProblems: [{
          problem: content.substring(0, 200),
          type: 'unknown',
          difficulty: 'unknown',
        }],
        confidence: 30,
        suggestedQuery: 'Can you help me understand this math problem?',
      };
    }

    functions.logger.info('Image analysis completed', {
      problemsFound: analysisResult.mathProblems.length,
      confidence: analysisResult.confidence,
    });

    return analysisResult;
  } catch (error) {
    functions.logger.error('Error analyzing image:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to analyze image content'
    );
  }
}

/**
 * Convert image analysis result to a RAG query
 */
export function convertImageAnalysisToQuery(
  analysis: ImageAnalysisResult,
  userQuestion?: string
): string {
  if (userQuestion && userQuestion.trim()) {
    // If user provided a specific question, combine it with extracted content
    return `${userQuestion}\n\nMath content from image: ${analysis.extractedText}`;
  }

  // Use the suggested query if no user question provided
  if (analysis.suggestedQuery && analysis.extractedText) {
    return `${analysis.suggestedQuery}\n\nMath content: ${analysis.extractedText}`;
  }

  // Fallback to just the extracted text
  return analysis.extractedText || 'Please help me understand this math problem.';
}

/**
 * Determine the best query type based on image analysis
 */
export function determineQueryTypeFromImage(
  analysis: ImageAnalysisResult
): 'homework_help' | 'definition' | 'concept_exploration' | 'text' {
  if (analysis.mathProblems.length === 0) {
    return 'text';
  }

  // Check if it looks like homework (multiple problems, worksheets, etc.)
  const hasMultipleProblems = analysis.mathProblems.length > 1;
  const hasWordProblems = analysis.mathProblems.some(p => p.type === 'word_problem');
  const isHomeworkKeywords = analysis.extractedText.toLowerCase().includes('homework') ||
                            analysis.extractedText.toLowerCase().includes('worksheet') ||
                            analysis.extractedText.toLowerCase().includes('problem');

  if (hasMultipleProblems || hasWordProblems || isHomeworkKeywords) {
    return 'homework_help';
  }

  // Check if it's asking for definitions
  const isDefinitionKeywords = analysis.suggestedQuery.toLowerCase().includes('what is') ||
                              analysis.suggestedQuery.toLowerCase().includes('define') ||
                              analysis.suggestedQuery.toLowerCase().includes('meaning');

  if (isDefinitionKeywords) {
    return 'definition';
  }

  // Check if it's exploring concepts
  const isConceptKeywords = analysis.suggestedQuery.toLowerCase().includes('how') ||
                           analysis.suggestedQuery.toLowerCase().includes('why') ||
                           analysis.suggestedQuery.toLowerCase().includes('explain');

  if (isConceptKeywords) {
    return 'concept_exploration';
  }

  // Default to homework help for math problems
  return 'homework_help';
} 