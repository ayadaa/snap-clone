/**
 * Snap Inbox Component
 * Displays received snaps with indicators and navigation to viewer
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSnaps } from '../../hooks/snaps/use-snaps';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../../types/navigation';

interface SnapInboxProps {
  style?: any;
}

type NavigationProp = StackNavigationProp<AppStackParamList>;

export function SnapInbox({ style }: SnapInboxProps) {
  const navigation = useNavigation<NavigationProp>();
  const { receivedSnaps, isLoading, refreshSnaps } = useSnaps();

  /**
   * Navigate to snap viewer
   */
  const handleSnapPress = (snapId: string) => {
    console.log('Opening snap:', snapId);
    navigation.navigate('SnapViewer', { snapId });
  };

  /**
   * Render individual snap item
   */
  const renderSnapItem = ({ item: snap }: { item: any }) => (
    <TouchableOpacity
      style={styles.snapItem}
      onPress={() => handleSnapPress(snap.id)}
    >
      <View style={styles.snapIcon}>
        <Ionicons 
          name={snap.mediaType === 'video' ? 'videocam' : 'camera'} 
          size={20} 
          color="white" 
        />
      </View>
      
      <View style={styles.snapInfo}>
        <Text style={styles.senderName}>
          {snap.senderUsername || 'Unknown User'}
        </Text>
        <Text style={styles.snapTime}>
          {getTimeAgo(snap.createdAt)}
        </Text>
      </View>
      
      <View style={styles.snapStatus}>
        {!snap.viewed && (
          <View style={styles.unreadIndicator} />
        )}
        <Ionicons name="chevron-forward" size={16} color="#666" />
      </View>
    </TouchableOpacity>
  );

  /**
   * Get time ago string
   */
  const getTimeAgo = (timestamp: any) => {
    const now = new Date();
    const snapTime = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - snapTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading snaps...</Text>
        </View>
      </View>
    );
  }

  if (receivedSnaps.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="camera-outline" size={48} color="#666" />
          <Text style={styles.emptyText}>No snaps yet</Text>
          <Text style={styles.emptySubtext}>
            Snaps from friends will appear here
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Snaps</Text>
        <TouchableOpacity onPress={refreshSnaps}>
          <Ionicons name="refresh" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={receivedSnaps}
        renderItem={renderSnapItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  snapItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  snapIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  snapInfo: {
    flex: 1,
  },
  senderName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  snapTime: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  snapStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    textAlign: 'center',
  },
}); 