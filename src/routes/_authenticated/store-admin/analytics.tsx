import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/store-admin/analytics')({
  component: Analytics,
});

function Analytics() {
  return (
    <div>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Analytics</h1>
        <p className="text-muted-foreground">Analytics and reports page content goes here.</p>
      </div>
    </div>
  );
}
