import { RouteObject } from 'react-router-dom';
import { RouteHandle } from '@/types/route';

export interface SitemapNode {
  path: string;
  title: string;
  children?: SitemapNode[];
}

function getMeta(route: RouteObject) {
  return (route.handle as RouteHandle)?.meta;
}

function buildSitemap(routes: RouteObject[], parentPath = ''): SitemapNode[] {
  const nodes: SitemapNode[] = [];

  for (const route of routes) {
    const meta = getMeta(route);

    // index route'ları veya hideInSitemap olanları atla
    if (route.index || meta?.hideInSitemap) {
      continue;
    }

    // path yoksa (layout wrapper) sadece children'ı işle
    if (!route.path) {
      if (route.children) {
        nodes.push(...buildSitemap(route.children, parentPath));
      }
      continue;
    }

    // Absolute path mi, relative mi?
    const isAbsolute = route.path.startsWith('/');
    const fullPath = isAbsolute ? route.path : `${parentPath}/${route.path}`.replace(/\/+/g, '/');

    // Eğer path '/' ise sadece children'a bak (layout wrapper gibi davran)
    if (route.path === '/') {
      if (route.children) {
        nodes.push(...buildSitemap(route.children, fullPath));
      }
      continue;
    }

    const children = route.children ? buildSitemap(route.children, fullPath) : undefined;

    nodes.push({
      path: fullPath,
      title: meta?.title ?? route.path,
      ...(children?.length ? { children } : {})
    });
  }

  return nodes;
}

export function generateSitemap(routes: RouteObject[]): SitemapNode[] {
  return buildSitemap(routes);
}
