import { createFileRoute } from '@tanstack/react-router';
import IncomingOrderPage from '@/components/forms/incoming-order';

export const Route = createFileRoute('/_authenticated/store-admin/incoming')({
  component: Incoming,
});

function Incoming() {
  return <IncomingOrderPage />;
}
