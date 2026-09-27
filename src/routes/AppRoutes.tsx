import React from 'react';
import { useRoutes } from 'react-router-dom';
import { publicRoutes } from './public.routes';
import { authRoutes } from './auth.routes';
import { studentRoutes } from './student.routes';
import { facultyRoutes } from './faculty.routes';
import { driverRoutes } from './driver.routes';
import { adminRoutes } from './admin.routes';
import { errorRoutes } from './error.routes';

export const AppRoutes: React.FC = () => {
  const routes = useRoutes([
    publicRoutes,
    authRoutes,
    studentRoutes,
    facultyRoutes,
    driverRoutes,
    adminRoutes,
    ...errorRoutes,
  ]);

  return routes;
};
