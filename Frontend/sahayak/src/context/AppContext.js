import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  language: 'en',
  teachingMedium: 'en',
  currentGrade: null,
  curriculum: null,
  notifications: [],
};

// Action types
export const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  SET_LANGUAGE: 'SET_LANGUAGE',
  SET_TEACHING_MEDIUM: 'SET_TEACHING_MEDIUM',
  SET_GRADE: 'SET_GRADE',
  SET_CURRICULUM: 'SET_CURRICULUM',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case actionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    
    case actionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    
    case actionTypes.LOGOUT:
      localStorage.removeItem('sahayak_user');
      return {
        ...initialState,
      };
    
    case actionTypes.UPDATE_PROFILE:
      const updatedUser = { ...state.user, ...action.payload };
      localStorage.setItem('sahayak_user', JSON.stringify(updatedUser));
      return {
        ...state,
        user: updatedUser,
      };
    
    case actionTypes.SET_LANGUAGE:
      return { ...state, language: action.payload };
    
    case actionTypes.SET_TEACHING_MEDIUM:
      return { ...state, teachingMedium: action.payload };
    
    case actionTypes.SET_GRADE:
      return { ...state, currentGrade: action.payload };
    
    case actionTypes.SET_CURRICULUM:
      return { ...state, curriculum: action.payload };
    
    case actionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
    
    case actionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) => notification.id !== action.payload
        ),
      };
    
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Context provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('sahayak_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: actionTypes.LOGIN_SUCCESS, payload: user });
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('sahayak_user');
      }
    }
  }, []);

  // Action creators
  const actions = {
    setLoading: (loading) => dispatch({ type: actionTypes.SET_LOADING, payload: loading }),
    setError: (error) => dispatch({ type: actionTypes.SET_ERROR, payload: error }),
    clearError: () => dispatch({ type: actionTypes.CLEAR_ERROR }),
    login: (userData) => {
      localStorage.setItem('sahayak_user', JSON.stringify(userData));
      dispatch({ type: actionTypes.LOGIN_SUCCESS, payload: userData });
    },
    logout: () => dispatch({ type: actionTypes.LOGOUT }),
    updateProfile: (profileData) => {
      dispatch({ type: actionTypes.UPDATE_PROFILE, payload: profileData });
    },
    setLanguage: (language) => dispatch({ type: actionTypes.SET_LANGUAGE, payload: language }),
    setTeachingMedium: (medium) => dispatch({ type: actionTypes.SET_TEACHING_MEDIUM, payload: medium }),
    setGrade: (grade) => dispatch({ type: actionTypes.SET_GRADE, payload: grade }),
    setCurriculum: (curriculum) => dispatch({ type: actionTypes.SET_CURRICULUM, payload: curriculum }),
    addNotification: (notification) => {
      const notificationWithId = {
        ...notification,
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
      };
      dispatch({ type: actionTypes.ADD_NOTIFICATION, payload: notificationWithId });
    },
    removeNotification: (id) => dispatch({ type: actionTypes.REMOVE_NOTIFICATION, payload: id }),
  };

  const value = {
    ...state,
    ...actions,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;