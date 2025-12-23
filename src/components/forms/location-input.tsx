import React, { useRef, useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useStore } from '@/stores/store';
import { useEnterNavigation } from '@/hooks/use-enter-navigation';

interface LocationInputSectionProps {
  onLastFieldEnter?: () => void;
  locations?: Record<string, { chamber: string; floor: string; row: string }>;
  onLocationChange?: (size: string, field: 'chamber' | 'floor' | 'row', value: string) => void;
  varietyId?: string;
  commodity?: string;
  sizes?: string[];
  quantities?: Record<string, string>;
  disabled?: boolean;
  showApplyToAll?: boolean;
  containerRef?: React.RefObject<HTMLElement>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inline?: boolean;
}

interface LocationValues {
  chamber: string;
  floor: string;
  row: string;
}

export const LocationInputSection: React.FC<LocationInputSectionProps> = ({
  onLastFieldEnter,
  locations: externalLocations,
  onLocationChange,
  varietyId,
  commodity,
  sizes: externalSizes,
  quantities,
  disabled = false,
  showApplyToAll = true,
  containerRef: externalContainerRef,
  onKeyDown: externalOnKeyDown,
  inline = false,
}) => {
  const { coldStorage } = useStore();

  // Determine sizes based on commodity or external sizes
  const allSizes = useMemo(() => {
    if (externalSizes) return externalSizes;
    if (!commodity) return [];
    return coldStorage?.preferences?.commodities?.find((c) => c.name === commodity)?.sizes ?? [];
  }, [coldStorage?.preferences?.commodities, commodity, externalSizes]);

  // Filter sizes to only show those with quantities entered
  const sizes = useMemo(() => {
    if (!quantities) return allSizes;
    return allSizes.filter((size) => {
      const quantity = quantities[size];
      return quantity && quantity.trim() !== '' && !isNaN(parseFloat(quantity));
    });
  }, [allSizes, quantities]);

  // Internal state for locations if uncontrolled
  const [internalLocationValues, setInternalLocationValues] = useState<
    Record<string, LocationValues>
  >(() => {
    const initial: Record<string, LocationValues> = {};
    sizes.forEach((size) => {
      initial[size] = { chamber: '', floor: '', row: '' };
    });
    return initial;
  });

  const locationValues = externalLocations || internalLocationValues;

  const internalContainerRef = useRef<HTMLDivElement>(null);
  const containerRef =
    externalContainerRef || (internalContainerRef as React.RefObject<HTMLElement>);

  const { onKeyDown: internalOnKeyDown } = useEnterNavigation({
    containerRef,
    onLastFieldEnter,
  });

  const handleKeyDown = externalOnKeyDown || internalOnKeyDown;

  // Apply to All logic
  const firstSize = sizes[0];
  const firstSizeValues: LocationValues = firstSize
    ? {
        chamber: locationValues[firstSize]?.chamber ?? '',
        floor: locationValues[firstSize]?.floor ?? '',
        row: locationValues[firstSize]?.row ?? '',
      }
    : { chamber: '', floor: '', row: '' };

  const isApplyToAllEnabled =
    showApplyToAll &&
    firstSize &&
    firstSizeValues.chamber.trim() !== '' &&
    firstSizeValues.floor.trim() !== '' &&
    firstSizeValues.row.trim() !== '';

  const handleInputChange = (size: string, field: keyof LocationValues, value: string) => {
    if (onLocationChange) {
      onLocationChange(size, field, value);
    } else {
      setInternalLocationValues((prev) => ({
        ...prev,
        [size]: { ...prev[size], [field]: value },
      }));
    }
  };

  const handleApplyToAll = () => {
    if (!firstSize || !isApplyToAllEnabled) return;

    if (onLocationChange) {
      sizes.forEach((size) => {
        onLocationChange(size, 'chamber', firstSizeValues.chamber);
        onLocationChange(size, 'floor', firstSizeValues.floor);
        onLocationChange(size, 'row', firstSizeValues.row);
      });
    } else {
      const updatedValues: Record<string, LocationValues> = {};
      sizes.forEach((size) => {
        updatedValues[size] = { ...firstSizeValues };
      });
      setInternalLocationValues(updatedValues);
    }
  };

  const isStandalone = !onLocationChange;

  const content = (
    <div className="space-y-6">
      {sizes.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">
          Enter quantities for bag sizes above to see location inputs
        </p>
      ) : (
        sizes.map((size, index) => (
          <div key={size} className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <Label className="text-base font-medium min-w-[80px]">{size}</Label>
              <div className="flex items-center gap-3 flex-1 max-w-md">
                <Input
                  id={index === 0 && isStandalone && !inline ? 'first-location-chamber' : undefined}
                  data-location-input="chamber"
                  data-size={size}
                  data-variety-id={varietyId}
                  placeholder="Chamber"
                  className="h-10 flex-1"
                  value={locationValues[size]?.chamber || ''}
                  onChange={(e) => handleInputChange(size, 'chamber', e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={disabled}
                />
                <Input
                  data-location-input="floor"
                  data-size={size}
                  data-variety-id={varietyId}
                  placeholder="Floor"
                  className="h-10 flex-1"
                  value={locationValues[size]?.floor || ''}
                  onChange={(e) => handleInputChange(size, 'floor', e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={disabled}
                />
                <Input
                  data-location-input="row"
                  data-size={size}
                  data-variety-id={varietyId}
                  placeholder="Row"
                  className="h-10 flex-1"
                  value={locationValues[size]?.row || ''}
                  onChange={(e) => handleInputChange(size, 'row', e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={disabled}
                />
              </div>
            </div>

            {index < sizes.length - 1 && <Separator className="mt-2" />}
          </div>
        ))
      )}
    </div>
  );

  const applyToAllButton = showApplyToAll ? (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleApplyToAll}
      disabled={!isApplyToAllEnabled}
      className="whitespace-nowrap"
    >
      Apply to All
    </Button>
  ) : null;

  if (inline) {
    return (
      <div ref={internalContainerRef}>
        {applyToAllButton && <div className="flex justify-end mb-4">{applyToAllButton}</div>}
        {content}
      </div>
    );
  }

  return (
    <Card ref={internalContainerRef}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Enter Locations</CardTitle>
        <div className="flex items-center justify-between gap-4 mt-1.5">
          <CardDescription>
            {isStandalone
              ? 'Please enter location details for each bag size'
              : 'Enter location details for each bag size'}
          </CardDescription>
          {applyToAllButton}
        </div>
      </CardHeader>

      <CardContent>{content}</CardContent>
    </Card>
  );
};
