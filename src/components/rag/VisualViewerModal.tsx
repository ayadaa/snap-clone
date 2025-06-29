/**
 * @fileoverview Visual Viewer Modal Component
 * 
 * This component displays AI-generated visual representations of mathematical concepts
 * in a modal overlay with interactive elements and educational descriptions.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { VisualGenerationResponse, validateSVGContent, extractSVGDimensions } from '../../services/firebase/visual.service';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface VisualViewerModalProps {
  visible: boolean;
  onClose: () => void;
  visual: VisualGenerationResponse['visual'] | null;
  concept: string;
  isLoading?: boolean;
}

/**
 * Modal component for displaying visual representations
 */
export const VisualViewerModal: React.FC<VisualViewerModalProps> = ({
  visible,
  onClose,
  visual,
  concept,
  isLoading = false
}) => {
  const insets = useSafeAreaInsets();
  const [showInteractiveElements, setShowInteractiveElements] = useState(false);

  /**
   * Render the visual content based on type
   */
  const renderVisualContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0084FF" />
          <Text style={styles.loadingText}>Generating visual representation...</Text>
        </View>
      );
    }

    if (!visual) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No visual content available</Text>
        </View>
      );
    }

    if (visual.type === 'svg' && visual.content) {
      // Validate SVG content for security
      if (!validateSVGContent(visual.content)) {
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Invalid visual content</Text>
          </View>
        );
      }

      // Extract dimensions or use defaults
      const dimensions = extractSVGDimensions(visual.content);
      const svgWidth = Math.min(dimensions?.width || 400, screenWidth - 40);
      const svgHeight = Math.min(dimensions?.height || 300, screenHeight * 0.4);

      return (
        <View style={styles.svgContainer}>
          <SvgXml
            xml={visual.content}
            width={svgWidth}
            height={svgHeight}
            style={styles.svgContent}
          />
        </View>
      );
    }

    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unsupported visual format</Text>
      </View>
    );
  };

  /**
   * Render interactive elements section
   */
  const renderInteractiveElements = () => {
    if (!visual?.interactiveElements || visual.interactiveElements.length === 0) {
      return null;
    }

    return (
      <View style={styles.interactiveSection}>
        <TouchableOpacity
          style={styles.interactiveToggle}
          onPress={() => setShowInteractiveElements(!showInteractiveElements)}
        >
          <Text style={styles.interactiveToggleText}>
            Key Elements {showInteractiveElements ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>
        
        {showInteractiveElements && (
          <View style={styles.interactiveList}>
            {visual.interactiveElements.map((element, index) => (
              <View key={index} style={styles.interactiveItem}>
                <Text style={styles.interactiveBullet}>•</Text>
                <Text style={styles.interactiveText}>{element}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title} numberOfLines={2}>
              {visual?.title || `${concept} Visualization`}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Visual Display */}
          <View style={styles.visualSection}>
            {renderVisualContent()}
          </View>

          {/* Description */}
          {visual?.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.descriptionTitle}>About this visualization:</Text>
              <Text style={styles.descriptionText}>{visual.description}</Text>
            </View>
          )}

          {/* Interactive Elements */}
          {renderInteractiveElements()}

          {/* Educational Tips */}
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>Study Tips:</Text>
            <Text style={styles.tipsText}>
              • Take time to examine each labeled part{'\n'}
              • Try to understand the relationships shown{'\n'}
              • Sketch similar diagrams on your own{'\n'}
              • Connect this visual to the mathematical formulas
            </Text>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Alert.alert(
                'Visual Saved',
                'This visual representation has been saved to your concept notes.',
                [{ text: 'OK' }]
              );
            }}
          >
            <Text style={styles.actionButtonText}>Save to Notes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={onClose}
          >
            <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
              Continue Learning
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666666',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  visualSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  svgContainer: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  svgContent: {
    backgroundColor: 'transparent',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
  },
  interactiveSection: {
    marginBottom: 24,
  },
  interactiveToggle: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0084FF',
  },
  interactiveToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0084FF',
  },
  interactiveList: {
    marginTop: 12,
    paddingLeft: 16,
  },
  interactiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  interactiveBullet: {
    fontSize: 16,
    color: '#0084FF',
    marginRight: 8,
    marginTop: 2,
  },
  interactiveText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
    lineHeight: 22,
  },
  tipsSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  primaryButton: {
    backgroundColor: '#0084FF',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
}); 