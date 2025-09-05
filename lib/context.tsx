'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AppState } from './types';
import { services, storageService } from './services';

// Action types
type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LANGUAGE'; payload: 'en' | 'es' }
  | { type: 'SET_CURRENT_STATE'; payload: string }
  | { type: 'SET_RECORDING'; payload: boolean }
  | { type: 'SET_PREMIUM_UNLOCKED'; payload: boolean }
  | { type: 'UPDATE_USER_PREMIUM_FEATURES'; payload: string[] }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: AppState = {
  user: null,
  selectedLanguage: 'en',
  currentState: 'California',
  isRecording: false,
  premiumUnlocked: false,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        currentState: action.payload?.selectedState || state.currentState,
        premiumUnlocked: (action.payload?.premiumFeatures?.length || 0) > 0,
      };
    case 'SET_LANGUAGE':
      return { ...state, selectedLanguage: action.payload };
    case 'SET_CURRENT_STATE':
      return { ...state, currentState: action.payload };
    case 'SET_RECORDING':
      return { ...state, isRecording: action.payload };
    case 'SET_PREMIUM_UNLOCKED':
      return { ...state, premiumUnlocked: action.payload };
    case 'UPDATE_USER_PREMIUM_FEATURES':
      return {
        ...state,
        user: state.user ? { ...state.user, premiumFeatures: action.payload } : null,
        premiumUnlocked: action.payload.length > 0,
      };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helper functions
  setUser: (user: User | null) => void;
  setLanguage: (language: 'en' | 'es') => void;
  setCurrentState: (state: string) => void;
  setRecording: (recording: boolean) => void;
  updateUserPremiumFeatures: (features: string[]) => void;
  hasFeature: (featureKey: string) => boolean;
  logout: () => void;
  // Async actions
  initializeUser: (farcasterProfile: string) => Promise<void>;
  purchaseFeature: (featureKey: string, txHash: string, amount: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedUser = storageService.getUser();
    const storedLanguage = storageService.getLanguage();
    const storedState = storageService.getSelectedState();

    if (storedUser) {
      dispatch({ type: 'SET_USER', payload: storedUser });
    }
    dispatch({ type: 'SET_LANGUAGE', payload: storedLanguage });
    dispatch({ type: 'SET_CURRENT_STATE', payload: storedState });
  }, []);

  // Sync to localStorage when state changes
  useEffect(() => {
    if (state.user) {
      storageService.setUser(state.user);
    }
  }, [state.user]);

  useEffect(() => {
    storageService.setLanguage(state.selectedLanguage);
  }, [state.selectedLanguage]);

  useEffect(() => {
    storageService.setSelectedState(state.currentState);
  }, [state.currentState]);

  // Helper functions
  const setUser = (user: User | null) => {
    dispatch({ type: 'SET_USER', payload: user });
    if (!user) {
      storageService.clearUser();
    }
  };

  const setLanguage = (language: 'en' | 'es') => {
    dispatch({ type: 'SET_LANGUAGE', payload: language });
  };

  const setCurrentState = (currentState: string) => {
    dispatch({ type: 'SET_CURRENT_STATE', payload: currentState });
  };

  const setRecording = (recording: boolean) => {
    dispatch({ type: 'SET_RECORDING', payload: recording });
  };

  const updateUserPremiumFeatures = (features: string[]) => {
    dispatch({ type: 'UPDATE_USER_PREMIUM_FEATURES', payload: features });
  };

  const hasFeature = (featureKey: string): boolean => {
    return state.user?.premiumFeatures?.includes(featureKey) || false;
  };

  const logout = () => {
    dispatch({ type: 'RESET_STATE' });
    storageService.clearUser();
  };

  // Async actions
  const initializeUser = async (farcasterProfile: string) => {
    try {
      const user = await services.auth.createOrUpdateUser(farcasterProfile, state.currentState);
      setUser(user);
    } catch (error) {
      console.error('Failed to initialize user:', error);
      throw error;
    }
  };

  const purchaseFeature = async (featureKey: string, txHash: string, amount: number) => {
    if (!state.user) {
      throw new Error('User not authenticated');
    }

    try {
      const result = await services.payment.purchaseFeature(
        state.user.userId,
        featureKey,
        txHash,
        amount
      );
      setUser(result.user);
    } catch (error) {
      console.error('Failed to purchase feature:', error);
      throw error;
    }
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    setUser,
    setLanguage,
    setCurrentState,
    setRecording,
    updateUserPremiumFeatures,
    hasFeature,
    logout,
    initializeUser,
    purchaseFeature,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Specific hooks for common use cases
export function useUser() {
  const { state } = useApp();
  return state.user;
}

export function useLanguage() {
  const { state, setLanguage } = useApp();
  return [state.selectedLanguage, setLanguage] as const;
}

export function useCurrentState() {
  const { state, setCurrentState } = useApp();
  return [state.currentState, setCurrentState] as const;
}

export function useRecording() {
  const { state, setRecording } = useApp();
  return [state.isRecording, setRecording] as const;
}

export function usePremiumFeatures() {
  const { state, hasFeature, purchaseFeature } = useApp();
  return {
    premiumUnlocked: state.premiumUnlocked,
    premiumFeatures: state.user?.premiumFeatures || [],
    hasFeature,
    purchaseFeature,
  };
}
