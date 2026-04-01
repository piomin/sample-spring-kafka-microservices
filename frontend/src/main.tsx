import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { TooltipProvider } from '@/components/ui/tooltip';

export function Main() {
  return (
    <TooltipProvider>
      <RouterProvider router={router} />
    </TooltipProvider>
  );
}
