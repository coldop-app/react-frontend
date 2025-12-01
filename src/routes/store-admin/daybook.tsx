import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/store-admin/daybook')({
  component: Daybook,
});

function Daybook() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Daybook</h1>
      <p className="text-muted-foreground">Daybook page content goes here.</p>
    </div>
  );
}
