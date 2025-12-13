import { createFileRoute } from '@tanstack/react-router';
import AnalyticsPage from '@/components/analytics';

export const Route = createFileRoute('/_authenticated/store-admin/analytics')({
  component: Analytics,
});

function Analytics() {
  return <AnalyticsPage />;
}
