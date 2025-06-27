import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  PanResponder,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useSnapEditor } from '../../hooks/camera/use-snap-editor';
import { TextOverlay } from './TextOverlay';
import { SmartCaptionModal } from './SmartCaptionModal';
import { Video, ResizeMode } from 'expo-av';
import { captureRef } from 'react-native-view-shot';

/**
 * Main snap editor component that combines all editing tools.
 * Provides text overlay, drawing, timer settings, and color palette.
 * Features glassmorphic UI design with intuitive controls.
 * Captures composite view with overlays for sending/posting.
 */

interface SnapEditorProps {
  mediaUri: string;
  mediaType: 'photo' | 'video';
  onSave: (editedData: any) => void;
  onCancel: () => void;
  onNext: (editedData: { 
    originalMediaUri: string;
    compositeMediaUri: string;
    hasText?: boolean; 
    hasDrawing?: boolean; 
    duration?: number;
    textOverlays: any[];
    drawingPaths: any[];
  }) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function SnapEditor({
  mediaUri,
  mediaType,
  onSave,
  onCancel,
  onNext,
}: SnapEditorProps) {
  const {
    editorState,
    addTextOverlay,
    updateTextOverlay,
    removeTextOverlay,
    setActiveText,
    startDrawingMode,
    exitDrawingMode,
    startDrawingPath,
    addPointToPath,
    finishDrawingPath,
    clearAllDrawing,
    setSelectedColor,
    setTimerDuration,
    getAvailableColors,
    isCurrentlyDrawing,
    hasContent,
  } = useSnapEditor();

  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showTimerSettings, setShowTimerSettings] = useState(false);
  const [currentTool, setCurrentTool] = useState<'text' | 'draw' | null>('text'); // Default to text tool
  const [showSmartCaptionModal, setShowSmartCaptionModal] = useState(false);
  const [selectedCaption, setSelectedCaption] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const drawingViewRef = useRef<View>(null);
  const mediaContainerRef = useRef<View>(null);

  /**
   * Pan responder for drawing functionality
   */
  const drawingPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (event) => {
        const isDrawing = isCurrentlyDrawing();
        console.log('onStartShouldSetPanResponder called, isDrawingMode:', isDrawing);
        return isDrawing;
      },
      onMoveShouldSetPanResponder: (event) => {
        const isDrawing = isCurrentlyDrawing();
        console.log('onMoveShouldSetPanResponder called, isDrawingMode:', isDrawing);
        return isDrawing;
      },
      onPanResponderGrant: (event) => {
        console.log('onPanResponderGrant called');
        if (isCurrentlyDrawing()) {
          const { locationX, locationY } = event.nativeEvent;
          console.log('Starting drawing at:', locationX, locationY);
          startDrawingPath(locationX, locationY);
        }
      },
      onPanResponderMove: (event) => {
        if (isCurrentlyDrawing()) {
          const { locationX, locationY } = event.nativeEvent;
          console.log('Drawing move to:', locationX, locationY);
          addPointToPath(locationX, locationY);
        }
      },
      onPanResponderRelease: () => {
        console.log('onPanResponderRelease called');
        if (isCurrentlyDrawing()) {
          console.log('Finishing drawing path');
          finishDrawingPath();
        }
      },
      onPanResponderTerminate: () => {
        console.log('onPanResponderTerminate called');
        if (isCurrentlyDrawing()) {
          console.log('Drawing terminated');
          finishDrawingPath();
        }
      },
    })
  ).current;

  /**
   * Handle adding text overlay at touch position
   */
  const handleAddText = (event: any) => {
    if (currentTool === 'text' && !editorState.activeTextId) {
      const { locationX, locationY } = event.nativeEvent;
      addTextOverlay(locationX, locationY);
    }
  };

  /**
   * Toggle to text mode
   */
  const enableTextMode = () => {
    setCurrentTool('text');
    if (editorState.isDrawingMode) {
      exitDrawingMode();
    }
    setActiveText(null); // Deselect any active text
  };

  /**
   * Toggle drawing mode
   */
  const toggleDrawingMode = () => {
    if (editorState.isDrawingMode) {
      exitDrawingMode();
      setCurrentTool('text'); // Switch back to text mode
    } else {
      startDrawingMode();
      setCurrentTool('draw');
      setActiveText(null); // Deselect any active text
    }
  };

  /**
   * Convert drawing paths to SVG path data
   */
  const pathToSvgData = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    
    let pathData = `M${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathData += ` L${points[i].x},${points[i].y}`;
    }
    return pathData;
  };

  /**
   * Alternative method to create composite image when view capture fails
   * This creates a simple overlay notification instead of trying to burn overlays into image
   */
  const createCompositeAlternative = async (): Promise<string> => {
    // For now, if view capture fails, we'll just use the original image
    // and pass the overlay data separately so the receiving end can render them
    console.log('Using alternative composite method - original image with overlay metadata');
    return mediaUri;
  };

  /**
   * Capture the composite view with overlays
   */
  const captureCompositeView = async (): Promise<string> => {
    if (!mediaContainerRef.current) {
      console.warn('Media container ref not available, using alternative method');
      return await createCompositeAlternative();
    }

    try {
      setIsCapturing(true);
      
      // Wait a brief moment to ensure the view is fully rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Capture the view with overlays
      const uri = await captureRef(mediaContainerRef.current, {
        format: 'jpg',
        quality: 0.9,
        result: 'tmpfile',
        width: screenWidth,
        height: screenHeight,
      });

      console.log('Composite view captured successfully:', uri);
      return uri;
    } catch (error) {
      console.error('View capture failed, using alternative method:', error);
      // If capture fails, use alternative method
      return await createCompositeAlternative();
    } finally {
      setIsCapturing(false);
    }
  };

  /**
   * Handle save and prepare edited data
   */
  const handleSave = () => {
    const editedData = {
      mediaUri,
      mediaType,
      textOverlays: editorState.textOverlays,
      drawingPaths: editorState.drawingPaths,
      timerDuration: editorState.timerDuration,
      hasEdits: hasContent(),
    };
    onSave(editedData);
  };

  /**
   * Handle next action with composite image capture
   */
  const handleNext = async () => {
    try {
      setIsCapturing(true);

      let compositeMediaUri = mediaUri; // Default to original

      // Only capture composite if there are overlays
      if (hasContent()) {
        try {
          compositeMediaUri = await captureCompositeView();
        } catch (captureError) {
          console.warn('View capture failed, using original media:', captureError);
          // Continue with original media URI - don't block the user
        }
      }

      const editedData = {
        originalMediaUri: mediaUri,
        compositeMediaUri,
        hasText: editorState.textOverlays.length > 0,
        hasDrawing: editorState.drawingPaths.length > 0,
        duration: editorState.timerDuration,
        textOverlays: editorState.textOverlays,
        drawingPaths: editorState.drawingPaths,
      };

      onNext(editedData);
    } catch (error) {
      console.error('Error preparing snap for sending:', error);
      Alert.alert(
        'Error',
        'Failed to prepare your snap. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCapturing(false);
    }
  };

  /**
   * Handle smart caption selection
   */
  const handleCaptionSelect = (caption: string) => {
    setSelectedCaption(caption);
    // Add the caption as a text overlay at the bottom center
    addTextOverlay(screenWidth / 2, screenHeight * 0.8, caption);
  };

  /**
   * Open smart caption modal
   */
  const openSmartCaptionModal = () => {
    setShowSmartCaptionModal(true);
  };

  return (
    <View style={styles.container}>
      {/* Media Display */}
      <View 
        ref={mediaContainerRef} 
        style={[styles.mediaContainer, { width: screenWidth, height: screenHeight }]}
        collapsable={false}
      >
        {mediaType === 'photo' ? (
          <Image source={{ uri: mediaUri }} style={styles.media} resizeMode="cover" />
        ) : (
          <Video
            source={{ uri: mediaUri }}
            style={styles.media}
            resizeMode={ResizeMode.COVER}
            shouldPlay={true}
            isLooping={true}
            isMuted={false}
          />
        )}
        
        {/* Drawing and Text Overlay Container */}
        <View
          ref={drawingViewRef}
          style={styles.overlayContainer}
          {...drawingPanResponder.panHandlers}
        >
          {/* Touch handler for text when in text mode */}
          {currentTool === 'text' && (
            <View
              style={StyleSheet.absoluteFillObject}
              onTouchStart={handleAddText}
              pointerEvents={editorState.activeTextId ? 'none' : 'auto'}
            />
          )}
          
          {/* Drawing Paths */}
          {editorState.drawingPaths.length > 0 && (
            <Svg style={StyleSheet.absoluteFillObject} pointerEvents="none">
              {editorState.drawingPaths.map((path) => (
                <Path
                  key={path.id}
                  d={pathToSvgData(path.points)}
                  stroke={path.color}
                  strokeWidth={path.strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
            </Svg>
          )}

          {/* Text Overlays */}
          {editorState.textOverlays.map((overlay) => (
            <TextOverlay
              key={overlay.id}
              overlay={overlay}
              isActive={editorState.activeTextId === overlay.id}
              onUpdate={updateTextOverlay}
              onDelete={removeTextOverlay}
              onPress={setActiveText}
              containerWidth={screenWidth}
              containerHeight={screenHeight}
            />
          ))}
        </View>
      </View>

      {/* Top Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity style={styles.controlButton} onPress={onCancel}>
          <View style={styles.glassButton}>
            <Ionicons name="close" size={24} color="white" />
          </View>
        </TouchableOpacity>

        {/* Timer Settings (Photo only) */}
        {mediaType === 'photo' && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowTimerSettings(!showTimerSettings)}
          >
            <View style={styles.glassButton}>
              <Text style={styles.timerText}>{editorState.timerDuration}s</Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.controlButton} onPress={handleSave}>
          <View style={styles.glassButton}>
            <Ionicons name="download" size={24} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {/* Tool Buttons */}
        <View style={styles.toolButtons}>
          <TouchableOpacity
            style={[styles.toolButton, currentTool === 'text' && styles.activeToolButton]}
            onPress={enableTextMode}
          >
            <Ionicons name="text" size={24} color="white" />
            <Text style={styles.toolLabel}>Text</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolButton, currentTool === 'draw' && styles.activeToolButton]}
            onPress={toggleDrawingMode}
          >
            <Ionicons name="brush" size={24} color="white" />
            <Text style={styles.toolLabel}>Draw</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolButton}
            onPress={openSmartCaptionModal}
          >
            <Ionicons name="sparkles" size={24} color="#FFD700" />
            <Text style={styles.toolLabel}>Caption</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => setShowColorPalette(!showColorPalette)}
          >
            <View style={[styles.colorPreview, { backgroundColor: editorState.selectedColor }]} />
            <Text style={styles.toolLabel}>Color</Text>
          </TouchableOpacity>

          {editorState.drawingPaths.length > 0 && (
            <TouchableOpacity style={styles.toolButton} onPress={clearAllDrawing}>
              <Ionicons name="trash" size={24} color="white" />
              <Text style={styles.toolLabel}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Color Palette */}
        {showColorPalette && (
          <ScrollView
            horizontal
            style={styles.colorPalette}
            showsHorizontalScrollIndicator={false}
          >
            {getAvailableColors().map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  editorState.selectedColor === color && styles.selectedColorButton,
                ]}
                onPress={() => {
                  setSelectedColor(color);
                  setShowColorPalette(false);
                }}
              />
            ))}
          </ScrollView>
        )}

        {/* Timer Settings */}
        {showTimerSettings && mediaType === 'photo' && (
          <ScrollView
            horizontal
            style={styles.timerSettings}
            showsHorizontalScrollIndicator={false}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((duration) => (
              <TouchableOpacity
                key={duration}
                style={[
                  styles.timerButton,
                  editorState.timerDuration === duration && styles.selectedTimerButton,
                ]}
                onPress={() => {
                  setTimerDuration(duration);
                  setShowTimerSettings(false);
                }}
              >
                <Text style={styles.timerButtonText}>{duration}s</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Next Button */}
        <TouchableOpacity 
          style={[styles.nextButton, isCapturing && styles.nextButtonDisabled]} 
          onPress={handleNext}
          disabled={isCapturing}
        >
          <Text style={styles.nextButtonText}>
            {isCapturing ? 'Preparing...' : 'Next'}
          </Text>
          {isCapturing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="arrow-forward" size={20} color="white" />
          )}
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      {!hasContent() && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            {editorState.isDrawingMode
              ? 'Draw on your snap'
              : 'Tap to add text • Select draw tool to draw'}
          </Text>
        </View>
      )}

      {/* Smart Caption Modal */}
      <SmartCaptionModal
        visible={showSmartCaptionModal}
        imageUrl={mediaUri}
        onClose={() => setShowSmartCaptionModal(false)}
        onSelectCaption={handleCaptionSelect}
        gradeLevel="9" // Default grade level - could be made configurable
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mediaContainer: {
    flex: 1,
    position: 'relative',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topControls: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    padding: 4,
  },
  glassButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  timerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  toolButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  toolButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeToolButton: {
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  toolLabel: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
  },
  colorPalette: {
    marginBottom: 20,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorButton: {
    borderColor: 'white',
    borderWidth: 3,
  },
  timerSettings: {
    marginBottom: 20,
  },
  timerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedTimerButton: {
    borderColor: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  timerButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  instructionsText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
}); 