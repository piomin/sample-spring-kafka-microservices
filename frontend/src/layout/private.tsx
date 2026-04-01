import { AppSidebar } from '@/components/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { Navigate, Outlet } from 'react-router-dom';

export function PrivateLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Anasayfa</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Orders</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// import { Button } from '@/components/ui/button';
// import { useAuth } from '@/hooks/use-auth';
// import { navigateTo } from '@/router';
// import { LocalStorageEnum } from '@/types';
// import { Navigate, Outlet, useLocation } from 'react-router-dom';

// export function PrivateLayout() {
//   const { isAuthenticated, isLoading } = useAuth();
//   const location = useLocation();

//   const logoutHandler = () => {
//     localStorage.removeItem(LocalStorageEnum.AccessToken);
//     navigateTo('/login');
//   };

//   if (isLoading) {
//     return <h1>Loading...</h1>;
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   return (
//     <div className="border border-green-600 p-10">
//       Private Layout<Button onClick={() => logoutHandler()}>Çıkış yap</Button>
//       <div>
//         <Outlet />
//       </div>
//     </div>
//   );
// }
