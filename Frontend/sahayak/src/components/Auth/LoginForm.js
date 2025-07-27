import React, { useState } from 'react';
// Temporarily comment out Firebase imports for testing
// import { signInWithGooglePopup, signInWithEmail, createUserWithEmail } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

// Mock authentication functions
const mockSignInWithGooglePopup = async () => {
  // Simulate Google sign in
  return new Promise(resolve => setTimeout(resolve, 1000));
};

const mockSignInWithEmail = async (email, password) => {
  // Simulate email sign in
  return new Promise(resolve => setTimeout(resolve, 1000));
};

const mockCreateUserWithEmail = async (email, password) => {
  // Simulate user creation
  return new Promise(resolve => setTimeout(resolve, 1000));
};

const LoginForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { currentUser, completeProfile } = useAuth();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      await mockSignInWithGooglePopup();
      
      // Create a mock user profile and complete the setup
      const mockProfile = {
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
      
      // Complete the profile setup to move to the dashboard
      completeProfile(mockProfile);
      
    } catch (error) {
      setError('Failed to sign in with Google. Please try again.');
      console.error('Google sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    
    if (isSignUp && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      if (isSignUp) {
        await mockCreateUserWithEmail(formData.email, formData.password);
      } else {
        await mockSignInWithEmail(formData.email, formData.password);
      }
      
      // Create a mock user profile and complete the setup
      const mockProfile = {
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
      
      // Complete the profile setup to move to the dashboard
      completeProfile(mockProfile);
      
    } catch (error) {
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password');
          break;
        case 'auth/email-already-in-use':
          setError('An account with this email already exists');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/weak-password':
          setError('Password is too weak');
          break;
        default:
          setError('Authentication failed. Please try again.');
      }
      console.error('Email auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (currentUser) {
    return null; // Will be handled by App.js routing
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-white">🎓</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isSignUp ? 'Join Sahayak' : 'Welcome to Sahayak'}
          </h1>
          <p className="text-gray-600">Your Multi-Grade Teaching Assistant</p>
          <p className="text-sm text-orange-600 mt-2">⚠️ Using Mock Authentication for Testing</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'Signing in...' : `Continue with Google (Mock)`}
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="teacher@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          {isSignUp && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm your password"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Please wait...' : (isSignUp ? 'Create Account (Mock)' : 'Sign In (Mock)')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setFormData({ email: '', password: '', confirmPassword: '' });
            }}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            {isSignUp 
              ? 'Already have an account? Sign in' 
              : "Don't have an account? Sign up"
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm; 