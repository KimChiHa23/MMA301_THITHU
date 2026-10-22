import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  registerUser,
  loginUser,
  logoutUser,
  subscribeAuthState,
} from '../services/authService';
import { mapFirebaseAuthError } from '../utils/validation';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    // Lắng nghe thay đổi auth state từ Firebase
    const unsubscribe = subscribeAuthState((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setAuthError('');
    try {
      const userCredential = await loginUser(email, password);
      setUser(userCredential.user);
      return { success: true, user: userCredential.user };
    } catch (error) {
      const errorMsg = mapFirebaseAuthError(error);
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const register = async (email, password) => {
    setAuthError('');
    try {
      const userCredential = await registerUser(email, password);
      // Giữ user state hoặc cho phép UI hiển thị testID="form-success"
      return { success: true, user: userCredential.user };
    } catch (error) {
      const errorMsg = mapFirebaseAuthError(error);
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    setAuthError('');
    try {
      await logoutUser();
      setUser(null);
      return { success: true };
    } catch (error) {
      const errorMsg = mapFirebaseAuthError(error);
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const clearAuthError = () => {
    setAuthError('');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        setAuthError,
        clearAuthError,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
