import React, { createContext, useState, useCallback } from 'react';

export interface UserSettings {
  emailAlerts: boolean;
  smsNotifications: boolean;
  autoRenewReminder: boolean;
  compactView: boolean;
}

export interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const defaultSettings: UserSettings = {
  emailAlerts: true,
  smsNotifications: true,
  autoRenewReminder: true,
  compactView: false,
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('vfstr-settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const updateSettings = useCallback((partial: Partial<UserSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem('vfstr-settings', JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
