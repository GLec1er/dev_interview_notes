import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (firstName?: string, lastName?: string, avatarUrl?: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const userData = await authService.login({ email, password });
      setUser(userData);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Login failed';
      setError(errorMessage);
      throw err;
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setError(null);
      // Register the user
      await authService.register({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      
      // Automatically log in after registration
      const userData = await authService.login({ email, password });
      setUser(userData);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Registration failed';
      setError(errorMessage);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await authService.logout();
      setUser(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Logout failed';
      setError(errorMessage);
      throw err;
    }
  };

  const updateProfile = async (firstName?: string, lastName?: string, avatarUrl?: string) => {
    try {
      setError(null);
      const updatedUser = await authService.updateProfile({
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatarUrl,
      });
      setUser(updatedUser);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Profile update failed';
      setError(errorMessage);
      throw err;
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
