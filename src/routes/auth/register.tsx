import { createFileRoute, redirect } from '@tanstack/react-router';
import { Register } from '@/components/register';
import { isAuthenticated } from '@/lib/helpers';

export const Route = createFileRoute('/auth/register')({
  beforeLoad: async () => {
    if (isAuthenticated()) {
      throw redirect({
        to: '/store-admin/daybook',
      });
    }
  },
  component: Register,
});
