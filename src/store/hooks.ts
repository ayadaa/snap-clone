import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

/**
 * Typed Redux hooks for use throughout the app.
 * These hooks provide proper TypeScript typing for Redux state and dispatch.
 * Use these instead of the plain useSelector and useDispatch hooks.
 */

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 