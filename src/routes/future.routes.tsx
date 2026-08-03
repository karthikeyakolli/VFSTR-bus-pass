import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { StudentLayout } from '@/layouts/StudentLayout';
import { LiveTrackingPlaceholderPage } from '@/pages';

export const futureRoutes: RouteObject = {
  element: <ProtectedRoute allowedRoles={['student', 'admin', 'superadmin']} />,
  children: [
    {
      element: <StudentLayout />,
      children: [
        { path: '/tracking/live', element: <LiveTrackingPlaceholderPage /> },
      ],
    },
  ],
};
