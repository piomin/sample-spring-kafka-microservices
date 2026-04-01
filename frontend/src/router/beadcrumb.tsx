import { Link } from 'react-router-dom';
import { useBreadcrumbs } from './use-breadcrumb';

export function Breadcrumb() {
  const breadcrumbs = useBreadcrumbs();

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li key={crumb.path + index} className="flex items-center gap-2">
              {isLast ? (
                <span className="font-medium text-gray-900 dark:text-gray-100" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <>
                  <Link
                    to={crumb.path}
                    className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-150"
                  >
                    {crumb.label}
                  </Link>
                  <span aria-hidden="true">&gt;</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
