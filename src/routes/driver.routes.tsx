import { Suspense, lazy } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicLayout } from '@/layouts/PublicLayout';

const DriverDashboardPage = lazy(() =>
  import('@/pages/driver/DriverDashboardPage').then((m) => ({ default: m.DriverDashboardPage }))
);
const LiveNavigationPage = lazy(() =>
  import('@/pages/navigation/LiveNavigationPage').then((m) => ({ default: m.LiveNavigationPage }))
);

const SuspenseFallback = () => (
  <div className="flex min-h-[400px] w-full items-center justify-center p-8">
    <div className="flex flex-col items-center gap-3 text-slate-500">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <span className="text-xs font-semibold">Loading driver console...</span>
    </div>
  </div>
);

export const driverRoutes: RouteObject = {
  element: <ProtectedRoute allowedRoles={['driver', 'admin', 'superadmin']} />,
  children: [
    {
      element: <PublicLayout />,
      children: [
        {
          path: '/driver',
          element: <Navigate to="/driver/dashboard" replace />,
        },
        {
          path: '/driver/dashboard',
          element: (
            <Suspense fallback={<SuspenseFallback />}>
              <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <DriverDashboardPage />
              </div>
            </Suspense>
          ),
        },
        {
          path: '/driver/navigation',
          element: (
            <Suspense fallback={<SuspenseFallback />}>
              <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <LiveNavigationPage />
              </div>
            </Suspense>
          ),
        },
      ],
    },
  ],
};
