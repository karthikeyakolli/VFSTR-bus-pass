import { Suspense, lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicLayout } from '@/layouts/PublicLayout';

const FacultyDashboardPage = lazy(() =>
  import('@/pages/faculty/FacultyDashboardPage').then((m) => ({ default: m.FacultyDashboardPage }))
);

const SuspenseFallback = () => (
  <div className="flex min-h-[400px] w-full items-center justify-center p-8">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

export const facultyRoutes: RouteObject = {
  element: <ProtectedRoute allowedRoles={['faculty', 'admin', 'superadmin']} />,
  children: [
    {
      element: <PublicLayout />,
      children: [
        {
          path: '/faculty',
          element: (
            <Suspense fallback={<SuspenseFallback />}>
              <div className="py-6 px-4 sm:px-6 lg:px-8">
                <FacultyDashboardPage />
              </div>
            </Suspense>
          ),
        },
      ],
    },
  ],
};
