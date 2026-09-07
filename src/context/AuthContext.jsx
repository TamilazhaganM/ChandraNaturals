import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Saved active user session
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('chandra_active_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Restore session from backend on startup
  useEffect(() => {
    const restoreSession = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('chandra_active_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session verification failed, logging out:', err.message);
          // Token expired or invalid
          api.setToken(null);
          setUser(null);
          localStorage.removeItem('chandra_active_user');
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  // Sync user state to localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('chandra_active_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('chandra_active_user');
      }
    } catch (e) {
      console.warn('Could not save user session', e);
    }
  }, [user]);

  // Register function - creates user and triggers OTP
  const register = async ({ name, email, phone, password }) => {
    try {
      const res = await authAPI.register({ name, email, phone, password });
      return {
        success: true,
        message: res.message || 'Verification code sent',
        requiresVerification: true,
        data: res.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Registration failed. Please check your details.'
      };
    }
  };

  // Verify OTP function - completes verification & signs user in
  const verifyOTP = async ({ identifier, otp, purpose = 'registration' }) => {
    try {
      const res = await authAPI.verifyOTP({ identifier, otp, purpose });
      if (res.data?.accessToken) {
        api.setToken(res.data.accessToken);
      }
      if (res.data?.user) {
        setUser(res.data.user);
      }
      return {
        success: true,
        message: res.message,
        user: res.data?.user,
        data: res.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Invalid or expired OTP code.'
      };
    }
  };

  // Resend OTP function
  const resendOTP = async ({ identifier, purpose = 'registration' }) => {
    try {
      const res = await authAPI.resendOTP({ identifier, purpose });
      return {
        success: true,
        message: res.message || 'A new verification code has been dispatched.'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Unable to resend OTP. Please wait a moment.'
      };
    }
  };

  // Login function
  const login = async ({ identifier, password }) => {
    try {
      const res = await authAPI.login({ identifier, password });
      if (res.data?.accessToken) {
        api.setToken(res.data.accessToken);
      }
      if (res.data?.user) {
        setUser(res.data.user);
      }
      return {
        success: true,
        message: res.message,
        user: res.data?.user
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Invalid credentials. Please try again.',
        errorCode: error.errorCode,
        data: error.data
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      // ignore network errors on logout
    }
    api.setToken(null);
    setUser(null);
    localStorage.removeItem('chandra_active_user');
  };

  // Update profile with backend synchronization
  const updateProfile = async (updatedData) => {
    try {
      const res = await authAPI.updateProfile(updatedData);
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('chandra_active_user', JSON.stringify(res.data.user));
      }
      return {
        success: true,
        message: res.message || 'Profile updated successfully!',
        user: res.data?.user
      };
    } catch (error) {
      // Fallback local update if network issue
      setUser(prev => ({ ...prev, ...updatedData }));
      return {
        success: false,
        message: error.message || 'Could not save profile updates to server.'
      };
    }
  };

  // Change password function
  const changePassword = async ({ currentPassword, newPassword }) => {
    try {
      const res = await authAPI.changePassword({ currentPassword, newPassword });
      if (res.data?.accessToken) {
        api.setToken(res.data.accessToken);
      }
      return {
        success: true,
        message: res.message || 'Password updated successfully!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to change password. Please check your current password.'
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        register,
        verifyOTP,
        resendOTP,
        login,
        logout,
        updateProfile,
        changePassword
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

export default AuthContext;
