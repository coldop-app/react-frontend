import { createFileRoute } from '@tanstack/react-router';
import PaymentHistoryPage from '@/components/daybook/payment-history';

export const Route = createFileRoute('/_authenticated/store-admin/payment-history')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PaymentHistoryPage />;
}
