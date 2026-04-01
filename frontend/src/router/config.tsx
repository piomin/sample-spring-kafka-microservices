import { createBrowserRouter } from 'react-router-dom';
import { routes } from './routes';

export const router = createBrowserRouter(routes);

export const navigateTo = (path: string) => {
  router.navigate(path);
};
