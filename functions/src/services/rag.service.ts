/**
 * @fileoverview RAG (Retrieval-Augmented Generation) service for Snap Factor
 * 
 * This service handles the core RAG functionality including:
 * - OpenAI API interactions for embeddings and completions
 * - Pinecone vector database queries for relevant content retrieval
 * - Math textbook content processing and analysis
 */

import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import * as functions from 'firebase-functions';
import { defineSecret } from 'firebase-functions/params';

// Define secrets
const openaiApiKey = defineSecret('OPENAI_API_KEY');
const pineconeApiKey = defineSecret('PINECONE_API_KEY');

/**
 * Get OpenAI client instance
 */
function getOpenAIClient(): OpenAI {
  return new OpenAI({
    apiKey: openaiApiKey.value(),
  });
}

/**
 * Get Pinecone client instance
 */
function getPineconeClient(): Pinecone {
  return new Pinecone({
    apiKey: pineconeApiKey.value(),
  });
}

/**
 * Interface for RAG query requests
 */
export interface RagQueryRequest {
  query: string;
  queryType: 'text' | 'homework_help' | 'definition' | 'concept_exploration';
  gradeLevel?: string;
  includeExamples?: boolean;
}

/**
 * Interface for RAG response with citations
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
}

/**
 * Create embedding for a text query using OpenAI
 */
async function createEmbedding(text: string): Promise<number[]> {
  try {
    const openai = getOpenAIClient();
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    });

    return response.data[0].embedding;
  } catch (error) {
    functions.logger.error('Error creating embedding:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to create embedding for query'
    );
  }
}

/**
 * Query Pinecone for relevant textbook content
 */
async function queryVectorDatabase(
  embedding: number[],
  topK: number = 5
): Promise<any[]> {
  try {
    const pc = getPineconeClient();
    const queryResponse = await pc.Index('k12-math-textbooks').query({
      vector: embedding,
      topK,
      includeMetadata: true,
      includeValues: false,
    });

    return queryResponse.matches || [];
  } catch (error) {
    functions.logger.error('Error querying Pinecone:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to retrieve relevant content'
    );
  }
}

/**
 * Generate AI explanation using retrieved context
 */
async function generateExplanation(
  query: string,
  context: any[],
  queryType: string,
  gradeLevel?: string
): Promise<{ explanation: string; confidence: number }> {
  try {
    // Build context string from retrieved chunks
    const contextString = context
      .map((match, index) => {
        const metadata = match.metadata || {};
        return `Context ${index + 1} (Relevance: ${(match.score * 100).toFixed(1)}%):
Book: ${metadata.book || 'Unknown'}
Chapter: ${metadata.chapter || 'N/A'}
Section: ${metadata.section || 'N/A'}
Content: ${metadata.text || 'No content available'}

---`;
      })
      .join('\n');

    // Create specialized prompts based on query type
    const systemPrompts = {
      homework_help: `You are a friendly and encouraging math tutor for K-12 students. A student needs help with their homework. Provide a clear, step-by-step explanation that helps them understand the concept without just giving the answer. Always encourage learning and understanding over memorization.`,
      
      definition: `You are a math teacher explaining concepts to K-12 students. Provide clear, age-appropriate definitions with simple examples. Make complex concepts accessible and engaging.`,
      
      concept_exploration: `You are an enthusiastic math educator helping students explore mathematical concepts. Provide comprehensive explanations with examples, visual descriptions, and connections to real-world applications.`,
      
      text: `You are a helpful math assistant for K-12 students. Provide clear, accurate explanations tailored to the student's level of understanding.`
    };

    const gradeContext = gradeLevel 
      ? `The student is in ${gradeLevel}. Adjust your explanation to be appropriate for this grade level.`
      : 'Adjust your explanation to be appropriate for K-12 students.';

    const prompt = `${systemPrompts[queryType as keyof typeof systemPrompts] || systemPrompts.text}

${gradeContext}

Student's Question: "${query}"

Using the following context from mathematics textbooks, provide a helpful response. Always cite your sources at the end of your explanation using the format: "Source: [Book Name], Chapter [X]"

Context from textbooks:
${contextString}

Important guidelines:
1. Be encouraging and supportive
2. Explain step-by-step when appropriate
3. Use simple language appropriate for the grade level
4. Include citations for your sources
5. If the context doesn't fully answer the question, acknowledge this and provide what help you can
6. For homework help, guide the student to the answer rather than giving it directly

Response:`;

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful math tutor. Always be encouraging and educational.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const explanation = completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response.';
    
    // Calculate confidence based on relevance scores
    const avgRelevance = context.length > 0 
      ? context.reduce((sum, match) => sum + (match.score || 0), 0) / context.length
      : 0;
    
    const confidence = Math.min(avgRelevance * 100, 95); // Cap at 95%

    return { explanation, confidence };
  } catch (error) {
    functions.logger.error('Error generating explanation:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to generate explanation'
    );
  }
}

/**
 * Extract source information from context matches
 */
function extractSources(context: any[]): RagResponse['sources'] {
  return context.map(match => {
    const metadata = match.metadata || {};
    return {
      book: metadata.book || 'Unknown Source',
      chapter: metadata.chapter,
      section: metadata.section,
      relevanceScore: Math.round((match.score || 0) * 100),
    };
  });
}

/**
 * Main RAG query processing function
 */
export async function processRagQuery(request: RagQueryRequest): Promise<RagResponse> {
  functions.logger.info('Processing RAG query:', { 
    queryType: request.queryType,
    queryLength: request.query.length 
  });

  try {
    // Step 1: Create embedding for the query
    const embedding = await createEmbedding(request.query);

    // Step 2: Query vector database for relevant content
    const context = await queryVectorDatabase(embedding, 5);

    if (context.length === 0) {
      functions.logger.warn('No relevant content found for query');
      return {
        explanation: "I couldn't find specific information about your question in the available textbooks. Could you try rephrasing your question or being more specific about the math topic you need help with?",
        sources: [],
        confidence: 0,
      };
    }

    // Step 3: Generate explanation using retrieved context
    const { explanation, confidence } = await generateExplanation(
      request.query,
      context,
      request.queryType,
      request.gradeLevel
    );

    // Step 4: Extract source citations
    const sources = extractSources(context);

    // Step 5: Generate suggested actions based on query type
    const suggestedActions = generateSuggestedActions(request.queryType, request.query);

    const response: RagResponse = {
      explanation,
      sources,
      suggestedActions,
      confidence,
    };

    functions.logger.info('RAG query processed successfully', {
      sourcesFound: sources.length,
      confidence: confidence.toFixed(1)
    });

    return response;
  } catch (error) {
    functions.logger.error('Error in RAG query processing:', error);
    throw error; // Re-throw the error to be handled by the calling function
  }
}

/**
 * Generate suggested follow-up actions based on query type
 */
function generateSuggestedActions(
  queryType: string,
  query: string
): RagResponse['suggestedActions'] {
  const actions: RagResponse['suggestedActions'] = [];

  switch (queryType) {
    case 'homework_help':
      actions.push({
        type: 'practice_problem',
        description: 'Try a similar practice problem',
      });
      actions.push({
        type: 'related_concept',
        description: 'Explore related concepts',
      });
      break;

    case 'definition':
      actions.push({
        type: 'related_concept',
        description: 'See how this concept is used',
      });
      actions.push({
        type: 'visual_aid',
        description: 'View visual examples',
      });
      break;

    case 'concept_exploration':
      actions.push({
        type: 'practice_problem',
        description: 'Practice with examples',
      });
      actions.push({
        type: 'visual_aid',
        description: 'See visual representations',
      });
      break;
  }

  return actions;
} 