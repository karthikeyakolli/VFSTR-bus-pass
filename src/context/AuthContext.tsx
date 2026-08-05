import React, { createContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { AuthService } from '@/services/AuthService';

export interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: UserRole, identifier: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  requestPasswordReset: (identifier: string) => Promise<{ success: boolean; error?: string }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('vfstr-user-session') ?? sessionStorage.getItem('vfstr-user-session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.user || null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [role, setRole] = useState<UserRole | null>(() => user?.role ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setRole(user?.role ?? null);
  }, [user]);

  // Validate session on app initialization
  useEffect(() => {
    const validateSession = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch {
        // Fallback to local session
      } finally {
        setIsLoading(false);
      }
    };
    validateSession();
  }, []);

  const login = useCallback(async (newRole: UserRole, identifier: string, rememberMe = true): Promise<boolean> => {
    const response = await AuthService.login({ identifier, role: newRole });

    if (response.user) {
      setUser(response.user);
      setRole(response.user.role);

      const sessionPayload = JSON.stringify({ user: response.user });
      if (rememberMe) {
        localStorage.setItem('vfstr-user-session', sessionPayload);
      } else {
        sessionStorage.setItem('vfstr-user-session', sessionPayload);
      }
      return true;
    }

    return false;
  }, []);

  const logout = useCallback(() => {
    AuthService.logout();
    setUser(null);
    setRole(null);
    localStorage.removeItem('vfstr-user-session');
    sessionStorage.removeItem('vfstr-user-session');
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    return AuthService.updatePassword(newPassword);
  }, []);

  const requestPasswordReset = useCallback(async (identifier: string) => {
    return AuthService.requestPasswordReset(identifier);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        logout,
        updatePassword,
        requestPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
