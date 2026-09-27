import React, { Suspense, lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';

const HomePage = lazy(() => import('@/pages/public/HomePage').then(m => ({ default: m.HomePage })));
const PublicRoutesPage = lazy(() => import('@/pages/public').then(m => ({ default: m.PublicRoutesPage })));
const FeeStructurePage = lazy(() => import('@/pages/public').then(m => ({ default: m.FeeStructurePage })));
const HelpPage = lazy(() => import('@/pages/help/HelpPage').then(m => ({ default: m.HelpPage })));
const LiveNavigationPage = lazy(() => import('@/pages/navigation/LiveNavigationPage').then(m => ({ default: m.LiveNavigationPage })));
const ParentTrackingPage = lazy(() => import('@/pages/parent/ParentTrackingPage').then(m => ({ default: m.ParentTrackingPage })));
const ConductorScannerPage = lazy(() => import('@/pages/conductor/ConductorScannerPage').then(m => ({ default: m.ConductorScannerPage })));
const GuestPassPage = lazy(() => import('@/pages/public/GuestPassPage').then(m => ({ default: m.GuestPassPage })));
const LostAndFoundPage = lazy(() => import('@/pages/help/LostAndFoundPage').then(m => ({ default: m.LostAndFoundPage })));

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
    { path: '/fee-structure', element: <Suspense fallback={<SuspenseFallback />}><FeeStructurePage /></Suspense> },
    { path: '/navigation', element: <Suspense fallback={<SuspenseFallback />}><LiveNavigationPage /></Suspense> },
    { path: '/live-navigation', element: <Suspense fallback={<SuspenseFallback />}><LiveNavigationPage /></Suspense> },
    { path: '/parent', element: <Suspense fallback={<SuspenseFallback />}><ParentTrackingPage /></Suspense> },
    { path: '/parent/tracking', element: <Suspense fallback={<SuspenseFallback />}><ParentTrackingPage /></Suspense> },
    { path: '/conductor', element: <Suspense fallback={<SuspenseFallback />}><ConductorScannerPage /></Suspense> },
    { path: '/security/scanner', element: <Suspense fallback={<SuspenseFallback />}><ConductorScannerPage /></Suspense> },
    { path: '/guest-pass', element: <Suspense fallback={<SuspenseFallback />}><GuestPassPage /></Suspense> },
    { path: '/lost-and-found', element: <Suspense fallback={<SuspenseFallback />}><LostAndFoundPage /></Suspense> },
    { path: '/help', element: <Suspense fallback={<SuspenseFallback />}><HelpPage /></Suspense> },
  ],
};


