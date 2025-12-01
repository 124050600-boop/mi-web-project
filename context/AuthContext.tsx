import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { mockLogin } from '../services/dataService';

interface AuthContextType {
  user: User | null;
  login: (role: UserRole, email: string, accessCode?: string) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (role: UserRole, email: string, accessCode?: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await mockLogin(role, email, accessCode);
      setUser(userData);
      return userData; // Return user to allow redirection in UI
    } catch (err: any) {
      console.error("Login failed", err);
      setError(err.message || 'Error al iniciar sesión');
      throw err; 
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};