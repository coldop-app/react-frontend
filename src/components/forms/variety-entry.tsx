import React, { useRef, useMemo } from 'react';
import { VarietySelector } from './variety-selector';
import { QuantityInputSection } from './quantity-input';
import { LocationInputSection } from './location-input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  onPricePerBagSizeChange: (id: string, size: string, value: string) => void;
  quantities: Record<string, string>;
  customMarka: Record<string, string>;
  locations: Record<string, { chamber: string; floor: string; row: string }>;
  pricePerBagSize: Record<string, string>;
  onLastFieldEnter?: () => void;
  canRemove: boolean;
  disabled?: boolean;
}

const hasQuantity = (q: string) =>
  q != null && q.trim() !== '' && !isNaN(parseFloat(q)) && parseFloat(q) > 0;

export const VarietyEntry: React.FC<VarietyEntryProps> = ({
  index: _index,
  varietyId,
  variety,
  commodity,
  sizes,
  showCustomMarka,
  varieties = [],
  onRemove,
  onVarietyChange,
  onQuantityChange,
  onCustomMarkaChange,
  onLocationChange,
  onPricePerBagSizeChange,
  quantities,
  customMarka,
  locations,
  pricePerBagSize,
  onLastFieldEnter,
  canRemove,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { onKeyDown } = useEnterNavigation({
    containerRef: containerRef as React.RefObject<HTMLElement>,
    onLastFieldEnter,
  });

  // Only show price and location for bag sizes that have quantity entered
  const sizesWithQuantity = useMemo(
    () => sizes.filter((size) => hasQuantity(quantities[size] ?? '')),
    [sizes, quantities]
  );

  const handleVarietySelect = (value: string) => onVarietyChange(varietyId, value);
  const handleQuantityChange = (size: string, quantity: string) =>
    onQuantityChange(varietyId, size, quantity);
  const handleCustomMarkaChange = (size: string, customMarka: string) =>
    onCustomMarkaChange(varietyId, size, customMarka);
  const handleLocationChange = (size: string, field: 'chamber' | 'floor' | 'row', value: string) =>
    onLocationChange(varietyId, size, field, value);
  const handlePriceChange = (size: string, value: string) =>
    onPricePerBagSizeChange(varietyId, size, value);

  return (
    <Card ref={containerRef} className="relative">
      <CardHeader className="pb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <VarietySelector
              key={`${varietyId}-${commodity || 'no-commodity'}`}
              id={`variety-selector-${varietyId}`}
              onSelect={handleVarietySelect}
              disabled={disabled}
              varieties={varieties}
              defaultValue={variety}
            />
          </div>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemove(varietyId)}
              className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-10">
        {/* Quantity Inputs */}
        <div className="space-y-5">
          <Label className="text-base font-medium mb-5 block">Enter Quantities</Label>
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

        {/* Location Inputs – only for bag sizes where quantity is entered */}
        <div className="mt-12">
          <Label className="text-base font-medium mb-5 block">Enter Locations</Label>
          <LocationInputSection
            locations={locations}
            onLocationChange={handleLocationChange}
            varietyId={varietyId}
            commodity={commodity}
            sizes={sizes}
            quantities={quantities}
            disabled={disabled}
            showApplyToAll
            inline
            containerRef={containerRef as React.RefObject<HTMLElement>}
            onKeyDown={onKeyDown}
          />
        </div>

        {/* Price per bag size – only for bag sizes where quantity is entered */}
        {sizesWithQuantity.length > 0 && (
          <div className="mt-12 space-y-4">
            <Label className="text-base font-medium block">Price per bag size (₹/bag)</Label>
            <p className="text-sm text-muted-foreground">
              Enter rate per bag for each size you added above.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sizesWithQuantity.map((size) => (
                <div key={size} className="space-y-2">
                  <Label htmlFor={`price-${varietyId}-${size}`} className="text-sm">
                    {size}
                  </Label>
                  <Input
                    id={`price-${varietyId}-${size}`}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={pricePerBagSize[size] ?? ''}
                    onChange={(e) => handlePriceChange(size, e.target.value)}
                    disabled={disabled}
                    className="w-full"
                    onKeyDown={onKeyDown}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
