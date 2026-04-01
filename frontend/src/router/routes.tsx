import { RouteObject } from 'react-router-dom';
import { RouteHandle } from '@/types/route';
import { PrivateLayout, PublicLayout } from '@/layout';
import { Login } from '@/pages/public/login';
import { Home } from '@/pages/private/home';
import { NotFound } from '@/pages/private/not-found';
import { Register } from '@/pages/public/register';
import { About } from '@/pages/private/about';
import { Profile } from '@/pages/private/profile';
import { Settings } from '@/pages/private/settings';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        path: 'login',
        handle: { meta: { title: 'Login', hideInSitemap: true, hideInBreadcrumb: true } } satisfies RouteHandle,
        element: <Login />
      },
      {
        path: 'register',
        handle: {
          meta: { title: 'Kayıt ol', hideInSitemap: true, hideInBreadcrumb: true }
        } satisfies RouteHandle,
        element: <Register />
      }
    ]
  },
  {
    path: '/',
    element: <PrivateLayout />,
    handle: { meta: { title: 'Anasayfa' } } satisfies RouteHandle,
    children: [
      {
        index: true,
        element: <Home />,
        handle: { meta: { title: '', hideInSitemap: true, hideInBreadcrumb: true } } satisfies RouteHandle
      },
      {
        path: 'about',
        handle: { meta: { title: 'Hakkında' } } satisfies RouteHandle,
        children: [
          {
            index: true,
            element: <About />,
            handle: { meta: { title: '', hideInSitemap: true, hideInBreadcrumb: true } } satisfies RouteHandle
          },
          {
            path: 'profile',
            element: <Profile />,
            handle: { meta: { title: 'Profil' } } satisfies RouteHandle
          }
        ]
      },
      {
        path: 'settings',
        element: <Settings />,
        handle: { meta: { title: 'Ayarlar' } } satisfies RouteHandle
      }
    ]
  },
  {
    path: '*',
    element: <NotFound />,
    handle: {
      meta: { title: '404 - Sayfa Bulunamadı', hideInSitemap: true, hideInBreadcrumb: true }
    } satisfies RouteHandle
  }
];
