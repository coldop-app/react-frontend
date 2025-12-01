'use client';

import { SearchSelector } from '../search-selector';
import { Label } from '@/components/ui/label';
import { useMemo } from 'react';

interface VarietySelectorProps {
  id?: string;
  onSelect?: (value: string) => void;
  disabled?: boolean;
  varieties?: string[];
  defaultValue?: string;
}

export const VarietySelector = ({
  id = 'variety-selector',
  onSelect,
  disabled = false,
  varieties = [],
  defaultValue,
}: VarietySelectorProps) => {
  const varietyOptions = useMemo(() => {
    return (
      varieties.map((variety: string) => ({
        label: variety,
        value: variety,
      })) || []
    );
  }, [varieties]);

  return (
    <div className="space-y-3">
      <Label htmlFor={id} className="text-base font-medium">
        Select Variety
      </Label>
      <SearchSelector
        id={id}
        options={varietyOptions}
        placeholder="Select a variety..."
        onSelect={onSelect}
        className="w-full sm:w-[320px]"
        buttonClassName="w-full sm:w-[320px] justify-between h-10"
        disabled={disabled}
        defaultValue={defaultValue}
      />
    </div>
  );
};
