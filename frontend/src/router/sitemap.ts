import { routes } from './routes';
import { RouteHandle, RouteMeta } from '@/types/route';

export type Sitemap = {
  path: string;
  meta: RouteMeta;
};

export function getSitemap(): Sitemap[] {
  // routes ağacını düzleştirip hideInSitemap: false olanları filtrele
  function flatten(routeList: typeof routes, parentPath = ''): { path: string; meta: RouteHandle['meta'] }[] {
    return routeList.flatMap((route) => {
      const fullPath = `${parentPath}/${route.path ?? ''}`.replace(/\/+/g, '/');
      const handle = route.handle as RouteHandle | undefined;
      const current = handle?.meta && !handle?.meta?.hideInSitemap ? [{ path: fullPath, meta: handle.meta }] : [];
      const children = route.children ? flatten(route.children, fullPath) : [];
      return [...current, ...children];
    });
  }

  return flatten(routes);
}
