import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '@chakra-ui/react';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const toast = useToast();

  const loadUser = async () => {
    try {
      const res = await api.get('/api/auth');
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error loading user:', error);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['x-auth-token'];
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['x-auth-token'] = token;
      loadUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/api/auth', { email, password });
      localStorage.setItem('token', res.data.token);
      api.defaults.headers.common['x-auth-token'] = res.data.token;
      await loadUser();
      toast({
        title: 'Login Successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      const message = error.msg || 'An error occurred during login';
      toast({
        title: 'Login Error',
        description: message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['x-auth-token'];
    setUser(null);
    setIsAuthenticated(false);
    toast({
      title: 'Logged Out',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isLoading }}>
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

export default AuthContext;