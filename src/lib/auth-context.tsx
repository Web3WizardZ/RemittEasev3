// src/lib/auth-context.tsx
'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface User {
  id: string;
  name?: string;
  email?: string;
  walletAddress: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((userData: User) => {
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call logout API endpoint
      await fetch('/api/auth/login', {
        method: 'DELETE',
      });
      
      // Clear user data
      setUser(null);
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  // Initialize auth state from session if available
  React.useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await fetch('/api/auth/login');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.session) {
            setUser(data.session);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      }
    };

    initAuth();
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}