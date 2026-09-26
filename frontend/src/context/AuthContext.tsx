import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { loginUser, fetchCurrentUser, apiClient } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'dividendlens_token';
const USER_KEY = 'dividendlens_user';
const AUTH_KEY = 'dividendlens_authenticated';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(USER_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Synchronize axios Authorization header and restore authenticated user from token/API
  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (storedToken) {
        setToken(storedToken);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        try {
          const me = await fetchCurrentUser();
          if (me) {
            setUser(me);
            localStorage.setItem(USER_KEY, JSON.stringify(me));
            localStorage.setItem(AUTH_KEY, 'true');
          }
        } catch {
          // Keep existing saved user if API offline
        }
      }
      setIsLoading(false);
    }
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await loginUser(email, password);
      const authenticatedUser = data.user;
      const accessToken = data.access_token;

      setToken(accessToken);
      setUser(authenticatedUser);

      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(authenticatedUser));
      localStorage.setItem(AUTH_KEY, 'true');

      apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors during logout
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(AUTH_KEY);
      delete apiClient.defaults.headers.common['Authorization'];
    }
  };

  const isAuthenticated = Boolean(user && localStorage.getItem(AUTH_KEY) === 'true');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
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
