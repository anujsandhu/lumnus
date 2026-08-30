import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDye17iP_t7bH88LsDN-vZNqMWIWJlcTHk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lumnus-web.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lumnus-web",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lumnus-web.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "168856390325",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:168856390325:web:90b7a3f06d1d36270c8cfc",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-4ZSCSNBJ3K"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail };
