import React, { useEffect, useMemo, useCallback } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface VarietyTotal {
  variety: string;
  total: number;
  quantities: Record<string, string>;
  locations: Record<string, { chamber: string; floor: string; row: string }>;
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
  hasSingleCommodity?: boolean;
  remarksRef: React.RefObject<HTMLTextAreaElement | null>;
  onSubmit: () => void;
  isSubmitting: boolean;
}

function IncomingOrderSummarySheetComponent({
  open,
  onOpenChange,
  selectedFarmer,
  orderDate,
  selectedCommodity,
  varietyTotals,
  grandTotal,
  sizes,
  isNullVoucher,
  hasSingleCommodity = false,
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

  // Memoize number formatting function
  const formatNumber = useCallback((value: number) => {
    return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }, []);

  // Memoize formatted grand total
  const formattedGrandTotal = useMemo(() => {
    return formatNumber(grandTotal);
  }, [grandTotal, formatNumber]);

  // Helper function to format location
  const formatLocation = useCallback(
    (location: { chamber: string; floor: string; row: string } | undefined): string => {
      if (!location) return '-';
      const parts: string[] = [];
      if (location.chamber?.trim()) parts.push(location.chamber.trim());
      if (location.floor?.trim()) parts.push(location.floor.trim());
      if (location.row?.trim()) parts.push(location.row.trim());
      return parts.length > 0 ? parts.join('/') : '-';
    },
    []
  );

  // Memoize variety totals with formatted numbers
  const formattedVarietyTotals = useMemo(() => {
    return varietyTotals.map((vt) => ({
      ...vt,
      formattedTotal: formatNumber(vt.total),
      // Pre-filter and format quantities for each variety
      formattedQuantities: sizes
        .map((size) => {
          const qty = vt.quantities[size];
          if (!qty || qty.trim() === '') return null;
          const location = vt.locations?.[size];
          return {
            size,
            value: parseFloat(qty),
            formatted: formatNumber(parseFloat(qty)),
            location: formatLocation(location),
          };
        })
        .filter(
          (
            item
          ): item is {
            size: string;
            value: number;
            formatted: string;
            location: string;
          } => item !== null
        ),
    }));
  }, [varietyTotals, sizes, formatNumber, formatLocation]);

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

                {/* Commodity - Only show if there are multiple commodities */}
                {selectedCommodity && !hasSingleCommodity && (
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
          {!isNullVoucher && formattedVarietyTotals.length > 0 && (
            <div className="space-y-6">
              <h3 className="font-semibold text-base">Varieties & Quantities</h3>
              <div className="space-y-4">
                {formattedVarietyTotals.map((vt) => (
                  <div key={vt.variety} className="rounded-lg border bg-card overflow-hidden">
                    {/* Variety Header */}
                    <div className="px-4 py-3 border-b bg-muted/40 flex justify-between items-center">
                      <div className="px-2 py-1.5 bg-muted/20 border rounded text-xs font-semibold">
                        Variety: {vt.variety}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">Total:</span>
                        <span className="text-base font-bold text-primary">
                          {vt.formattedTotal}
                        </span>
                      </div>
                    </div>

                    {/* Quantities Table */}
                    {vt.formattedQuantities.length > 0 && (
                      <div className="overflow-x-auto p-3">
                        <Table className="w-full text-xs">
                          <TableHeader>
                            <TableRow>
                              <TableHead className="px-2 py-1">Size</TableHead>
                              <TableHead className="px-2 py-1">Location</TableHead>
                              <TableHead className="px-2 py-1 text-right">Quantity</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {vt.formattedQuantities.map((qty) => (
                              <TableRow key={qty.size}>
                                <TableCell className="px-2 py-1">{qty.size}</TableCell>
                                <TableCell className="px-2 py-1 text-muted-foreground">
                                  {qty.location}
                                </TableCell>
                                <TableCell className="px-2 py-1 text-right font-semibold text-primary">
                                  {qty.formatted}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Grand Total */}
              {formattedVarietyTotals.length > 0 && (
                <div className="rounded-lg border bg-muted/40 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground/90">Grand Total</p>
                    <p className="text-lg font-bold text-primary">{formattedGrandTotal}</p>
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

// Memoize component to prevent unnecessary re-renders
export const IncomingOrderSummarySheet = React.memo(IncomingOrderSummarySheetComponent);
