import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, isFirebaseConfigured } from '../firebaseConfig';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState(isFirebaseConfigured() ? 'firebase' : 'mock');

  useEffect(() => {
    if (authMode === 'firebase' && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
            avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.email}`
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    }
  }, [authMode]);

  const loginWithGoogle = async () => {
    if (authMode === 'firebase' && auth && googleProvider) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
      } catch (error) {
        console.error('Google sign-in error:', error);
        throw error;
      }
    } else {
      return googleSignIn();
    }
  };

  const login = async (email, password) => {
    if (authMode === 'firebase' && auth) {
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
      } catch (error) {
        console.error('Firebase login error:', error);
        throw error;
      }
    } else {
      // Mock authentication fallback
      const mockUser = {
        id: '1',
        email,
        name: email.split('@')[0],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
      };
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      return Promise.resolve(mockUser);
    }
  };

  const register = async (email, password, name) => {
    if (authMode === 'firebase' && auth) {
      try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Set display name after account creation
        if (name) {
          await updateProfile(result.user, { displayName: name });
        }
        return result.user;
      } catch (error) {
        console.error('Firebase registration error:', error);
        throw error;
      }
    } else {
      // Mock authentication fallback
      const mockUser = {
        id: '1',
        email,
        name: name || email.split('@')[0],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
      };
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      return Promise.resolve(mockUser);
    }
  };

  const logout = async () => {
    if (authMode === 'firebase' && auth) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('user');
    setUser(null);
  };

  const googleSignIn = () => {
    const mockUser = {
      id: '1',
      email: 'demo@google.com',
      name: 'Demo User',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google'
    };
    localStorage.setItem('user', JSON.stringify(mockUser));
    setUser(mockUser);
    return Promise.resolve(mockUser);
  };

  const resetPassword = async (email) => {
    if (authMode === 'firebase' && auth) {
      try {
        await sendPasswordResetEmail(auth, email);
      } catch (error) {
        console.error('Password reset error:', error);
        throw error;
      }
    } else {
      // Mock behavior
      return Promise.resolve();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, loginWithGoogle, googleSignIn, resetPassword, authMode }}>
      {children}
    </AuthContext.Provider>
  );
};