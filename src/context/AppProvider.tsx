import React from 'react';
import { ThemeProvider } from './ThemeContext';
import { AuthProvider } from './AuthContext';
import { UserProvider } from './UserContext';
import { NavigationProvider } from './NavigationContext';
import { NotificationProvider } from './NotificationContext';
import { SettingsProvider } from './SettingsContext';
import { ToastProvider } from '@/components/ui/ToastProvider';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <NavigationProvider>
            <NotificationProvider>
              <SettingsProvider>
                <ToastProvider>{children}</ToastProvider>
              </SettingsProvider>
            </NotificationProvider>
          </NavigationProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
