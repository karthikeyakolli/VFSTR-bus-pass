import React from 'react';
import { useRoutes } from 'react-router-dom';
import { publicRoutes } from './public.routes';
import { authRoutes } from './auth.routes';
import { studentRoutes } from './student.routes';
import { errorRoutes } from './error.routes';
import { futureRoutes } from './future.routes';

export const AppRoutes: React.FC = () => {
  const routes = useRoutes([
    publicRoutes,
    authRoutes,
    studentRoutes,
    futureRoutes,
    ...errorRoutes,
  ]);

  return routes;
};
