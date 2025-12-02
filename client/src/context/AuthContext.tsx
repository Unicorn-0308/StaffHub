import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useApolloClient } from '@apollo/client';
import { LOGIN, REGISTER } from '../graphql/mutations';
import { GET_ME } from '../graphql/queries';
import toast from 'react-hot-toast';

// Types
export type Role = 'ADMIN' | 'EMPLOYEE';

export interface User {
  id: string;
  email: string;
  role: Role;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  } | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, role?: Role) => Promise<boolean>;
  logout: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token storage key
const TOKEN_KEY = 'staffhub_token';

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const client = useApolloClient();

  // Mutations
  const [loginMutation] = useMutation(LOGIN);
  const [registerMutation] = useMutation(REGISTER);

  // Check for existing session
  const { data: meData, loading: meLoading } = useQuery(GET_ME, {
    skip: !localStorage.getItem(TOKEN_KEY),
    onError: () => {
      localStorage.removeItem(TOKEN_KEY);
      setIsLoading(false);
    },
  });

  // Update user when me query returns
  useEffect(() => {
    if (meData?.me) {
      setUser(meData.me);
    }
    if (!meLoading) {
      setIsLoading(false);
    }
  }, [meData, meLoading]);

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, errors } = await loginMutation({
        variables: { input: { email, password } },
      });

      if (errors?.length) {
        toast.error(errors[0].message);
        return false;
      }

      if (data?.login) {
        localStorage.setItem(TOKEN_KEY, data.login.token);
        setUser(data.login.user);
        toast.success(`Welcome back, ${data.login.user.employee?.firstName || data.login.user.email}!`);
        return true;
      }

      return false;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
      return false;
    }
  }, [loginMutation]);

  // Register function
  const register = useCallback(async (
    email: string, 
    password: string, 
    role: Role = 'EMPLOYEE'
  ): Promise<boolean> => {
    try {
      const { data, errors } = await registerMutation({
        variables: { input: { email, password, role } },
      });

      if (errors?.length) {
        toast.error(errors[0].message);
        return false;
      }

      if (data?.register) {
        localStorage.setItem(TOKEN_KEY, data.register.token);
        setUser(data.register.user);
        toast.success('Account created successfully!');
        return true;
      }

      return false;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
      return false;
    }
  }, [registerMutation]);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    client.resetStore();
    toast.success('Logged out successfully');
  }, [client]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

