import { ArrowUp, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { prefetchPreferencesById } from '@/services/base/preferences/usePreferencesById';
import { prefetchAllFarmers } from '@/services/base/store-admin/functions/useGetAllFarmers';

interface ActionButtonsProps {
  preferencesId: string;
}

export default function ActionButtons({ preferencesId }: ActionButtonsProps) {
  const navigate = useNavigate();

  const handlePrefetch = () => {
    if (preferencesId) {
      prefetchPreferencesById(preferencesId);
    }
    prefetchAllFarmers();
  };

  return (
    <div
      className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto"
      onMouseEnter={handlePrefetch} // 🔥 Prefetch on hover
    >
      <Button
        variant="default"
        onClick={() => {
          navigate({ to: '/store-admin/incoming' });
        }}
        className="flex items-center gap-1"
      >
        <ArrowUp className="h-4 w-4 shrink-0" />
        <span className="truncate">Add Incoming</span>
      </Button>

      <Button
        variant="outline"
        onClick={() => {
          navigate({ to: '/store-admin/outgoing' });
        }}
        className="flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" />
        <span className="truncate">Add Outgoing</span>
      </Button>
    </div>
  );
}
