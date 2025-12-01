import { createRootRoute, Outlet } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { queryClient } from '@/lib/queryClient';
import { Toaster } from '@/components/ui/sonner';

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <div className="app-container">
          {/* Outlet renders the matched route */}
          <main>
            <Outlet />
          </main>
        </div>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  ),
});
