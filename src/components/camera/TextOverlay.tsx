import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TextOverlay as TextOverlayType } from '../../hooks/camera/use-snap-editor';

/**
 * Text overlay component for adding and editing text on snaps.
 * Features draggable text, inline editing, and delete functionality.
 * Supports customizable colors and positioning.
 */

interface TextOverlayProps {
  overlay: TextOverlayType;
  isActive: boolean;
  onUpdate: (id: string, updates: Partial<TextOverlayType>) => void;
  onDelete: (id: string) => void;
  onPress: (id: string) => void;
  containerWidth: number;
  containerHeight: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function TextOverlay({
  overlay,
  isActive,
  onUpdate,
  onDelete,
  onPress,
  containerWidth,
  containerHeight,
}: TextOverlayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(overlay.text);
  
  const pan = useRef(new Animated.ValueXY({ x: overlay.x, y: overlay.y })).current;
  const textInputRef = useRef<TextInput>(null);

  /**
   * Pan responder for dragging text overlay
   */
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => isActive && !isEditing,
             onPanResponderGrant: () => {
         pan.setOffset({
           x: (pan.x as any)._value,
           y: (pan.y as any)._value,
         });
       },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        
                 // Update position in parent state
         const newX = Math.max(0, Math.min(containerWidth - 100, (pan.x as any)._value));
         const newY = Math.max(0, Math.min(containerHeight - 50, (pan.y as any)._value));
        
        onUpdate(overlay.id, { x: newX, y: newY });
      },
    })
  ).current;

  /**
   * Handle text overlay press - activate or start editing
   */
  const handlePress = () => {
    if (!isActive) {
      onPress(overlay.id);
    } else if (!isEditing) {
      startEditing();
    }
  };

  /**
   * Start editing mode
   */
  const startEditing = () => {
    setIsEditing(true);
    setEditText(overlay.text);
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 200);
  };

  /**
   * Finish editing and save changes
   */
  const finishEditing = () => {
    setIsEditing(false);
    if (editText.trim()) {
      onUpdate(overlay.id, { text: editText.trim() });
    } else {
      // Delete if text is empty
      onDelete(overlay.id);
    }
  };

  /**
   * Cancel editing and revert changes
   */
  const cancelEditing = () => {
    setIsEditing(false);
    setEditText(overlay.text);
  };

  /**
   * Handle delete button press
   */
  const handleDelete = () => {
    onDelete(overlay.id);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: pan.getTranslateTransform(),
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Text Display/Edit */}
      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            ref={textInputRef}
            style={[
              styles.textInput,
              {
                color: overlay.color,
                fontSize: overlay.fontSize,
              },
            ]}
            value={editText}
            onChangeText={setEditText}
            multiline
            autoFocus
            placeholder="Enter text..."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            returnKeyType="done"
            blurOnSubmit={true}
            onSubmitEditing={finishEditing}
          />
          <View style={styles.editButtons}>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={finishEditing}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="checkmark" size={16} color="white" />
              <Text style={styles.buttonText}>Done</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={cancelEditing}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={16} color="white" />
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.textContainer,
            isActive && styles.activeTextContainer,
          ]}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.text,
              {
                color: overlay.color,
                fontSize: overlay.fontSize,
                transform: overlay.rotation 
                  ? [{ rotate: `${overlay.rotation}deg` }] 
                  : undefined,
              },
            ]}
          >
            {overlay.text}
          </Text>
          
          {/* Delete button - only show when active */}
          {isActive && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={styles.deleteButtonInner}>
                <Ionicons name="close" size={12} color="white" />
              </View>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    minWidth: 50,
    minHeight: 30,
  },
  textContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTextContainer: {
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderStyle: 'dashed',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  textInput: {
    flex: 1,
    fontWeight: '600',
    textAlign: 'center',
    minWidth: 100,
    maxWidth: 200,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    zIndex: 10,
  },
  deleteButtonInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  editButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  doneButton: {
    padding: 4,
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
    borderRadius: 12,
  },
  cancelButton: {
    padding: 4,
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderRadius: 12,
  },
  buttonText: {
    marginLeft: 4,
    fontWeight: '600',
    color: 'white',
  },
}); 