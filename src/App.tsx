import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '@/context/AppProvider';
import { AppRoutes } from '@/routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter basename ="/VFSTR-bus-pass">
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
