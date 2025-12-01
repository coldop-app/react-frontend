import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/store-admin/people')({
  component: People,
});

function People() {
  return (
    <div>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">People</h1>
        <p className="text-muted-foreground">People management page content goes here.</p>
      </div>
    </div>
  );
}
