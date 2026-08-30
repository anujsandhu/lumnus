import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import {
  auth, googleProvider,
  signInWithPopup, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, sendPasswordResetEmail
} from '../firebase';
import { fetchSignInMethodsForEmail, linkWithCredential, EmailAuthProvider } from 'firebase/auth';

const AuthContext = createContext(null);

export function getAuthErrorMessage(err) {
  if (!err) return 'An unexpected error occurred. Please try again.';

  if (err.response?.data?.message) {
    return err.response.data.message;
  }

  const code = err.code || (typeof err.message === 'string' && err.message.match(/\((auth\/[^)]+)\)/)?.[1]);

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please log in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please check your credentials and try again.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Access to this account has been temporarily disabled. Try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email using a different sign-in method.';
    default:
      if (err.message && typeof err.message === 'string') {
        const cleanMessage = err.message
          .replace(/^Firebase:\s*/i, '')
          .replace(/\s*\(auth\/[^)]+\)\.?$/i, '')
          .trim();
        return cleanMessage || 'Authentication failed. Please try again.';
      }
      return 'Authentication failed. Please try again.';
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ac_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data))
      .catch((err) => {
        // Only clear token on actual auth failures (401/403), not network errors
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('ac_token');
        }
        // Network errors are silently ignored — user stays "logged out" UI
        // but token is preserved for retry on next navigation
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseIdToken = await userCredential.user.getIdToken();
      const res = await api.post('/auth/firebase-login', { token: firebaseIdToken });
      localStorage.setItem('ac_token', res.data.token);
      setUser(res.data);
      return res.data;
    } catch (err) {
      if (
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found'
      ) {
        try {
          const methods = await fetchSignInMethodsForEmail(auth, email);
          if (methods.includes('google.com') && !methods.includes('password')) {
            throw new Error('This email is linked to Google Sign-In. Please use the "Continue with Google" button.');
          }
        } catch (checkErr) {
          if (checkErr.message.includes('Google Sign-In')) {
            throw checkErr;
          }
        }
      }
      throw new Error(getAuthErrorMessage(err));
    }
  };

  const loginWithGoogle = async (role) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseIdToken = await result.user.getIdToken();
      const res = await api.post('/auth/firebase-login', { token: firebaseIdToken, role });

      // Backend signals that this is a new user and needs a role selection
      if (res.status === 202 && res.data?.needsRole) {
        const err = new Error('NEEDS_ROLE');
        err.needsRole = true;
        err.firebaseIdToken = firebaseIdToken;
        throw err;
      }

      localStorage.setItem('ac_token', res.data.token);
      setUser(res.data);
      return res.data;
    } catch (err) {
      if (err.needsRole) throw err;
      throw new Error(getAuthErrorMessage(err));
    }
  };

  const loginWithGoogleAndRole = async (firebaseIdToken, role, batch) => {
    try {
      const res = await api.post('/auth/firebase-login', { token: firebaseIdToken, role, batch });
      localStorage.setItem('ac_token', res.data.token);
      setUser(res.data);
      return res.data;
    } catch (err) {
      throw new Error(getAuthErrorMessage(err));
    }
  };

  const register = async (payload) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, payload.email, payload.password);
      const firebaseIdToken = await userCredential.user.getIdToken();
      const res = await api.post('/auth/firebase-register', {
        token: firebaseIdToken,
        name: payload.name,
        role: payload.role,
        batch: payload.batch,
        branch: payload.branch,
        company: payload.company
      });
      localStorage.setItem('ac_token', res.data.token);
      setUser(res.data);
      return res.data;
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        try {
          const methods = await fetchSignInMethodsForEmail(auth, payload.email);
          if (methods.includes('google.com')) {
            const googleResult = await signInWithPopup(auth, googleProvider);
            const credential = EmailAuthProvider.credential(payload.email, payload.password);
            await linkWithCredential(googleResult.user, credential);
            const firebaseIdToken = await googleResult.user.getIdToken();
            const res = await api.post('/auth/firebase-register', {
              token: firebaseIdToken,
              name: payload.name,
              role: payload.role,
              batch: payload.batch,
              branch: payload.branch,
              company: payload.company
            });
            localStorage.setItem('ac_token', res.data.token);
            setUser(res.data);
            return res.data;
          }
        } catch (linkErr) {
          throw new Error('This email is already registered. Try logging in instead.');
        }
        throw new Error('An account with this email address already exists. Try logging in instead.');
      }
      throw new Error(getAuthErrorMessage(err));
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Firebase signOut error', err);
    }
    localStorage.removeItem('ac_token');
    setUser(null);
  };

  const resetPassword = async (email) => {
    try {
      try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.length > 0 && methods.includes('google.com') && !methods.includes('password')) {
          throw new Error('This account uses Google Sign-In and has no password. Please use the "Continue with Google" button to log in.');
        }
      } catch (checkErr) {
        if (checkErr.message.includes('Google Sign-In')) throw checkErr;
      }
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      throw new Error(getAuthErrorMessage(err));
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, loginWithGoogle, loginWithGoogleAndRole, register, logout, resetPassword, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);


