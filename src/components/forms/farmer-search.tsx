import React, { useMemo } from 'react';
import { SearchSelector } from '../search-selector';
import { useGetAllFarmers } from '@/services/base/store-admin/functions/useGetAllFarmers';
import { AddFarmerModal } from './add-farmer-modal';

interface FarmerSearchProps {
  onSelect?: (farmerStorageLinkId: string | '') => void;
  defaultValue?: string;
}

interface FarmerOption {
  label: string;
  value: string;
  searchableText: string;
  renderLabel: React.ReactNode;
}

export const FarmerSearch: React.FC<FarmerSearchProps> = ({ onSelect, defaultValue }) => {
  const farmersQuery = useGetAllFarmers();

  const farmerOptions: FarmerOption[] = useMemo(() => {
    const farmers = farmersQuery.data?.data ?? [];
    return farmers.map((farmer) => ({
      label: farmer.name,
      value: farmer.id,
      searchableText: `${farmer.name} ${farmer.mobileNumber} ${farmer.address}`,
      renderLabel: (
        <div className="flex flex-col">
          <span className="font-medium">{farmer.name}</span>
          <span className="text-xs text-muted-foreground">📞 {farmer.mobileNumber}</span>
          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
            📍 {farmer.address}
          </span>
        </div>
      ),
    }));
  }, [farmersQuery.data?.data]);

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
      <SearchSelector
        id="farmer-search"
        options={farmerOptions}
        placeholder="Select farmer..."
        searchPlaceholder="Search by name, mobile, or address..."
        className="w-[280px] p-0"
        buttonClassName="w-full sm:w-[320px] justify-between h-10 flex-shrink-0"
        loading={farmersQuery.isLoading}
        loadingMessage="Loading farmers..."
        emptyMessage="No farmers found."
        onSelect={onSelect}
        defaultValue={defaultValue}
      />
      <AddFarmerModal farmers={farmersQuery.data?.data ?? []} />
    </div>
  );
};
