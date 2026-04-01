import { RouteHandle } from '@/types/route';
import { useMatches } from 'react-router-dom';

export function useBreadcrumbs() {
  const matches = useMatches();

  return matches
    .filter((match) => !(match.handle as RouteHandle)?.meta?.hideInBreadcrumb)
    .map((match) => ({
      path: match.pathname,
      label: (match.handle as RouteHandle).meta.title
    }));
}
