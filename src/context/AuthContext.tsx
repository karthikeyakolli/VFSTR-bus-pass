import React, { createContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { AuthService } from '@/services/AuthService';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getDefaultPortalRoute } from '@/config/rbac.config';

export interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: UserRole, identifier: string, rememberMe?: boolean, password?: string) => Promise<boolean>;
  switchRole: (role: UserRole) => Promise<boolean>;
  logout: () => void;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  requestPasswordReset: (identifier: string) => Promise<{ success: boolean; error?: string }>;
  portalPath: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('vfstr-user-session') ?? 
                  sessionStorage.getItem('vfstr-user-session') ??
                  localStorage.getItem('vfstr_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.user ? parsed.user : parsed;
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

  // Validate session on app initialization & attach real-time auth state subscription
  useEffect(() => {
    const validateSession = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setRole(currentUser.role);
        }
      } catch {
        // Fallback to local session
      } finally {
        setIsLoading(false);
      }
    };
    validateSession();

    if (isSupabaseConfigured) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setRole(null);
          localStorage.removeItem('vfstr-user-session');
          localStorage.removeItem('vfstr_current_user');
          sessionStorage.removeItem('vfstr-user-session');
        } else if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          const currentUser = await AuthService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setRole(currentUser.role);
          }
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const login = useCallback(
    async (newRole: UserRole, identifier: string, rememberMe = true, password?: string): Promise<boolean> => {
      const response = await AuthService.login({ identifier, password, role: newRole });

      if (response.user) {
        setUser(response.user);
        setRole(response.user.role);

        const sessionPayload = JSON.stringify({ user: response.user });
        if (rememberMe) {
          localStorage.setItem('vfstr-user-session', sessionPayload);
        } else {
          sessionStorage.setItem('vfstr-user-session', sessionPayload);
        }
        localStorage.setItem('vfstr_current_user', JSON.stringify(response.user));
        return true;
      }

      return false;
    },
    []
  );

  const switchRole = useCallback(async (targetRole: UserRole): Promise<boolean> => {
    try {
      const switchedUser = await AuthService.switchDemoRole(targetRole);
      setUser(switchedUser);
      setRole(switchedUser.role);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    AuthService.logout();
    setUser(null);
    setRole(null);
    localStorage.removeItem('vfstr-user-session');
    localStorage.removeItem('vfstr_current_user');
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
        switchRole,
        logout,
        updatePassword,
        requestPasswordReset,
        portalPath: getDefaultPortalRoute(role),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
