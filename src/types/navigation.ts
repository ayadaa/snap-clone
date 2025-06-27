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
  HomeworkAnalysis: {
    imageUri: string;
    gradeLevel?: string;
  };
};

export type MainTabParamList = {
  Chat: undefined;
  Camera: undefined;
  Math: undefined;
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
  ChallengeViewer: {
    challengeSnapId: string;
    senderId: string;
  };
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type NavigationProp = RNNavigationProp<AppStackParamList>;

/**
 * Math Challenge related types
 */
export type MathChallengeData = {
  id: string;
  problem: string;
  concept: string;
  gradeLevel: string;
  solution?: string;
  createdBy: string;
  createdAt: number;
  difficulty: 'basic' | 'intermediate' | 'advanced';
};

export type ChallengeSnapData = {
  challengeId: string;
  problem: string;
  concept: string;
  timeLimit?: number;
  correctAnswer?: string;
  explanation?: string;
}; 