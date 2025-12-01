import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { isAuthenticated } from '@/lib/helpers';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    if (!isAuthenticated()) {
      throw redirect({
        to: '/auth/login',
        search: {
          // Use the current location to power a redirect after login
          redirect: location.href,
        },
      });
    }
  },
  component: () => <Outlet />,
});
