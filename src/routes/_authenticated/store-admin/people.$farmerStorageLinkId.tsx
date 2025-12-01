import { createFileRoute } from '@tanstack/react-router';
import FarmerProfilePage from '@/components/people/farmer-profile';

export const Route = createFileRoute('/_authenticated/store-admin/people/$farmerStorageLinkId')({
  component: FarmerProfilePage,
});
