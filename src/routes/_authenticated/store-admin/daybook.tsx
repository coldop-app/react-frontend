import { createFileRoute } from '@tanstack/react-router';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import DaybookPage from '@/components/daybook';

export const Route = createFileRoute('/_authenticated/store-admin/daybook')({
  component: Daybook,
});

function Daybook() {
  return (
    <HelmetProvider>
      <Helmet>
        <title>Daybook | Coldop</title>
        <meta name="description" content="View your daybook entries" />
      </Helmet>

      <DaybookPage />
    </HelmetProvider>
  );
}
