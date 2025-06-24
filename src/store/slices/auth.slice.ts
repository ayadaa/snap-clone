import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  uid: string;
  email: string;
  username: string;
  createdAt?: Date;
  lastLogin?: Date;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Initial authentication state for the Redux store.
 * Manages user authentication status and user data.
 */
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

/**
 * Authentication slice using Redux Toolkit.
 * Handles user login, logout, and authentication state management.
 * Designed for Firebase Authentication integration in Phase 0.
 */
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setLoading, setUser, clearUser, setError, clearError } = authSlice.actions;
export default authSlice.reducer; 