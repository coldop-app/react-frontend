import React, { useRef } from 'react';
import { VarietySelector } from './variety-selector';
import { QuantityInputSection } from './quantity-input';
import { LocationInputSection } from './location-input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useEnterNavigation } from '@/hooks/use-enter-navigation';
import { X } from 'lucide-react';

interface VarietyEntryProps {
  index: number;
  varietyId: string;
  variety: string;
  commodity?: string;
  sizes: string[];
  showCustomMarka: boolean;
  varieties?: string[];
  onRemove: (id: string) => void;
  onVarietyChange: (id: string, variety: string) => void;
  onQuantityChange: (id: string, size: string, quantity: string) => void;
  onCustomMarkaChange: (id: string, size: string, customMarka: string) => void;
  onLocationChange: (
    id: string,
    size: string,
    field: 'chamber' | 'floor' | 'row',
    value: string
  ) => void;
  quantities: Record<string, string>;
  customMarka: Record<string, string>;
  locations: Record<string, { chamber: string; floor: string; row: string }>;
  onLastFieldEnter?: () => void;
  canRemove: boolean;
  disabled?: boolean;
}

export const VarietyEntry: React.FC<VarietyEntryProps> = ({
  index,
  varietyId,
  variety, // reserved for future controlled component use
  commodity,
  sizes,
  showCustomMarka,
  varieties = [],
  onRemove,
  onVarietyChange,
  onQuantityChange,
  onCustomMarkaChange,
  onLocationChange,
  quantities,
  customMarka,
  locations,
  onLastFieldEnter,
  canRemove,
  disabled = false,
}) => {
  void variety; // suppress unused variable warning
  const containerRef = useRef<HTMLDivElement>(null);

  const { onKeyDown } = useEnterNavigation({
    containerRef: containerRef as React.RefObject<HTMLElement>,
    onLastFieldEnter,
  });

  const handleVarietySelect = (value: string) => onVarietyChange(varietyId, value);
  const handleQuantityChange = (size: string, quantity: string) =>
    onQuantityChange(varietyId, size, quantity);
  const handleCustomMarkaChange = (size: string, customMarka: string) =>
    onCustomMarkaChange(varietyId, size, customMarka);
  const handleLocationChange = (size: string, field: 'chamber' | 'floor' | 'row', value: string) =>
    onLocationChange(varietyId, size, field, value);

  return (
    <Card ref={containerRef} className="relative">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Variety {index + 1}</CardTitle>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemove(varietyId)}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Variety Selector */}
        <VarietySelector
          key={`${varietyId}-${commodity || 'no-commodity'}`}
          id={`variety-selector-${varietyId}`}
          onSelect={handleVarietySelect}
          disabled={disabled}
          varieties={varieties}
        />

        {/* Quantity Inputs */}
        <div className="space-y-6">
          <Label className="text-base font-medium mb-3 block">Enter Quantities</Label>
          <QuantityInputSection
            quantities={quantities}
            customMarka={customMarka}
            onQuantityChange={handleQuantityChange}
            onCustomMarkaChange={handleCustomMarkaChange}
            varietyId={varietyId}
            sizes={sizes}
            disabled={disabled}
            showCustomMarka={showCustomMarka}
            inline
            containerRef={containerRef as React.RefObject<HTMLElement>}
            onKeyDown={onKeyDown}
          />
        </div>

        {/* Location Inputs */}
        <div className="mt-16">
          <Label className="text-base font-medium mb-3 block">Enter Locations</Label>
          <LocationInputSection
            locations={locations}
            onLocationChange={handleLocationChange}
            varietyId={varietyId}
            commodity={commodity}
            disabled={disabled}
            showApplyToAll
            inline
            containerRef={containerRef as React.RefObject<HTMLElement>}
            onKeyDown={onKeyDown}
          />
        </div>
      </CardContent>
    </Card>
  );
};
