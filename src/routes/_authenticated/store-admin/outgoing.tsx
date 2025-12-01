import { createFileRoute } from '@tanstack/react-router';
import OutgoingOrderPage from '@/components/forms/outgoing-order';

export const Route = createFileRoute('/_authenticated/store-admin/outgoing')({
  component: Outgoing,
});

function Outgoing() {
  return <OutgoingOrderPage />;
}
