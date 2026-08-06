import React, { Suspense, lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';

const HomePage = lazy(() => import('@/pages/public/HomePage').then(m => ({ default: m.HomePage })));
const PublicRoutesPage = lazy(() => import('@/pages/public').then(m => ({ default: m.PublicRoutesPage })));
const FeeStructurePage = lazy(() => import('@/pages/public').then(m => ({ default: m.FeeStructurePage })));
const HelpPage = lazy(() => import('@/pages/help/HelpPage').then(m => ({ default: m.HelpPage })));

const SuspenseFallback: React.FC = () => (
  <div className="flex min-h-[400px] w-full items-center justify-center p-8">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

export const publicRoutes: RouteObject = {
  element: <PublicLayout />,
  children: [
    { path: '/', element: <Suspense fallback={<SuspenseFallback />}><HomePage /></Suspense> },
    { path: '/routes', element: <Suspense fallback={<SuspenseFallback />}><PublicRoutesPage /></Suspense> },
    { path: '/fees', element: <Suspense fallback={<SuspenseFallback />}><FeeStructurePage /></Suspense> },
    { path: '/help', element: <Suspense fallback={<SuspenseFallback />}><HelpPage /></Suspense> },
  ],
};


