/**
 * @fileoverview Visual Generation Hook
 * 
 * This hook manages the generation and state of visual representations
 * for mathematical concepts, providing loading states and error handling.
 */

import { useState, useCallback } from 'react';
import { 
  generateVisualRepresentation, 
  VisualGenerationRequest, 
  VisualGenerationResponse 
} from '../../services/firebase/visual.service';

/**
 * Hook for managing visual generation state and operations
 */
export function useVisualGeneration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentVisual, setCurrentVisual] = useState<VisualGenerationResponse['visual'] | null>(null);

  /**
   * Generate a visual representation for a concept
   */
  const generateVisual = useCallback(async (request: VisualGenerationRequest) => {
    try {
      console.log('🚀 Starting visual generation:', request);
      setIsLoading(true);
      setError(null);
      setCurrentVisual(null);

      const response = await generateVisualRepresentation(request);
      console.log('📋 Visual generation response:', response);

      if (response.success && response.visual) {
        console.log('✅ Visual generated successfully');
        setCurrentVisual(response.visual);
        return response.visual;
      } else {
        const errorMessage = response.error || 'Failed to generate visual representation';
        console.error('❌ Visual generation failed:', errorMessage);
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('💥 Exception in visual generation:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear current visual and error state
   */
  const clearVisual = useCallback(() => {
    setCurrentVisual(null);
    setError(null);
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setCurrentVisual(null);
  }, []);

  return {
    // State
    isLoading,
    error,
    currentVisual,
    
    // Actions
    generateVisual,
    clearVisual,
    reset,
  };
} 