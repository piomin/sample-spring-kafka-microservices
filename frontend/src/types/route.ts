export interface RouteMeta {
  title: string;
  description?: string;
  hideInSitemap?: boolean;
  hideInBreadcrumb?: boolean;
  icon?: React.ComponentType;
}

export interface RouteHandle {
  meta: RouteMeta;
}
