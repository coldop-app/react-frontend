import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/store-admin/settings')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>This is settings page</div>;
}
