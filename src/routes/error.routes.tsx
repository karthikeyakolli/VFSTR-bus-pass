import { RouteObject } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { NotFoundPage, UnauthorizedPage, ServerErrorPage } from '@/pages';

export const errorRoutes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      { path: '/403', element: <UnauthorizedPage /> },
      { path: '/404', element: <NotFoundPage /> },
      { path: '/500', element: <ServerErrorPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
