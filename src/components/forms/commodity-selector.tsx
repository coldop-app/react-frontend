import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStore } from '@/stores/store';
import { useMemo, useEffect, useState, useRef } from 'react';

interface CommoditySelectorProps {
  id?: string;
  onSelect?: (value: string) => void;
  disabled?: boolean;
  defaultValue?: string;
}

export const CommoditySelector: React.FC<CommoditySelectorProps> = ({
  id = 'commodity-selector',
  onSelect,
  disabled = false,
  defaultValue: externalDefaultValue,
}) => {
  const { coldStorage } = useStore();

  const commodityOptions = useMemo(() => {
    return (
      coldStorage?.preferences?.commodities?.map((commodity) => ({
        label: commodity.name,
        value: commodity.name,
      })) || []
    );
  }, [coldStorage?.preferences?.commodities]);

  const internalDefaultValue = commodityOptions.length > 0 ? commodityOptions[0].value : '';

  const [selectedValue, setSelectedValue] = useState<string>(
    externalDefaultValue || internalDefaultValue
  );

  const hasNotifiedRef = useRef(false);

  // Call onSelect with default value on first render if not provided externally
  useEffect(() => {
    const valueToUse = externalDefaultValue || internalDefaultValue;
    if (valueToUse && !hasNotifiedRef.current) {
      hasNotifiedRef.current = true;
      onSelect?.(valueToUse);
    }
  }, [externalDefaultValue, internalDefaultValue, onSelect]);

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    onSelect?.(value);
  };

  return (
    <div className="space-y-3">
      <Label htmlFor={id} className="text-base font-medium">
        Select Commodity
      </Label>
      <Select
        value={selectedValue}
        onValueChange={handleValueChange}
        disabled={disabled || commodityOptions.length === 0}
      >
        <SelectTrigger id={id} className="w-full sm:w-[320px] h-10">
          <SelectValue placeholder="Select a commodity..." />
        </SelectTrigger>
        <SelectContent className="w-full sm:w-[320px]">
          {commodityOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
