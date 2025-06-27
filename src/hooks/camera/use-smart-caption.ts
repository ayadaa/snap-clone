import { useState, useCallback } from 'react';
import { generateSmartCaption, SmartCaptionRequest, SmartCaptionResponse } from '../../services/firebase/rag.service';

/**
 * Custom hook for smart caption generation
 * 
 * This hook manages the state and functionality for generating smart captions
 * from math images using the RAG system. It provides loading states, error handling,
 * and caption management.
 */

interface UseSmartCaptionState {
  isLoading: boolean;
  captions: string[];
  selectedCaption: string | null;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  detectedConcepts: string[];
  error: string | null;
}

interface UseSmartCaptionReturn extends UseSmartCaptionState {
  generateCaptions: (imageUrl: string, options?: Partial<SmartCaptionRequest>) => Promise<void>;
  selectCaption: (caption: string) => void;
  clearCaptions: () => void;
  refreshCaptions: () => Promise<void>;
}

export function useSmartCaption(): UseSmartCaptionReturn {
  const [state, setState] = useState<UseSmartCaptionState>({
    isLoading: false,
    captions: [],
    selectedCaption: null,
    difficulty: null,
    detectedConcepts: [],
    error: null,
  });

  const [lastRequest, setLastRequest] = useState<SmartCaptionRequest | null>(null);

  /**
   * Generate smart captions for an image
   */
  const generateCaptions = useCallback(async (
    imageUrl: string, 
    options: Partial<SmartCaptionRequest> = {}
  ) => {
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      captions: [],
      selectedCaption: null 
    }));

    try {
      const request: SmartCaptionRequest = {
        imageUrl,
        gradeLevel: options.gradeLevel || '9', // Default to 9th grade
        captionStyle: options.captionStyle || 'casual',
        includeHashtags: options.includeHashtags ?? true,
        includeEmojis: options.includeEmojis ?? true,
        ...options,
      };

      setLastRequest(request);

      const response: SmartCaptionResponse = await generateSmartCaption(request);

      setState(prev => ({
        ...prev,
        isLoading: false,
        captions: response.captions,
        difficulty: response.difficulty,
        detectedConcepts: response.detectedConcepts,
        error: null,
      }));

    } catch (error) {
      console.error('Error generating captions:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate captions',
      }));
    }
  }, []);

  /**
   * Select a specific caption
   */
  const selectCaption = useCallback((caption: string) => {
    setState(prev => ({
      ...prev,
      selectedCaption: caption,
    }));
  }, []);

  /**
   * Clear all captions and reset state
   */
  const clearCaptions = useCallback(() => {
    setState({
      isLoading: false,
      captions: [],
      selectedCaption: null,
      difficulty: null,
      detectedConcepts: [],
      error: null,
    });
    setLastRequest(null);
  }, []);

  /**
   * Refresh captions using the last request parameters
   */
  const refreshCaptions = useCallback(async () => {
    if (!lastRequest) {
      console.warn('No previous request to refresh');
      return;
    }

    await generateCaptions(lastRequest.imageUrl, lastRequest);
  }, [lastRequest, generateCaptions]);

  return {
    ...state,
    generateCaptions,
    selectCaption,
    clearCaptions,
    refreshCaptions,
  };
} 