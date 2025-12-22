import { createFileRoute } from '@tanstack/react-router';
import { useStore } from '@/stores/store';

export const Route = createFileRoute('/_authenticated/store-admin/zustand')({
  component: RouteComponent,
});

function RouteComponent() {
  const store = useStore();

  return (
    <div>
      <pre>{JSON.stringify(store, null, 2)}</pre>
    </div>
  );
}
