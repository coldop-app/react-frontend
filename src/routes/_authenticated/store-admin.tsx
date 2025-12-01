import { createFileRoute, Outlet } from '@tanstack/react-router';
import Navbar from '@/components/navbar';
import AppSidebar from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export const Route = createFileRoute('/_authenticated/store-admin')({
  component: StoreAdminLayout,
});

function StoreAdminLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content Area */}
      <SidebarInset>
        {/* Header */}
        <Navbar />

        {/* Page Content */}
        <div className="mx-auto w-full max-w-7xl md:p-4">
          {' '}
          <Outlet />
        </div>

        {/* Footer */}
        {/* <footer className="border-t bg-background mt-auto">
          <div className="container mx-auto px-4 py-4">
            <p className="text-sm text-muted-foreground text-center">
              © 2025 COLDOP. All rights reserved.
            </p>
          </div>
        </footer> */}
      </SidebarInset>
    </SidebarProvider>
  );
}
