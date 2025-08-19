'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Initial state
const initialState = {
  user: null,
  loading: true,
  isAuthenticated: false,
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
};

// Auth reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
      };
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext();

// Auth provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    // First try to get user from client-accessible cookie for immediate state
    const getUserFromCookie = () => {
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        const userCookie = cookies.find(cookie => cookie.trim().startsWith('auth-user='));
        if (userCookie) {
          try {
            const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: userData,
            });
            return true;
          } catch (error) {
            console.error('Error parsing user cookie:', error);
          }
        }
      }
      return false;
    };

    // If we can't get user from cookie, check with server
    if (!getUserFromCookie()) {
      checkAuth();
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (data.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: data.user,
        });
      } else {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  const login = async (credentials, userType = 'hospital') => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      // Choose the appropriate login endpoint based on user type
      const endpoint = userType === 'doctor' ? '/api/auth/doctor/login' : '/api/auth/login';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: data.user,
        });
        return { success: true, user: data.user };
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      
      // Clear client-side cookie
      if (typeof document !== 'undefined') {
        document.cookie = 'auth-user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
      
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      
      // Clear client-side cookie even if API call fails
      if (typeof document !== 'undefined') {
        document.cookie = 'auth-user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
      
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      router.push('/');
    }
  };

  const updateUser = (userData) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData,
    });
  };

  const value = {
    ...state,
    login,
    logout,
    updateUser,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AUTH_ACTIONS };