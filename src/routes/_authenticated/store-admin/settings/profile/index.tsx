import { createFileRoute } from '@tanstack/react-router';
import ProfileSettingsPage from '@/components/settings/profile';

export const Route = createFileRoute('/_authenticated/store-admin/settings/profile/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <ProfileSettingsPage />
    </>
  );
}
