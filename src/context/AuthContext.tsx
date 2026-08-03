import React, { createContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole } from '@/types';

export interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (role: UserRole, identifier: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
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

  // Role is always derived from the authenticated user — never defaults to a role
  const [role, setRole] = useState<UserRole | null>(() => user?.role ?? null);

  useEffect(() => {
    setRole(user?.role ?? null);
  }, [user]);

  const login = useCallback(async (newRole: UserRole, identifier: string, rememberMe = true): Promise<boolean> => {
    // Simulate network latency for authenticating
    await new Promise((resolve) => setTimeout(resolve, 800));

    let newUser: User;

    if (newRole === 'admin') {
      newUser = {
        id: 'adm_1042',
        name: 'Dr. M. R. K. Murthy',
        email: 'transport.officer@vignan.ac.in',
        role: 'admin',
      };
    } else {
      newUser = {
        id: 'usr_04001',
        name: 'K. S. V. Prasad',
        email: `${identifier.toLowerCase()}@vignan.ac.in`,
        role: 'student',
      };
    }

    setUser(newUser);
    setRole(newRole);

    const sessionPayload = JSON.stringify({ user: newUser, token: 'mock-jwt-token-2026' });
    if (rememberMe) {
      localStorage.setItem('vfstr-user-session', sessionPayload);
    } else {
      sessionStorage.setItem('vfstr-user-session', sessionPayload);
    }

    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setRole(null); // Explicitly null — not a default role
    localStorage.removeItem('vfstr-user-session');
    sessionStorage.removeItem('vfstr-user-session');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: Boolean(user),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
