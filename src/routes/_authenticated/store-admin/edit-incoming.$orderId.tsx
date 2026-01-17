import { createFileRoute, useLocation } from '@tanstack/react-router';
import EditIncomingOrderPage from '@/components/forms/edit-incoming-order';
import type { DaybookOrder } from '@/types/daybook';

export const Route = createFileRoute('/_authenticated/store-admin/edit-incoming/$orderId')({
  component: EditIncomingOrder,
});

function EditIncomingOrder() {
  const { orderId: _orderId } = Route.useParams();
  const location = useLocation();

  // Get order from location state (passed during navigation)
  const order = (location.state as { order?: DaybookOrder })?.order || null;

  if (!order) {
    return (
      <div className="flex w-full max-w-3xl flex-col gap-8 mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground">
            Please navigate back and try again, or ensure the order ID is correct.
          </p>
        </div>
      </div>
    );
  }

  return <EditIncomingOrderPage order={order} />;
}
