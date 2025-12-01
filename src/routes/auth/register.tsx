import { createFileRoute } from '@tanstack/react-router';
import { Register } from '@/components/register';

export const Route = createFileRoute('/auth/register')({
  component: Register,
});
