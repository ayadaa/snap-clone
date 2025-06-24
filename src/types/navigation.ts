import type { NavigationProp as RNNavigationProp } from '@react-navigation/native';

/**
 * Navigation parameter types for React Navigation.
 * Defines the structure of parameters passed between screens.
 * Ensures type safety when navigating throughout the app.
 */

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

export type CameraStackParamList = {
  CameraCapture: undefined;
  SnapEditor: {
    mediaUri: string;
    mediaType: 'photo' | 'video';
  };
  SendTo: {
    mediaUri: string;
    mediaType: 'photo' | 'video';
    duration: number;
    hasText?: boolean;
    hasDrawing?: boolean;
  };
};

export type MainTabParamList = {
  Chat: undefined;
  Camera: undefined;
  Friends: undefined;
  Stories: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  SnapViewer: {
    snapId: string;
    chatType?: 'individual' | 'group';
    senderId?: string;
  };
  IndividualChat: {
    chatId: string;
    username: string;
  };
  GroupChat: {
    groupId: string;
  };
  GroupSettings: {
    groupId: string;
  };
  CreateGroup: undefined;
  StoryViewer: {
    storyId: string;
    stories: Array<{
      id: string;
      username: string;
      snaps: Array<{
        snapId: string;
        storageUrl: string;
        mediaType: 'photo' | 'video';
        duration: number;
      }>;
    }>;
    initialIndex: number;
    isOwnStory?: boolean;
  };
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type NavigationProp = RNNavigationProp<AppStackParamList>; 