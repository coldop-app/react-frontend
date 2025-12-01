import { createFileRoute, redirect } from '@tanstack/react-router';
import { Login } from '@/components/login';
import { isAuthenticated } from '@/lib/helpers';
import { z } from 'zod';

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute('/auth/login')({
  validateSearch: loginSearchSchema,
  beforeLoad: async () => {
    if (isAuthenticated()) {
      throw redirect({
        to: '/store-admin/daybook',
      });
    }
  },
  component: Login,
});
