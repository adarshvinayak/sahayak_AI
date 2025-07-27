import React, { createContext, useContext, useEffect, useState } from 'react';
// Temporarily comment out Firebase imports for testing
// import { onAuthStateChangedListener, signOutUser } from '../firebase';

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock authentication functions
const mockSignOut = async () => {
  // Simulate async operation
  return new Promise(resolve => setTimeout(resolve, 100));
};

const mockAuthStateListener = (callback) => {
  // Simulate Firebase auth state listener
  const mockUser = {
    uid: 'mock-user-id',
    email: 'teacher@school.com',
    displayName: 'Priya Sharma'
  };
  
  // Call callback immediately with mock user
  callback(mockUser);
  
  // Return unsubscribe function
  return () => {};
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = mockAuthStateListener((user) => {
      setCurrentUser(user);
      
      if (user) {
        // Check if user has completed profile setup
        const storedProfile = localStorage.getItem(`sahayak_profile_${user.uid}`);
        if (storedProfile) {
          setUserProfile(JSON.parse(storedProfile));
        } else {
          // Set a default profile for testing
          const defaultProfile = {
            firstName: 'Priya',
            lastName: 'Sharma',
            phoneNumber: '9876543210',
            teachingGrades: [2, 8, 9],
            primaryGrade: 2,
            schoolName: 'Government Primary School',
            district: 'Rajgarh',
            state: 'Madhya Pradesh',
            profileCompleted: true
          };
          setUserProfile(defaultProfile);
          localStorage.setItem(`sahayak_profile_${user.uid}`, JSON.stringify(defaultProfile));
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  const logout = async () => {
    try {
      await mockSignOut();
      setCurrentUser(null);
      setUserProfile(null);
      // Clear stored profile
      localStorage.removeItem(`sahayak_profile_${currentUser?.uid}`);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const completeProfile = (profile) => {
    setUserProfile(profile);
    if (currentUser) {
      localStorage.setItem(`sahayak_profile_${currentUser.uid}`, JSON.stringify(profile));
    }
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    profileCompleted: !!userProfile,
    loading,
    logout,
    completeProfile,
    // User info for compatibility with existing code
    user: userProfile || (currentUser ? {
      firstName: currentUser.displayName?.split(' ')[0] || 'Teacher',
      lastName: currentUser.displayName?.split(' ')[1] || '',
      email: currentUser.email,
      uid: currentUser.uid,
      profileCompleted: false,
      teachingGrades: [],
      schoolName: 'Your School',
      district: 'Your District',
      phoneNumber: 'Not provided'
    } : null)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 