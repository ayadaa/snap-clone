import { useState, useCallback, useRef } from 'react';

/**
 * Hook for managing snap editing functionality.
 * Handles text overlays, drawing paths, timer settings, and editor state.
 * Provides methods for adding, updating, and removing editing elements.
 */

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
  rotation?: number;
}

export interface DrawingPath {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  strokeWidth: number;
}

export interface SnapEditorState {
  textOverlays: TextOverlay[];
  drawingPaths: DrawingPath[];
  timerDuration: number; // For photos only (1-10 seconds)
  activeTextId: string | null;
  isDrawingMode: boolean;
  selectedColor: string;
  strokeWidth: number;
}

const AVAILABLE_COLORS = [
  '#FFFFFF', // White
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
];

const DEFAULT_TIMER_DURATION = 3; // 3 seconds default

export function useSnapEditor() {
  const [editorState, setEditorState] = useState<SnapEditorState>({
    textOverlays: [],
    drawingPaths: [],
    timerDuration: DEFAULT_TIMER_DURATION,
    activeTextId: null,
    isDrawingMode: false,
    selectedColor: AVAILABLE_COLORS[0],
    strokeWidth: 5,
  });

  const currentPathRef = useRef<DrawingPath | null>(null);
  const isDrawingModeRef = useRef(false);

  /**
   * Add a new text overlay at specified position
   */
  const addTextOverlay = useCallback((x: number, y: number, initialText = 'Tap to edit') => {
    const newOverlay: TextOverlay = {
      id: `text_${Date.now()}`,
      text: initialText,
      x,
      y,
      color: editorState.selectedColor,
      fontSize: 24,
      rotation: 0,
    };

    setEditorState(prev => ({
      ...prev,
      textOverlays: [...prev.textOverlays, newOverlay],
      activeTextId: newOverlay.id,
    }));

    return newOverlay.id;
  }, [editorState.selectedColor]);

  /**
   * Update text overlay properties
   */
  const updateTextOverlay = useCallback((id: string, updates: Partial<TextOverlay>) => {
    setEditorState(prev => ({
      ...prev,
      textOverlays: prev.textOverlays.map(overlay =>
        overlay.id === id ? { ...overlay, ...updates } : overlay
      ),
    }));
  }, []);

  /**
   * Remove text overlay by ID
   */
  const removeTextOverlay = useCallback((id: string) => {
    setEditorState(prev => ({
      ...prev,
      textOverlays: prev.textOverlays.filter(overlay => overlay.id !== id),
      activeTextId: prev.activeTextId === id ? null : prev.activeTextId,
    }));
  }, []);

  /**
   * Set active text overlay for editing
   */
  const setActiveText = useCallback((id: string | null) => {
    setEditorState(prev => ({
      ...prev,
      activeTextId: id,
    }));
  }, []);

  /**
   * Start drawing mode
   */
  const startDrawingMode = useCallback(() => {
    console.log('Starting drawing mode');
    isDrawingModeRef.current = true;
    setEditorState(prev => ({
      ...prev,
      isDrawingMode: true,
      activeTextId: null, // Deselect any active text
    }));
  }, []);

  /**
   * Exit drawing mode
   */
  const exitDrawingMode = useCallback(() => {
    console.log('Exiting drawing mode');
    isDrawingModeRef.current = false;
    setEditorState(prev => ({
      ...prev,
      isDrawingMode: false,
    }));
    currentPathRef.current = null;
  }, []);

  /**
   * Start a new drawing path
   */
  const startDrawingPath = useCallback((x: number, y: number) => {
    console.log('startDrawingPath called with:', x, y, 'isDrawingMode:', isDrawingModeRef.current);
    
    if (!isDrawingModeRef.current) {
      console.log('Not in drawing mode, skipping');
      return;
    }

    setEditorState(prev => {
      const newPath: DrawingPath = {
        id: `path_${Date.now()}`,
        points: [{ x, y }],
        color: prev.selectedColor,
        strokeWidth: prev.strokeWidth,
      };

      console.log('Creating new path:', newPath);
      currentPathRef.current = newPath;
      
      const newState = {
        ...prev,
        drawingPaths: [...prev.drawingPaths, newPath],
      };
      console.log('Updated drawing paths count:', newState.drawingPaths.length);
      return newState;
    });
  }, []);

  /**
   * Add point to current drawing path
   */
  const addPointToPath = useCallback((x: number, y: number) => {
    if (!currentPathRef.current || !isDrawingModeRef.current) {
      console.log('No current path to add point to or not in drawing mode');
      return;
    }

    const pathId = currentPathRef.current.id;
    console.log('Adding point to path:', pathId, 'at:', x, y);
    
    setEditorState(prev => ({
      ...prev,
      drawingPaths: prev.drawingPaths.map(path =>
        path.id === pathId
          ? { ...path, points: [...path.points, { x, y }] }
          : path
      ),
    }));
  }, []);

  /**
   * Finish current drawing path
   */
  const finishDrawingPath = useCallback(() => {
    console.log('Finishing drawing path');
    currentPathRef.current = null;
  }, []);

  /**
   * Remove drawing path by ID
   */
  const removeDrawingPath = useCallback((id: string) => {
    setEditorState(prev => ({
      ...prev,
      drawingPaths: prev.drawingPaths.filter(path => path.id !== id),
    }));
  }, []);

  /**
   * Clear all drawing paths
   */
  const clearAllDrawing = useCallback(() => {
    setEditorState(prev => ({
      ...prev,
      drawingPaths: [],
    }));
    currentPathRef.current = null;
  }, []);

  /**
   * Set selected color for new text/drawing
   */
  const setSelectedColor = useCallback((color: string) => {
    setEditorState(prev => ({
      ...prev,
      selectedColor: color,
    }));
  }, []);

  /**
   * Set stroke width for drawing
   */
  const setStrokeWidth = useCallback((width: number) => {
    setEditorState(prev => ({
      ...prev,
      strokeWidth: Math.max(1, Math.min(20, width)), // Clamp between 1-20
    }));
  }, []);

  /**
   * Set timer duration for photo snaps (1-10 seconds)
   */
  const setTimerDuration = useCallback((duration: number) => {
    setEditorState(prev => ({
      ...prev,
      timerDuration: Math.max(1, Math.min(10, duration)), // Clamp between 1-10
    }));
  }, []);

  /**
   * Clear all editing elements
   */
  const clearAll = useCallback(() => {
    setEditorState(prev => ({
      ...prev,
      textOverlays: [],
      drawingPaths: [],
      activeTextId: null,
    }));
    currentPathRef.current = null;
  }, []);

  /**
   * Reset editor to default state
   */
  const reset = useCallback(() => {
    setEditorState({
      textOverlays: [],
      drawingPaths: [],
      timerDuration: DEFAULT_TIMER_DURATION,
      activeTextId: null,
      isDrawingMode: false,
      selectedColor: AVAILABLE_COLORS[0],
      strokeWidth: 5,
    });
    currentPathRef.current = null;
  }, []);

  /**
   * Get available colors for UI
   */
  const getAvailableColors = useCallback(() => AVAILABLE_COLORS, []);

  /**
   * Check if editor has any content
   */
  const hasContent = useCallback(() => {
    return editorState.textOverlays.length > 0 || editorState.drawingPaths.length > 0;
  }, [editorState.textOverlays.length, editorState.drawingPaths.length]);

  /**
   * Check if currently in drawing mode (using ref for real-time value)
   */
  const isCurrentlyDrawing = useCallback(() => {
    return isDrawingModeRef.current;
  }, []);

  return {
    // State
    editorState,
    
    // Text overlay methods
    addTextOverlay,
    updateTextOverlay,
    removeTextOverlay,
    setActiveText,
    
    // Drawing methods
    startDrawingMode,
    exitDrawingMode,
    startDrawingPath,
    addPointToPath,
    finishDrawingPath,
    removeDrawingPath,
    clearAllDrawing,
    isCurrentlyDrawing,
    
    // Settings
    setSelectedColor,
    setStrokeWidth,
    setTimerDuration,
    getAvailableColors,
    
    // Utility methods
    clearAll,
    reset,
    hasContent,
  };
} 