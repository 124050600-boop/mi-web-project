
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { loginUser, registerUser, updateStudent } from '../api';

interface AuthContextType {
  user: User | null;
  login: (role: UserRole, identifier: string, password?: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  updateProfile: (data: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (role: UserRole, identifier: string, password?: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await loginUser(role, identifier, password);
      setUser(userData);
      return userData;
    } catch (err: any) {
      console.error("Login failed", err);
      setError(err.message || 'Error al iniciar sesión');
      throw err; 
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any): Promise<User> => {
      setIsLoading(true);
      setError(null);
      try {
          const userData = await registerUser(data);
          setUser(userData);
          return userData;
      } catch (err: any) {
          setError(err.message || 'Error al registrarse');
          throw err;
      } finally {
          setIsLoading(false);
      }
  };

  const updateProfile = async (data: any) => {
      if(!user) return;
      setIsLoading(true);
      try {
          const updated = await updateStudent(user.id, data);
          setUser(updated);
      } catch(err: any) {
          setError(err.message);
      } finally {
          setIsLoading(false);
      }
  };

  const logout = () => {
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, updateProfile, logout, isLoading, error }}>
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
