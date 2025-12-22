import { createFileRoute } from '@tanstack/react-router';
import { PreferencesSettingsPage } from '@/components/settings/preferences';

export const Route = createFileRoute('/_authenticated/store-admin/settings/preferences/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PreferencesSettingsPage />;
}
