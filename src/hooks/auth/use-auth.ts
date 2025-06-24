import { useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setUser, setError, setLoading, clearError, clearUser } from '../../store/slices/auth.slice';
import { signInWithEmail, signUpWithEmail, signOutUser, resetPassword } from '../../services/firebase/auth';
import { checkUsernameAvailability } from '../../services/firebase/firestore.service';
import type { LoginFormData, SignupFormData, ForgotPasswordFormData } from '../../utils/validation/auth-schemas';

/**
 * Comprehensive authentication hook for managing user authentication state and operations.
 * Provides methods for login, signup, logout, password reset, and username validation.
 * Integrates with Redux store and Firebase authentication services.
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [usernameCheckLoading, setUsernameCheckLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  /**
   * Login user with email and password
   */
  const login = useCallback(async (data: LoginFormData) => {
    dispatch(setLoading(true));
    dispatch(clearError());
    
    try {
      const user = await signInWithEmail(data);
      dispatch(setUser(user));
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign in';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  /**
   * Register new user with email, username, and password
   */
  const signup = useCallback(async (data: SignupFormData) => {
    dispatch(setLoading(true));
    dispatch(clearError());
    
    try {
      // Check username availability first
      const isAvailable = await checkUsernameAvailability(data.username);
      if (!isAvailable) {
        throw new Error('Username is already taken');
      }

      const user = await signUpWithEmail({
        email: data.email,
        password: data.password,
        username: data.username,
      });
      
      dispatch(setUser(user));
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create account';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  /**
   * Send password reset email
   */
  const forgotPassword = useCallback(async (data: ForgotPasswordFormData) => {
    dispatch(setLoading(true));
    dispatch(clearError());
    
    try {
      await resetPassword(data.email);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send reset email';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  /**
   * Sign out current user
   */
  const logout = useCallback(async () => {
    try {
      await signOutUser();
      dispatch(clearUser());
      return { success: true };
    } catch (error: any) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      dispatch(clearUser());
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  /**
   * Check if username is available (debounced)
   */
  const checkUsername = useCallback(async (username: string) => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setUsernameCheckLoading(true);
    try {
      const isAvailable = await checkUsernameAvailability(username);
      setUsernameAvailable(isAvailable);
    } catch (error) {
      console.error('Username check error:', error);
      setUsernameAvailable(null);
    } finally {
      setUsernameCheckLoading(false);
    }
  }, []);

  /**
   * Clear authentication error
   */
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // State
    user,
    isLoading,
    error,
    isAuthenticated,
    usernameCheckLoading,
    usernameAvailable,
    
    // Actions
    login,
    signup,
    logout,
    forgotPassword,
    checkUsername,
    clearAuthError,
  };
} 