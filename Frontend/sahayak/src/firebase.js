// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

// Your web app's Firebase configuration
// TODO: Replace with your actual Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "mock-api-key-for-development",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "mock-project.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "mock-project",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "mock-project.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "mock-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Authentication functions
export const signInWithGooglePopup = () => signInWithPopup(auth, googleProvider);

export const signInWithEmail = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const createUserWithEmail = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signOutUser = () => signOut(auth);

export const onAuthStateChangedListener = (callback) => onAuthStateChanged(auth, callback);

export default app; 