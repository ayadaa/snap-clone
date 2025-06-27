/**
 * @fileoverview Redux slice for RAG (Retrieval-Augmented Generation) state management
 * 
 * This slice manages state for all RAG-related features including:
 * - Definition lookups
 * - Concept exploration
 * - Math explanations
 * - Image analysis
 * - Loading and error states
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  getDefinition,
  exploreConcept,
  getMathExplanation,
  analyzeMathSnap,
  checkRagHealth,
  DefinitionRequest,
  ConceptRequest,
  MathHelpRequest,
  ImageAnalysisRequest,
  ExtendedRagResponse,
} from '../../services/firebase/rag.service';

/**
 * Interface for RAG request history
 */
interface RagHistoryItem {
  id: string;
  type: 'definition' | 'concept' | 'explanation' | 'image_analysis';
  query: string;
  response: ExtendedRagResponse;
  timestamp: number;
  gradeLevel?: string;
}

/**
 * Interface for RAG slice state
 */
interface RagState {
  // Current operation state
  isLoading: boolean;
  error: string | null;
  
  // Current responses
  currentDefinition: ExtendedRagResponse | null;
  currentConcept: ExtendedRagResponse | null;
  currentExplanation: ExtendedRagResponse | null;
  currentImageAnalysis: ExtendedRagResponse | null;
  
  // User preferences
  userGradeLevel: string;
  preferredDepth: 'basic' | 'intermediate' | 'advanced';
  
  // History and favorites
  history: RagHistoryItem[];
  favorites: RagHistoryItem[];
  
  // System health
  systemHealth: {
    status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
    lastChecked: number | null;
    confidence: number;
  };
  
  // UI state
  activeMode: 'definition' | 'concept' | 'explanation' | 'image' | null;
  showSources: boolean;
  showHistory: boolean;
}

/**
 * Initial state for RAG slice
 */
const initialState: RagState = {
  isLoading: false,
  error: null,
  currentDefinition: null,
  currentConcept: null,
  currentExplanation: null,
  currentImageAnalysis: null,
  userGradeLevel: 'general',
  preferredDepth: 'intermediate',
  history: [],
  favorites: [],
  systemHealth: {
    status: 'unknown',
    lastChecked: null,
    confidence: 0,
  },
  activeMode: null,
  showSources: true,
  showHistory: false,
};

/**
 * Async thunk for getting definitions
 */
export const fetchDefinition = createAsyncThunk(
  'rag/fetchDefinition',
  async (request: DefinitionRequest, { rejectWithValue }) => {
    try {
      const response = await getDefinition(request);
      return { request, response };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to get definition');
    }
  }
);

/**
 * Async thunk for exploring concepts
 */
export const fetchConcept = createAsyncThunk(
  'rag/fetchConcept',
  async (request: ConceptRequest, { rejectWithValue }) => {
    try {
      const response = await exploreConcept(request);
      return { request, response };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to explore concept');
    }
  }
);

/**
 * Async thunk for getting math explanations
 */
export const fetchMathExplanation = createAsyncThunk(
  'rag/fetchMathExplanation',
  async (request: MathHelpRequest, { rejectWithValue }) => {
    try {
      const response = await getMathExplanation(request);
      return { request, response };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to get explanation');
    }
  }
);

/**
 * Async thunk for analyzing math images
 */
export const fetchImageAnalysis = createAsyncThunk(
  'rag/fetchImageAnalysis',
  async (request: ImageAnalysisRequest, { rejectWithValue }) => {
    try {
      const response = await analyzeMathSnap(request);
      return { request, response };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to analyze image');
    }
  }
);

/**
 * Async thunk for checking system health
 */
export const fetchSystemHealth = createAsyncThunk(
  'rag/fetchSystemHealth',
  async (_, { rejectWithValue }) => {
    try {
      const health = await checkRagHealth();
      return health;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to check system health');
    }
  }
);

/**
 * RAG Redux slice
 */
const ragSlice = createSlice({
  name: 'rag',
  initialState,
  reducers: {
    // Clear current responses
    clearCurrentResponses: (state) => {
      state.currentDefinition = null;
      state.currentConcept = null;
      state.currentExplanation = null;
      state.currentImageAnalysis = null;
      state.error = null;
    },
    
    // Set active mode
    setActiveMode: (state, action: PayloadAction<RagState['activeMode']>) => {
      state.activeMode = action.payload;
    },
    
    // Update user preferences
    setUserGradeLevel: (state, action: PayloadAction<string>) => {
      state.userGradeLevel = action.payload;
    },
    
    setPreferredDepth: (state, action: PayloadAction<'basic' | 'intermediate' | 'advanced'>) => {
      state.preferredDepth = action.payload;
    },
    
    // Toggle UI states
    toggleShowSources: (state) => {
      state.showSources = !state.showSources;
    },
    
    toggleShowHistory: (state) => {
      state.showHistory = !state.showHistory;
    },
    
    // History management
    addToFavorites: (state, action: PayloadAction<string>) => {
      const historyItem = state.history.find(item => item.id === action.payload);
      if (historyItem && !state.favorites.find(fav => fav.id === historyItem.id)) {
        state.favorites.push(historyItem);
      }
    },
    
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter(item => item.id !== action.payload);
    },
    
    clearHistory: (state) => {
      state.history = [];
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Definition requests
    builder
      .addCase(fetchDefinition.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.activeMode = 'definition';
      })
      .addCase(fetchDefinition.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDefinition = action.payload.response;
        
        // Add to history
        const historyItem: RagHistoryItem = {
          id: Date.now().toString(),
          type: 'definition',
          query: action.payload.request.term,
          response: action.payload.response,
          timestamp: Date.now(),
          gradeLevel: action.payload.request.gradeLevel,
        };
        state.history.unshift(historyItem);
        
        // Keep only last 50 items in history
        if (state.history.length > 50) {
          state.history = state.history.slice(0, 50);
        }
      })
      .addCase(fetchDefinition.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.currentDefinition = null;
      });

    // Concept exploration requests
    builder
      .addCase(fetchConcept.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.activeMode = 'concept';
      })
      .addCase(fetchConcept.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentConcept = action.payload.response;
        
        // Add to history
        const historyItem: RagHistoryItem = {
          id: Date.now().toString(),
          type: 'concept',
          query: action.payload.request.concept,
          response: action.payload.response,
          timestamp: Date.now(),
          gradeLevel: action.payload.request.gradeLevel,
        };
        state.history.unshift(historyItem);
        
        if (state.history.length > 50) {
          state.history = state.history.slice(0, 50);
        }
      })
      .addCase(fetchConcept.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.currentConcept = null;
      });

    // Math explanation requests
    builder
      .addCase(fetchMathExplanation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.activeMode = 'explanation';
      })
      .addCase(fetchMathExplanation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentExplanation = action.payload.response;
        
        // Add to history
        const historyItem: RagHistoryItem = {
          id: Date.now().toString(),
          type: 'explanation',
          query: action.payload.request.query,
          response: action.payload.response,
          timestamp: Date.now(),
          gradeLevel: action.payload.request.gradeLevel,
        };
        state.history.unshift(historyItem);
        
        if (state.history.length > 50) {
          state.history = state.history.slice(0, 50);
        }
      })
      .addCase(fetchMathExplanation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.currentExplanation = null;
      });

    // Image analysis requests
    builder
      .addCase(fetchImageAnalysis.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.activeMode = 'image';
      })
      .addCase(fetchImageAnalysis.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentImageAnalysis = action.payload.response;
        
        // Add to history
        const historyItem: RagHistoryItem = {
          id: Date.now().toString(),
          type: 'image_analysis',
          query: action.payload.response.imageAnalysis?.suggestedQuery || 'Image Analysis',
          response: action.payload.response,
          timestamp: Date.now(),
          gradeLevel: action.payload.request.gradeLevel,
        };
        state.history.unshift(historyItem);
        
        if (state.history.length > 50) {
          state.history = state.history.slice(0, 50);
        }
      })
      .addCase(fetchImageAnalysis.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.currentImageAnalysis = null;
      });

    // System health requests
    builder
      .addCase(fetchSystemHealth.fulfilled, (state, action) => {
        state.systemHealth = {
          status: action.payload.status,
          lastChecked: Date.now(),
          confidence: action.payload.confidence,
        };
      })
      .addCase(fetchSystemHealth.rejected, (state) => {
        state.systemHealth = {
          status: 'unhealthy',
          lastChecked: Date.now(),
          confidence: 0,
        };
      });
  },
});

// Export actions
export const {
  clearCurrentResponses,
  setActiveMode,
  setUserGradeLevel,
  setPreferredDepth,
  toggleShowSources,
  toggleShowHistory,
  addToFavorites,
  removeFromFavorites,
  clearHistory,
  clearError,
} = ragSlice.actions;

// Export selectors
export const selectRagState = (state: { rag: RagState }) => state.rag;
export const selectIsLoading = (state: { rag: RagState }) => state.rag.isLoading;
export const selectError = (state: { rag: RagState }) => state.rag.error;
export const selectCurrentDefinition = (state: { rag: RagState }) => state.rag.currentDefinition;
export const selectCurrentConcept = (state: { rag: RagState }) => state.rag.currentConcept;
export const selectCurrentExplanation = (state: { rag: RagState }) => state.rag.currentExplanation;
export const selectCurrentImageAnalysis = (state: { rag: RagState }) => state.rag.currentImageAnalysis;
export const selectUserGradeLevel = (state: { rag: RagState }) => state.rag.userGradeLevel;
export const selectHistory = (state: { rag: RagState }) => state.rag.history;
export const selectFavorites = (state: { rag: RagState }) => state.rag.favorites;
export const selectSystemHealth = (state: { rag: RagState }) => state.rag.systemHealth;
export const selectActiveMode = (state: { rag: RagState }) => state.rag.activeMode;

export default ragSlice.reducer; 