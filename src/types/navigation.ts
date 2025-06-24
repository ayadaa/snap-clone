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
  };
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
}; 