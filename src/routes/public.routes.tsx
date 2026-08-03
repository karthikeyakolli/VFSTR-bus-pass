import { RouteObject } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { HomePage, PublicRoutesPage, FeeStructurePage, HelpPage } from '@/pages';

export const publicRoutes: RouteObject = {
  element: <PublicLayout />,
  children: [
    { path: '/', element: <HomePage /> },
    { path: '/routes', element: <PublicRoutesPage /> },
    { path: '/fees', element: <FeeStructurePage /> },
    { path: '/help', element: <HelpPage /> },
  ],
};
