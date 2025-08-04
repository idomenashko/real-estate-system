import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (token) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('שגיאה בבדיקת אימות:', error);
        localStorage.removeItem('token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [token]);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const { user: userData, token: newToken } = response;
      
      setUser(userData);
      setToken(newToken);
      localStorage.setItem('token', newToken);
      
      return { success: true };
    } catch (error) {
      console.error('שגיאה בהתחברות:', error);
      return { 
        success: false, 
        error: error.response?.data?.error?.message || 'שגיאה בהתחברות' 
      };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      const { user: newUser, token: newToken } = response;
      
      setUser(newUser);
      setToken(newToken);
      localStorage.setItem('token', newToken);
      
      return { success: true };
    } catch (error) {
      console.error('שגיאה בהרשמה:', error);
      return { 
        success: false, 
        error: error.response?.data?.error?.message || 'שגיאה בהרשמה' 
      };
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      console.error('שגיאה בעדכון פרופיל:', error);
      throw { 
        error: error.response?.data?.error?.message || 'שגיאה בעדכון פרופיל' 
      };
    }
  };

  // Update user preferences
  const updatePreferences = async (preferences) => {
    try {
      const updatedUser = await authService.updatePreferences(preferences);
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      console.error('שגיאה בעדכון העדפות:', error);
      throw { 
        error: error.response?.data?.error?.message || 'שגיאה בעדכון העדפות' 
      };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authService.changePassword(currentPassword, newPassword);
      return { success: true };
    } catch (error) {
      console.error('שגיאה בשינוי סיסמה:', error);
      throw { 
        error: error.response?.data?.error?.message || 'שגיאה בשינוי סיסמה' 
      };
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  // Check if user is agent
  const isAgent = () => {
    return user?.role === 'agent';
  };

  const value = {
    user,
    loading,
    token,
    login,
    register,
    logout,
    updateProfile,
    updatePreferences,
    changePassword,
    isAdmin,
    isAgent
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 