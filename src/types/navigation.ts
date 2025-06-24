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

export type MainTabParamList = {
  Chat: undefined;
  Camera: undefined;
  Stories: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
}; 