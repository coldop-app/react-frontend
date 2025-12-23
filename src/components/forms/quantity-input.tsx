import React, { useRef, useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { useEnterNavigation } from '@/hooks/use-enter-navigation';

interface QuantityInputSectionProps {
  onLastFieldEnter?: () => void;
  quantities?: Record<string, string>;
  customMarka?: Record<string, string>;
  onQuantityChange?: (size: string, quantity: string) => void;
  onCustomMarkaChange?: (size: string, customMarka: string) => void;
  varietyId?: string;
  sizes?: string[];
  disabled?: boolean;
  showCustomMarka?: boolean;
  containerRef?: React.RefObject<HTMLElement>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inline?: boolean;
}

// Validate quantity (allows positive floats)
const validateQuantityString = (val: string) => {
  if (!val || val.trim() === '') return false;
  const num = parseFloat(val);
  return !isNaN(num) && isFinite(num) && num > 0;
};

export const QuantityInputSection: React.FC<QuantityInputSectionProps> = ({
  onLastFieldEnter,
  quantities,
  customMarka,
  onQuantityChange,
  onCustomMarkaChange,
  varietyId,
  sizes = [],
  disabled = false,
  showCustomMarka = false,
  containerRef: externalContainerRef,
  onKeyDown: externalOnKeyDown,
  inline = false,
}) => {
  const internalContainerRef = useRef<HTMLDivElement>(null);
  const containerRef =
    externalContainerRef || (internalContainerRef as React.RefObject<HTMLElement>);

  const { onKeyDown: internalOnKeyDown } = useEnterNavigation({
    containerRef,
    onLastFieldEnter,
  });

  const handleKeyDown = externalOnKeyDown || internalOnKeyDown;

  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleQuantityChangeWithValidation = (size: string, quantity: string) => {
    setTouchedFields((prev) => new Set(prev).add(size));
    onQuantityChange?.(size, quantity);

    if (quantity && quantity.trim() !== '') {
      const isValid = validateQuantityString(quantity);
      if (!isValid) {
        setValidationErrors((prev) => ({
          ...prev,
          [size]: 'Quantity must be a valid positive number (decimals allowed)',
        }));
      } else {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[size];
          return newErrors;
        });
      }
    } else {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[size];
        return newErrors;
      });
    }
  };

  const isStandalone = !onQuantityChange && !onCustomMarkaChange;

  const totalQuantity = useMemo(() => {
    if (!quantities || !sizes.length) return 0;
    return sizes.reduce((sum, size) => {
      const quantity = quantities[size];
      if (quantity && quantity.trim() !== '') {
        const num = parseFloat(quantity);
        return sum + (isNaN(num) ? 0 : num);
      }
      return sum;
    }, 0);
  }, [quantities, sizes]);

  const content = (
    <div className="space-y-6">
      {sizes.map((size, index) => (
        <div key={size} className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <Label className="text-base font-medium min-w-[80px]">{size}</Label>
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="flex-1">
                <Input
                  placeholder="Quantity"
                  value={quantities?.[size] || ''}
                  onChange={(e) => handleQuantityChangeWithValidation(size, e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`h-10 ${touchedFields.has(size) && validationErrors[size] ? 'border-destructive' : ''}`}
                  data-variety-id={varietyId}
                  data-size={size}
                  data-type="quantity"
                  disabled={disabled}
                />
                {touchedFields.has(size) && validationErrors[size] && (
                  <p className="text-sm text-destructive mt-1">{validationErrors[size]}</p>
                )}
              </div>
              {showCustomMarka && (
                <Input
                  placeholder="Custom Marka"
                  value={customMarka?.[size] || ''}
                  onChange={(e) => onCustomMarkaChange?.(size, e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-10"
                  data-variety-id={varietyId}
                  data-size={size}
                  data-type="customMarka"
                  disabled={disabled}
                />
              )}
            </div>
          </div>
          {index < sizes.length - 1 && <Separator className="mt-2" />}
        </div>
      ))}
      <div className="pt-6 border-t mt-6">
        <div className="flex items-center justify-between bg-primary/10 rounded-lg px-4 py-3 border border-primary/20">
          <Label className="text-base font-semibold text-foreground">Total Quantity</Label>
          <div className="text-2xl font-bold text-primary">
            {totalQuantity > 0
              ? totalQuantity.toLocaleString('en-US', { maximumFractionDigits: 2 })
              : '0'}
          </div>
        </div>
      </div>
    </div>
  );

  if (inline) return <div ref={internalContainerRef}>{content}</div>;

  return (
    <Card ref={internalContainerRef}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Enter Quantities</CardTitle>
        <CardDescription className="mt-1.5">
          {isStandalone
            ? 'Please select a variety first to enter quantities'
            : 'Enter quantities for each bag size'}
        </CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
};
