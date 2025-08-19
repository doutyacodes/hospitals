'use client';

import React, { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  toasts: [],
};

// Action types
const TOAST_ACTIONS = {
  ADD_TOAST: 'ADD_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
  CLEAR_ALL: 'CLEAR_ALL',
};

// Toast reducer
function toastReducer(state, action) {
  switch (action.type) {
    case TOAST_ACTIONS.ADD_TOAST:
      return {
        ...state,
        toasts: [...state.toasts, action.payload],
      };
    case TOAST_ACTIONS.REMOVE_TOAST:
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload),
      };
    case TOAST_ACTIONS.CLEAR_ALL:
      return {
        ...state,
        toasts: [],
      };
    default:
      return state;
  }
}

// Create context
const ToastContext = createContext();

// Toast provider component
export function ToastProvider({ children }) {
  const [state, dispatch] = useReducer(toastReducer, initialState);

  const addToast = (toast) => {
    const id = Math.random().toString(36).substring(2, 15);
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      ...toast,
    };

    dispatch({
      type: TOAST_ACTIONS.ADD_TOAST,
      payload: newToast,
    });

    // Auto remove toast after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  };

  const removeToast = (id) => {
    dispatch({
      type: TOAST_ACTIONS.REMOVE_TOAST,
      payload: id,
    });
  };

  const clearAll = () => {
    dispatch({ type: TOAST_ACTIONS.CLEAR_ALL });
  };

  // Convenience methods for different toast types
  const success = (message, options = {}) => {
    return addToast({ message, type: 'success', ...options });
  };

  const error = (message, options = {}) => {
    return addToast({ message, type: 'error', duration: 7000, ...options });
  };

  const warning = (message, options = {}) => {
    return addToast({ message, type: 'warning', ...options });
  };

  const info = (message, options = {}) => {
    return addToast({ message, type: 'info', ...options });
  };

  const value = {
    toasts: state.toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

// Custom hook to use toast context
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export { TOAST_ACTIONS };