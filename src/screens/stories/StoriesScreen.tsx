import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Screen } from '../../components/common/Screen';

export function StoriesScreen() {
  const handleStoryPress = (storyId: string) => {
    console.log('Story pressed:', storyId);
  };

  const mockStories = [
    {
      id: '1',
      username: 'john_doe',
      timestamp: '2h ago',
      avatar: '😊',
      hasNewStory: true,
    },
    {
      id: '2',
      username: 'jane_smith',
      timestamp: '5h ago',
      avatar: '🌟',
      hasNewStory: false,
    },
    {
      id: '3',
      username: 'mike_j',
      timestamp: '12h ago',
      avatar: '🎮',
      hasNewStory: true,
    },
  ];

  return (
    <Screen backgroundColor="#000000" statusBarStyle="light-content">
      <View style={{ flex: 1 }}>
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 16,
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 24,
              fontWeight: 'bold',
            }}
          >
            Stories
          </Text>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {mockStories.map((story) => (
            <TouchableOpacity
              key={story.id}
              onPress={() => handleStoryPress(story.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                  borderWidth: story.hasNewStory ? 3 : 0,
                  borderColor: story.hasNewStory ? '#0084FF' : 'transparent',
                }}
              >
                <Text style={{ fontSize: 24 }}>{story.avatar}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 16,
                    fontWeight: 'bold',
                    marginBottom: 4,
                  }}
                >
                  {story.username}
                </Text>
                <Text
                  style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: 14,
                  }}
                >
                  {story.timestamp}
                </Text>
              </View>

              {story.hasNewStory && (
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: '#0084FF',
                  }}
                />
              )}
            </TouchableOpacity>
          ))}

          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 60,
            }}
          >
            <Text
              style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: 18,
                textAlign: 'center',
                marginBottom: 16,
              }}
            >
              📱
            </Text>
            <Text
              style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: 16,
                textAlign: 'center',
                marginBottom: 8,
              }}
            >
              Stories Feature
            </Text>
            <Text
              style={{
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: 12,
                textAlign: 'center',
              }}
            >
              Phase 2: 24-hour story sharing
            </Text>
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
} 