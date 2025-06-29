/**
 * @fileoverview Visual Generation Service
 * 
 * This service handles the generation and management of visual representations
 * for mathematical concepts using Firebase Cloud Functions.
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from '../../config/firebase';

/**
 * Interface for visual generation requests
 */
export interface VisualGenerationRequest {
  concept: string;
  gradeLevel?: string;
  visualType?: 'diagram' | 'graph' | 'chart' | 'geometric' | 'auto';
  style?: 'simple' | 'detailed' | 'interactive';
}

/**
 * Interface for visual generation response
 */
export interface VisualGenerationResponse {
  success: boolean;
  visual?: {
    type: 'svg' | 'html' | 'description';
    content: string;
    title: string;
    description: string;
    interactiveElements?: string[];
  };
  error?: string;
}

/**
 * Generate visual representation for a mathematical concept
 */
export async function generateVisualRepresentation(
  request: VisualGenerationRequest
): Promise<VisualGenerationResponse> {
  try {
    console.log('🎨 Generating visual for:', request);
    
    const generateVisual = httpsCallable<VisualGenerationRequest, VisualGenerationResponse>(
      functions,
      'generateVisualRepresentation'
    );

    console.log('📞 Calling Firebase function...');
    const result = await generateVisual(request);
    
    console.log('✅ Firebase function response:', result);
    
    if (!result.data) {
      console.error('❌ No data in Firebase function response');
      return {
        success: false,
        error: 'No data returned from Firebase function'
      };
    }

    return result.data;
  } catch (error) {
    console.error('❌ Error generating visual representation:', error);
    
    // Log more details about the error
    if (error && typeof error === 'object') {
      console.error('Error details:', {
        message: (error as any).message,
        code: (error as any).code,
        details: (error as any).details,
        stack: (error as any).stack
      });
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate visual representation'
    };
  }
}

/**
 * Validate SVG content for security
 */
export function validateSVGContent(svgContent: string): boolean {
  // Basic validation to ensure it's SVG and doesn't contain malicious content
  if (!svgContent.includes('<svg')) {
    return false;
  }

  // Check for potentially dangerous elements
  const dangerousElements = ['script', 'object', 'embed', 'iframe', 'link'];
  const lowerContent = svgContent.toLowerCase();
  
  for (const element of dangerousElements) {
    if (lowerContent.includes(`<${element}`)) {
      return false;
    }
  }

  return true;
}

/**
 * Extract dimensions from SVG content
 */
export function extractSVGDimensions(svgContent: string): { width: number; height: number } | null {
  const widthMatch = svgContent.match(/width=['"](\d+)['"]/) || svgContent.match(/width=(\d+)/);
  const heightMatch = svgContent.match(/height=['"](\d+)['"]/) || svgContent.match(/height=(\d+)/);

  if (widthMatch && heightMatch) {
    return {
      width: parseInt(widthMatch[1], 10),
      height: parseInt(heightMatch[1], 10)
    };
  }

  return null;
} 