import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { VarietyAnalyticsPage } from '@/components/variety-analysis';
import { useStore } from '@/stores/store';

const varietyBreakdownSearchSchema = z.object({
  commodity: z.string(),
  variety: z.string(),
  bagSize: z.string().optional(),
});

export const Route = createFileRoute('/_authenticated/store-admin/variety-breakdown')({
  validateSearch: varietyBreakdownSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { commodity, variety, bagSize } = Route.useSearch();

  const { admin } = useStore();

  // Get storageId from coldStorage.preferences.id
  const storageId = admin?.coldStorageId || '';

  if (!storageId) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="font-semibold text-lg mb-2">Storage information not available</h3>
          <p className="text-sm text-muted-foreground">
            Please ensure you are logged in and have access to a cold storage facility.
          </p>
        </div>
      </div>
    );
  }

  return (
    <VarietyAnalyticsPage
      storageId={storageId}
      commodity={commodity}
      variety={variety}
      bagSize={bagSize}
    />
  );
}
