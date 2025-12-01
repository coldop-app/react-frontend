import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/store-admin/outgoing')({
  component: Outgoing,
});

function Outgoing() {
  return (
    <div>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Outgoing Orders</h1>
        <p className="text-muted-foreground">Outgoing orders page content goes here.</p>
      </div>
    </div>
  );
}
