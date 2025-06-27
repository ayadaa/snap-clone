import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSmartCaption } from '../../hooks/camera/use-smart-caption';
import { uploadImageToStorage } from '../../services/firebase/storage.service';

/**
 * Smart Caption Modal Component
 * 
 * This component displays AI-generated caption suggestions for math Snaps.
 * It provides multiple caption options with different styles and allows users
 * to select, customize, or refresh suggestions.
 */

interface SmartCaptionModalProps {
  visible: boolean;
  imageUrl: string;
  onClose: () => void;
  onSelectCaption: (caption: string) => void;
  gradeLevel?: string;
}

const { width: screenWidth } = Dimensions.get('window');

export function SmartCaptionModal({
  visible,
  imageUrl,
  onClose,
  onSelectCaption,
  gradeLevel,
}: SmartCaptionModalProps) {
  const {
    isLoading,
    captions,
    selectedCaption,
    difficulty,
    detectedConcepts,
    error,
    generateCaptions,
    selectCaption,
    clearCaptions,
    refreshCaptions,
  } = useSmartCaption();

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  /**
   * Upload local image to Firebase Storage and get public URL
   */
  const uploadImageForAnalysis = async (localImageUri: string): Promise<string> => {
    try {
      setIsUploadingImage(true);
      
      // Generate a unique filename for the temporary image
      const timestamp = Date.now();
      const filename = `smart-caption-temp/${timestamp}.jpg`;
      
      // Upload to Firebase Storage
      const publicUrl = await uploadImageToStorage(localImageUri, filename);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image for analysis:', error);
      throw new Error('Failed to upload image for analysis');
    } finally {
      setIsUploadingImage(false);
    }
  };

  /**
   * Generate captions when modal opens
   */
  useEffect(() => {
    if (visible && imageUrl) {
      const generateCaptionsWithUpload = async () => {
        try {
          // Check if the imageUrl is a local file URI
          if (imageUrl.startsWith('file://') || imageUrl.startsWith('content://')) {
            // Upload the local image to get a public URL
            const publicUrl = await uploadImageForAnalysis(imageUrl);
            setUploadedImageUrl(publicUrl);
            await generateCaptions(publicUrl, { gradeLevel });
          } else {
            // Use the URL directly if it's already a public URL
            setUploadedImageUrl(imageUrl);
            await generateCaptions(imageUrl, { gradeLevel });
          }
        } catch (error) {
          console.error('Error preparing image for caption generation:', error);
        }
      };

      generateCaptionsWithUpload();
    }
  }, [visible, imageUrl, gradeLevel, generateCaptions]);

  /**
   * Clear captions when modal closes
   */
  useEffect(() => {
    if (!visible) {
      clearCaptions();
      setUploadedImageUrl(null);
    }
  }, [visible, clearCaptions]);

  /**
   * Handle caption selection
   */
  const handleSelectCaption = (caption: string) => {
    selectCaption(caption);
    onSelectCaption(caption);
    onClose();
  };

  /**
   * Handle style change and regenerate captions
   */
  const handleStyleChange = async (style: 'casual' | 'celebratory' | 'educational' | 'motivational') => {
    if (uploadedImageUrl) {
      await generateCaptions(uploadedImageUrl, { 
        gradeLevel, 
        captionStyle: style 
      });
    }
  };

  /**
   * Handle refresh captions
   */
  const handleRefreshCaptions = async () => {
    if (uploadedImageUrl) {
      await generateCaptions(uploadedImageUrl, { gradeLevel });
    }
  };

  /**
   * Get difficulty color
   */
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  /**
   * Get difficulty emoji
   */
  const getDifficultyEmoji = (level: string) => {
    switch (level) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Smart Caption ✨</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Loading State */}
            {(isLoading || isUploadingImage) && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0084FF" />
                <Text style={styles.loadingText}>
                  {isUploadingImage ? 'Uploading image...' : 'Generating smart captions...'}
                </Text>
              </View>
            )}

            {/* Error State */}
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color="#F44336" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                  style={styles.retryButton} 
                  onPress={() => uploadedImageUrl ? generateCaptions(uploadedImageUrl, { gradeLevel }) : null}
                >
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Success State */}
            {!isLoading && !error && captions.length > 0 && (
              <>
                {/* Math Info */}
                {(difficulty || detectedConcepts.length > 0) && (
                  <View style={styles.mathInfoContainer}>
                    {difficulty && (
                      <View style={styles.difficultyBadge}>
                        <Text style={styles.difficultyEmoji}>
                          {getDifficultyEmoji(difficulty)}
                        </Text>
                        <Text style={[styles.difficultyText, { color: getDifficultyColor(difficulty) }]}>
                          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </Text>
                      </View>
                    )}
                    {detectedConcepts.length > 0 && (
                      <View style={styles.conceptsContainer}>
                        <Text style={styles.conceptsLabel}>Detected:</Text>
                        <Text style={styles.conceptsText}>
                          {detectedConcepts.slice(0, 3).join(', ')}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Style Selector */}
                <View style={styles.styleSelector}>
                  <Text style={styles.styleSelectorLabel}>Caption Style:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {[
                      { key: 'casual', label: 'Casual', emoji: '😎' },
                      { key: 'celebratory', label: 'Celebration', emoji: '🎉' },
                      { key: 'educational', label: 'Educational', emoji: '📚' },
                      { key: 'motivational', label: 'Motivational', emoji: '💪' },
                    ].map((style) => (
                      <TouchableOpacity
                        key={style.key}
                        style={styles.styleButton}
                        onPress={() => handleStyleChange(style.key as any)}
                      >
                        <Text style={styles.styleEmoji}>{style.emoji}</Text>
                        <Text style={styles.styleLabel}>{style.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Caption Options */}
                <View style={styles.captionsContainer}>
                  <Text style={styles.captionsHeader}>Choose your caption:</Text>
                  {captions.map((caption, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.captionOption,
                        selectedCaption === caption && styles.selectedCaptionOption,
                      ]}
                      onPress={() => handleSelectCaption(caption)}
                    >
                      <Text style={styles.captionText}>{caption}</Text>
                      <View style={styles.captionActions}>
                        <Ionicons name="checkmark-circle" size={24} color="#0084FF" />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Refresh Button */}
                <TouchableOpacity 
                  style={styles.refreshButton} 
                  onPress={handleRefreshCaptions}
                >
                  <Ionicons name="refresh" size={20} color="#0084FF" />
                  <Text style={styles.refreshButtonText}>Generate New Captions</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: '#0084FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  mathInfoContainer: {
    marginBottom: 20,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  difficultyEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  conceptsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conceptsLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginRight: 6,
  },
  conceptsText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  styleSelector: {
    marginBottom: 20,
  },
  styleSelectorLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  styleButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    marginRight: 12,
    minWidth: 80,
  },
  styleEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  styleLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  captionsContainer: {
    marginBottom: 20,
  },
  captionsHeader: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  captionOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCaptionOption: {
    borderColor: '#0084FF',
    backgroundColor: 'rgba(0, 132, 255, 0.1)',
  },
  captionText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 22,
  },
  captionActions: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 132, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#0084FF',
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 20,
  },
  refreshButtonText: {
    color: '#0084FF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 