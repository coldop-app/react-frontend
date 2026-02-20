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
import { Input } from '@/components/ui/input';
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

import type { DaybookOrder } from '@/types/daybook';
import { format } from 'date-fns';

interface SelectedBag {
  orderId: string;
  order: DaybookOrder;
  size: string;
  variety: string;
  location: string;
  quantity: number;
  quantityCurr: number;
  quantityInit: number;
  pricePerBag?: number;
}

interface SummarySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBags: SelectedBag[];
  selectedFarmer: {
    name: string;
    mobileNumber: string;
    address?: string;
  } | null;
  selectedCommodity: string;
  selectedVariety: string;
  paymentMode: 'paid' | 'credit';
  onPaymentModeChange: (mode: 'paid' | 'credit') => void;
  rentAmountForPayment: string;
  onRentAmountChange: (value: string) => void;
  remarksRef: React.RefObject<HTMLTextAreaElement | null>;
  onSubmit: () => void;
  isSubmitting: boolean;
}

function SummarySheetComponent({
  open,
  onOpenChange,
  selectedBags,
  selectedFarmer,
  selectedCommodity,
  selectedVariety,
  paymentMode,
  onPaymentModeChange,
  rentAmountForPayment,
  onRentAmountChange,
  remarksRef,
  onSubmit,
  isSubmitting,
}: SummarySheetProps) {
  // Auto-focus remarks when sheet opens
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      const remarksField = document.getElementById('remarks') as HTMLTextAreaElement | null;
      remarksField?.focus();
    }, 120);

    return () => clearTimeout(timer);
  }, [open]);

  // Group bags:  order → variety → bags
  const groupedBags = useMemo(() => {
    if (selectedBags.length === 0) return [];

    const orderGroups = Object.groupBy(selectedBags, (bag: SelectedBag) => bag.orderId);
    const result: Array<{
      orderId: string;
      order: DaybookOrder;
      variety: string;
      bags: SelectedBag[];
    }> = [];

    Object.entries(orderGroups).forEach(([orderId, bags]) => {
      const bagArray = bags as SelectedBag[] | undefined;
      if (!bagArray?.length) return;

      const varietyGroups = Object.groupBy(bagArray, (b: SelectedBag) => b.variety);

      Object.entries(varietyGroups).forEach(([variety, vBags]) => {
        const varietyBagArray = vBags as SelectedBag[] | undefined;
        if (!varietyBagArray?.length) return;

        result.push({
          orderId,
          order: bagArray[0].order,
          variety,
          bags: varietyBagArray,
        });
      });
    });

    return result;
  }, [selectedBags]);

  // Group by orderId for rendering (optimized - no redundant grouping)
  const orderGroupsForRender = useMemo(() => {
    if (groupedBags.length === 0) return [];

    const groups = new Map<string, typeof groupedBags>();
    groupedBags.forEach((group) => {
      if (!groups.has(group.orderId)) {
        groups.set(group.orderId, []);
      }
      groups.get(group.orderId)!.push(group);
    });

    return Array.from(groups.entries());
  }, [groupedBags]);

  // Memoize total calculation
  const totalQuantity = useMemo(() => {
    return selectedBags.reduce((s, b) => s + b.quantity, 0);
  }, [selectedBags]);

  // Total price: sum of (quantity × pricePerBag) for each selected bag
  const totalPrice = useMemo(() => {
    return selectedBags.reduce((sum, b) => sum + b.quantity * (b.pricePerBag ?? 0), 0);
  }, [selectedBags]);

  const hasAnyPrice = useMemo(
    () => selectedBags.some((b) => b.pricePerBag != null && b.pricePerBag > 0),
    [selectedBags]
  );

  // Memoize date formatting function
  const formatDate = useCallback((dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy');
  }, []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto flex flex-col px-6 py-6"
      >
        {/* HEADER */}
        <SheetHeader className="px-0 mb-4">
          <SheetTitle className="text-2xl">Order Summary</SheetTitle>
          <SheetDescription>
            Review all selected bags and add remarks before submitting.
          </SheetDescription>
        </SheetHeader>

        {/* MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto space-y-8">
          {/* ORDER DETAILS */}
          <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 space-y-5">
            <div className="border-b border-primary/20 pb-3">
              <h3 className="text-base font-semibold">Order Details</h3>
              <p className="text-sm text-muted-foreground">Verify details before submitting.</p>
            </div>

            {/* Farmer */}
            {selectedFarmer && (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Farmer
                </p>

                <div className="space-y-1">
                  <p className="text-lg font-semibold">{selectedFarmer.name}</p>

                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      📞 {selectedFarmer.mobileNumber}
                    </div>

                    {selectedFarmer.address && (
                      <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                        📍 {selectedFarmer.address}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Commodity & Variety */}
            <div className="grid grid-cols-2 gap-5">
              {selectedCommodity && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Commodity
                  </p>
                  <p className="font-semibold">{selectedCommodity}</p>
                </div>
              )}

              {selectedVariety && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Variety
                  </p>
                  <p className="font-semibold">{selectedVariety}</p>
                </div>
              )}
            </div>
          </div>

          {/* SELECTED BAGS */}
          {selectedBags.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No bags selected.</p>
          ) : (
            <div className="space-y-6">
              <h3 className="font-semibold text-base">Selected Bags</h3>

              {orderGroupsForRender.map(([orderId, groupArray]) => {
                if (!groupArray?.length) return null;
                const first = groupArray[0];

                return (
                  <div key={orderId} className="rounded-lg border bg-card overflow-hidden">
                    {/* Gate Pass Header */}
                    <div className="px-4 py-3 border-b bg-muted/40 flex justify-between">
                      <div>
                        <p className="font-semibold">Gate Pass #{first.order.gatePassNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(first.order.createdAt)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Commodity</p>
                        <p className="text-sm font-medium">{first.order.commodity}</p>
                      </div>
                    </div>

                    {/* Variety → Bags */}
                    <div className="space-y-4 p-3">
                      {groupArray.map((group, i) => (
                        <div key={`${group.orderId}-${group.variety}-${i}`}>
                          <div className="px-2 py-1.5 bg-muted/20 border rounded text-xs font-semibold mb-2">
                            Variety: {group.variety}
                          </div>

                          <div className="overflow-x-auto">
                            <Table className="w-full text-xs">
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="px-2 py-1">Size</TableHead>
                                  <TableHead className="px-2 py-1">Location</TableHead>
                                  <TableHead className="px-2 text-right">Price</TableHead>
                                  <TableHead className="px-2 text-right">Avail</TableHead>
                                  <TableHead className="px-2 text-right">Sel</TableHead>
                                  <TableHead className="px-2 text-right">Rem</TableHead>
                                </TableRow>
                              </TableHeader>

                              <TableBody>
                                {group.bags.map((bag, j) => {
                                  const remaining = bag.quantityCurr - bag.quantity;

                                  return (
                                    <TableRow
                                      key={`${bag.orderId}-${bag.size}-${bag.variety}-${bag.location}-${j}`}
                                    >
                                      <TableCell className="px-2 py-1">{bag.size}</TableCell>
                                      <TableCell className="px-2 py-1">{bag.location}</TableCell>

                                      <TableCell className="px-2 py-1 text-right text-primary font-medium">
                                        {bag.pricePerBag != null ? `₹${bag.pricePerBag}/bag` : '–'}
                                      </TableCell>

                                      <TableCell className="px-2 py-1 text-right">
                                        {bag.quantityCurr.toFixed(1)}
                                      </TableCell>

                                      <TableCell className="px-2 py-1 text-right font-semibold text-primary">
                                        {bag.quantity.toFixed(1)}
                                      </TableCell>

                                      <TableCell className="px-2 py-1 text-right">
                                        {remaining.toFixed(1)}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TOTAL */}
          <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
            <div className="flex justify-between">
              <p className="text-sm font-semibold">Total Bags Selected:</p>
              <p className="text-lg font-bold text-primary">{totalQuantity.toFixed(1)}</p>
            </div>
            {hasAnyPrice && (
              <div className="flex justify-between items-center border-t pt-2">
                <p className="text-sm font-semibold">Total Amount (₹):</p>
                <p className="text-lg font-bold text-primary">₹{totalPrice.toFixed(2)}</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground border-t pt-2">
              {selectedBags.length} unique bag(s) across {orderGroupsForRender.length} gate passes
            </p>
          </div>

          {/* Payment: Paid / Credit */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">Payment</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="payment-mode"
                  checked={paymentMode === 'paid'}
                  onChange={() => onPaymentModeChange('paid')}
                  className="h-4 w-4 text-primary"
                />
                <span className="text-sm">Paid</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="payment-mode"
                  checked={paymentMode === 'credit'}
                  onChange={() => onPaymentModeChange('credit')}
                  className="h-4 w-4 text-primary"
                />
                <span className="text-sm">Credit</span>
              </label>
            </div>
            {paymentMode === 'paid' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="payment-amount" className="text-sm font-medium">
                    Payment amount (₹)
                  </Label>
                  <Input
                    id="payment-amount"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Enter amount to pre-fill in Add Payment"
                    value={rentAmountForPayment}
                    onChange={(e) => onRentAmountChange(e.target.value)}
                    className="max-w-[200px]"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  After submitting, Add Payment will open with Payment (payment received), farmer,
                  and amount pre-filled.
                </p>
              </>
            )}
          </div>

          {/* REMARKS */}
          <div className="space-y-2">
            <Label htmlFor="remarks" className="font-medium">
              Add Remarks
            </Label>

            <Textarea
              ref={remarksRef}
              id="remarks"
              placeholder="Enter additional remarks..."
              className="min-h-[120px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit();
                }
              }}
            />
          </div>
        </div>

        {/* FOOTER */}
        <SheetFooter className="mt-6 border-t pt-6">
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || selectedBags.length === 0}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// Memoize component to prevent unnecessary re-renders
export const SummarySheet = React.memo(SummarySheetComponent);
