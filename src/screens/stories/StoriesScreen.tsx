/**
 * Stories Screen
 * Displays user stories and snap inbox for testing
 */

import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useStories, type StoryWithUser } from '../../hooks/stories/use-stories';
import type { RootState } from '../../store';
import type { NavigationProp } from '../../types/navigation';

const { width } = Dimensions.get('window');
const STORY_ITEM_WIDTH = (width - 48) / 2; // 2 columns with padding

export default function StoriesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const {
    friendsStories,
    userStory,
    loading,
    error,
    refreshStories,
  } = useStories(user?.uid || '');

  const handleStoryPress = (story: StoryWithUser) => {
    navigation.navigate('StoryViewer', { 
      storyId: story.id,
      stories: friendsStories,
      initialIndex: friendsStories.findIndex(s => s.id === story.id)
    });
  };

  const handleMyStoryPress = () => {
    if (userStory) {
      navigation.navigate('StoryViewer', { 
        storyId: userStory.id,
        stories: [{ ...userStory, username: user?.username || 'You' }],
        initialIndex: 0,
        isOwnStory: true
      });
    }
  };

  const renderStoryItem = ({ item }: { item: StoryWithUser }) => (
    <TouchableOpacity
      onPress={() => handleStoryPress(item)}
      style={[styles.storyItem, { width: STORY_ITEM_WIDTH }]}
    >
      <View style={styles.storyContainer}>
        {/* Story Preview Image */}
        <View style={styles.storyImageContainer}>
          {item.snaps.length > 0 && (
            <Image
              source={{ uri: item.snaps[item.snaps.length - 1].storageUrl }}
              style={styles.storyImage}
              resizeMode="cover"
            />
          )}
          
          {/* Glassmorphic Overlay */}
          <View style={styles.overlay} />
          
          {/* Story Ring */}
          <View style={styles.storyRing} />
          
          {/* User Info */}
          <View style={styles.userInfoContainer}>
            <View style={styles.userInfoBox}>
              <Text style={styles.username} numberOfLines={1}>
                {item.username}
              </Text>
              <Text style={styles.snapCount}>
                {item.snaps.length} snap{item.snaps.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMyStory = () => {
    if (!userStory) return null;

    return (
      <TouchableOpacity
        onPress={handleMyStoryPress}
        style={styles.myStoryContainer}
      >
        <View style={styles.storyContainer}>
          {/* My Story Preview */}
          <View style={styles.storyImageContainer}>
            {userStory.snaps.length > 0 && (
              <Image
                source={{ uri: userStory.snaps[userStory.snaps.length - 1].storageUrl }}
                style={styles.storyImage}
                resizeMode="cover"
              />
            )}
            
            {/* Glassmorphic Overlay */}
            <View style={styles.overlay} />
            
            {/* My Story Ring (Different Color) */}
            <View style={styles.myStoryRing} />
            
            {/* My Story Label */}
            <View style={styles.userInfoContainer}>
              <View style={styles.userInfoBox}>
                <Text style={styles.username}>
                  My Story
                </Text>
                <Text style={styles.snapCount}>
                  {userStory.viewCount} view{userStory.viewCount !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateBox}>
        <Text style={styles.emptyTitle}>No Stories Yet</Text>
        <Text style={styles.emptyText}>
          When your friends post stories, they'll appear here
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stories</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : friendsStories.length === 0 && !userStory && !loading ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={friendsStories}
            renderItem={renderStoryItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            ListHeaderComponent={renderMyStory}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={refreshStories}
                tintColor="#ffffff"
              />
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  storyItem: {
    marginBottom: 16,
  },
  myStoryContainer: {
    marginBottom: 24,
  },
  storyContainer: {
    position: 'relative',
  },
  storyImageContainer: {
    aspectRatio: 3/4,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1f2937',
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  storyRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: '#a855f7',
    borderRadius: 16,
  },
  myStoryRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderRadius: 16,
  },
  userInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  userInfoBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  username: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  snapCount: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  row: {
    justifyContent: 'space-between',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyStateBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
  },
}); 