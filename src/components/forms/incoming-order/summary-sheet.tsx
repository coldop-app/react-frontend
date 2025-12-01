import { useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface VarietyTotal {
  variety: string;
  total: number;
  quantities: Record<string, string>;
}

interface SummarySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFarmer: {
    name: string;
    mobileNumber: string;
    address?: string;
  } | null;
  orderDate: string;
  selectedCommodity: string;
  varietyTotals: VarietyTotal[];
  grandTotal: number;
  sizes: string[];
  isNullVoucher: boolean;
  remarksRef: React.RefObject<HTMLTextAreaElement | null>;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function IncomingOrderSummarySheet({
  open,
  onOpenChange,
  selectedFarmer,
  orderDate,
  selectedCommodity,
  varietyTotals,
  grandTotal,
  sizes,
  isNullVoucher,
  remarksRef,
  onSubmit,
  isSubmitting,
}: SummarySheetProps) {
  // Auto-focus on remarks field when sheet opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        const remarksField = document.getElementById('remarks');
        if (remarksField) {
          remarksField.focus();
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto flex flex-col px-6">
        <SheetHeader className="px-0">
          <SheetTitle className="text-2xl">Order Summary</SheetTitle>
          <SheetDescription>
            Review all the details and add remarks before submitting.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto mt-6 space-y-6 pb-6">
          {/* Null Voucher Warning */}
          {isNullVoucher && (
            <div className="rounded-lg border border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20 p-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0">
                  <span className="text-yellow-600 dark:text-yellow-400 text-lg">⚠️</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Caution: This voucher will be marked as null. Please add remarks or notes for
                    this voucher.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Order Details */}
          {!isNullVoucher && (
            <div className="p-4 rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
              <div className="space-y-4">
                {/* Header */}
                <div className="pb-3 border-b border-primary/20">
                  <h3 className="text-base font-semibold text-foreground/90">Order Details</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Review the details before submitting
                  </p>
                </div>

                {/* Farmer Information */}
                {selectedFarmer && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Farmer
                    </p>
                    <div className="flex flex-col gap-2">
                      <p className="text-base font-semibold text-foreground/90">
                        {selectedFarmer.name}
                      </p>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <span className="text-xs">📞</span>
                          <span>{selectedFarmer.mobileNumber}</span>
                        </div>
                        {selectedFarmer.address && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <span className="text-xs">📍</span>
                            <span className="truncate max-w-[200px]">{selectedFarmer.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Date */}
                {orderDate && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Order Date
                    </p>
                    <p className="text-sm font-semibold text-foreground/90">{orderDate}</p>
                  </div>
                )}

                {/* Commodity */}
                {selectedCommodity && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Commodity
                    </p>
                    <p className="text-sm font-semibold text-foreground/90">{selectedCommodity}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Varieties and Quantities */}
          {!isNullVoucher && varietyTotals.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Varieties & Quantities</h3>
              <div className="space-y-4">
                {varietyTotals.map((vt, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-card">
                    <div className="space-y-3">
                      {/* Header Section */}
                      <div className="flex items-center justify-between pb-2 border-b">
                        <h3 className="text-sm font-semibold text-foreground/90">{vt.variety}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground">Total:</span>
                          <span className="text-base font-bold text-primary">
                            {vt.total.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                      {/* Quantities Grid */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {sizes.map((size) => {
                          const qty = vt.quantities[size];
                          if (!qty || qty.trim() === '') return null;
                          return (
                            <div key={size} className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">{size}</span>
                              <span className="text-sm font-semibold text-foreground/90">
                                {parseFloat(qty).toLocaleString('en-US', {
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Grand Total */}
              {varietyTotals.length > 0 && (
                <div className="p-4 rounded-lg border bg-muted/50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground/90">Grand Total</p>
                    <p className="text-lg font-bold text-primary">
                      {grandTotal.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Remarks Field */}
          <div className="space-y-3">
            <Label htmlFor="remarks" className="text-base font-medium">
              Add Remarks
            </Label>
            <Textarea
              ref={remarksRef}
              id="remarks"
              placeholder="Enter any additional remarks or notes..."
              className="min-h-[120px]"
              onKeyDown={(e) => {
                // Submit form when Enter is pressed (without Shift)
                if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
                  e.preventDefault();
                  onSubmit();
                }
              }}
            />
          </div>
        </div>

        <SheetFooter className="mt-auto pt-6 border-t px-0">
          <Button onClick={onSubmit} disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
