import React, { createContext, useState, useCallback } from 'react';

export interface NavigationContextType {
  isSidebarCollapsed: boolean;
  isMobileDrawerOpen: boolean;
  toggleSidebarCollapse: () => void;
  openMobileDrawer: () => void;
  closeMobileDrawer: () => void;
}

export const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const toggleSidebarCollapse = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev);
  }, []);

  const openMobileDrawer = useCallback(() => {
    setIsMobileDrawerOpen(true);
  }, []);

  const closeMobileDrawer = useCallback(() => {
    setIsMobileDrawerOpen(false);
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        isSidebarCollapsed,
        isMobileDrawerOpen,
        toggleSidebarCollapse,
        openMobileDrawer,
        closeMobileDrawer,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};
