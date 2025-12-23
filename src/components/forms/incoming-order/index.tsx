'use client';

import { FarmerSearch, DatePicker } from '@/components/forms/index';
import { formatDate, formatDateToISO } from '@/lib/helpers';
import { VarietyEntry } from '@/components/forms/variety-entry';
import { Label } from '@/components/ui/label';
import { IncomingOrderSummarySheet } from './summary-sheet';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useStore } from '@/stores/store';
import { Plus } from 'lucide-react';
import { OrderNumber } from '@/components/forms/order-number';
import { CommoditySelector } from '@/components/forms/commodity-selector';
import { useGetGatePassNumber } from '@/services/base/incoming-orders/useGatePassNumber';
import type {
  Commodity,
  CreateIncomingOrderInput,
  IncomingOrderBagSize,
} from '@/types/incomingOrder';
import { useCreateIncomingOrder } from '@/services/base/incoming-orders/useCreateIncomingOrder';
import { toast } from 'sonner';
import { useGetAllFarmers } from '@/services/base/store-admin/functions/useGetAllFarmers';
import {
  incomingOrderFormSchema,
  nullVoucherFormSchema,
  type IncomingOrderFormData,
} from '@/schemas/incomingOrderFormSchema';
interface VarietyData {
  id: string;
  variety: string;
  quantities: Record<string, string>;
  customMarka: Record<string, string>;
  locations: Record<string, { chamber: string; floor: string; row: string }>;
}

interface SubmittedFormData {
  farmer: string;
  orderDate: string;
  remarks: string;
  varieties: Array<{
    variety: string;
    quantities: Record<string, string>;
    customMarka: Record<string, string>;
    locations: Record<string, { chamber: string; floor: string; row: string }>;
  }>;
}

export default function IncomingOrderPage() {
  const [submittedData, setSubmittedData] = useState<SubmittedFormData | null>(null);
  const [isNullVoucher, setIsNullVoucher] = useState(false);
  const [showNullVoucherDialog, setShowNullVoucherDialog] = useState(false);
  const [summarySheetOpen, setSummarySheetOpen] = useState(false);
  const [selectedCommodity, setSelectedCommodity] = useState<string>('');
  const [farmerStorageLinkId, setFarmerStorageLinkId] = useState<string>('');
  const [orderDate, setOrderDate] = useState<string>(() => formatDate(new Date()));
  const remarksRef = useRef<HTMLTextAreaElement>(null);
  const varietyIdCounterRef = useRef(1);
  const { coldStorage } = useStore();

  const { data } = useGetGatePassNumber((selectedCommodity as Commodity) || undefined, 'incoming');
  const createIncomingOrderMutation = useCreateIncomingOrder();
  const farmersQuery = useGetAllFarmers();

  // Get sizes based on selected commodity
  const sizes = useMemo(() => {
    if (!selectedCommodity) return [];
    return (
      coldStorage?.preferences?.commodities?.find((c) => c.name === selectedCommodity)?.sizes ?? []
    );
  }, [coldStorage?.preferences?.commodities, selectedCommodity]);

  // Get showCustomMarka preference
  const showCustomMarka = useMemo(() => {
    return coldStorage?.preferences?.incoming?.showCustomMarka ?? false;
  }, [coldStorage?.preferences?.incoming?.showCustomMarka]);

  // Get available varieties from preferences based on selected commodity
  const availableVarieties = useMemo(() => {
    if (!selectedCommodity) return [];
    return (
      coldStorage?.preferences?.commodities?.find((c) => c.name === selectedCommodity)?.varieties ??
      []
    );
  }, [coldStorage?.preferences?.commodities, selectedCommodity]);

  // Check if there's only one commodity available
  const hasSingleCommodity = useMemo(() => {
    return (coldStorage?.preferences?.commodities?.length ?? 0) === 1;
  }, [coldStorage?.preferences?.commodities]);

  // Generate a stable ID for variety entries
  const generateVarietyId = useCallback(() => {
    const id = `variety-${varietyIdCounterRef.current}`;
    varietyIdCounterRef.current += 1;
    return id;
  }, []);

  // State for managing multiple varieties
  const [varieties, setVarieties] = useState<VarietyData[]>(() => {
    // Initialize with one empty variety entry using a stable ID
    return [
      {
        id: 'variety-0',
        variety: '',
        quantities: sizes.reduce((acc, size) => ({ ...acc, [size]: '' }), {}),
        customMarka: sizes.reduce((acc, size) => ({ ...acc, [size]: '' }), {}),
        locations: sizes.reduce(
          (acc, size) => ({
            ...acc,
            [size]: { chamber: '', floor: '', row: '' },
          }),
          {}
        ),
      },
    ];
  });

  // Add a new variety entry
  const handleAddVariety = useCallback(() => {
    setVarieties((prev) => [
      ...prev,
      {
        id: generateVarietyId(),
        variety: '',
        quantities: sizes.reduce((acc, size) => ({ ...acc, [size]: '' }), {}),
        customMarka: sizes.reduce((acc, size) => ({ ...acc, [size]: '' }), {}),
        locations: sizes.reduce(
          (acc, size) => ({
            ...acc,
            [size]: { chamber: '', floor: '', row: '' },
          }),
          {}
        ),
      },
    ]);
  }, [sizes, generateVarietyId]);

  // Remove a variety entry
  const handleRemoveVariety = useCallback((id: string) => {
    setVarieties((prev) => prev.filter((v) => v.id !== id));
  }, []);

  // Update variety selection
  const handleVarietyChange = useCallback((id: string, variety: string) => {
    setVarieties((prev) => prev.map((v) => (v.id === id ? { ...v, variety } : v)));
  }, []);

  // Update quantity for a specific variety and size
  const handleQuantityChange = useCallback((id: string, size: string, quantity: string) => {
    setVarieties((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, quantities: { ...v.quantities, [size]: quantity } } : v
      )
    );
  }, []);

  // Update custom marka for a specific variety and size
  const handleCustomMarkaChange = useCallback((id: string, size: string, customMarka: string) => {
    setVarieties((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, customMarka: { ...v.customMarka, [size]: customMarka } } : v
      )
    );
  }, []);

  // Update location for a specific variety and size
  const handleLocationChange = useCallback(
    (id: string, size: string, field: 'chamber' | 'floor' | 'row', value: string) => {
      setVarieties((prev) =>
        prev.map((v) =>
          v.id === id
            ? {
                ...v,
                locations: {
                  ...v.locations,
                  [size]: {
                    ...v.locations[size],
                    [field]: value,
                  },
                },
              }
            : v
        )
      );
    },
    []
  );

  // Handle commodity selection and reset varieties
  const handleCommodityChange = useCallback(
    (commodity: string) => {
      setSelectedCommodity(commodity);
      // Reset varieties when commodity changes
      const newSizes =
        coldStorage?.preferences?.commodities?.find((c) => c.name === commodity)?.sizes ?? [];
      setVarieties([
        {
          id: 'variety-0',
          variety: '',
          quantities: newSizes.reduce((acc, size) => ({ ...acc, [size]: '' }), {}),
          customMarka: newSizes.reduce((acc, size) => ({ ...acc, [size]: '' }), {}),
          locations: newSizes.reduce(
            (acc, size) => ({
              ...acc,
              [size]: { chamber: '', floor: '', row: '' },
            }),
            {}
          ),
        },
      ]);
      varietyIdCounterRef.current = 1;
    },
    [coldStorage?.preferences?.commodities]
  );

  // Auto-select the single commodity if there's only one
  useEffect(() => {
    if (hasSingleCommodity && !selectedCommodity) {
      const singleCommodity = coldStorage?.preferences?.commodities?.[0]?.name;
      if (singleCommodity) {
        // Directly set the commodity and reset varieties
        setSelectedCommodity(singleCommodity);
        const newSizes =
          coldStorage?.preferences?.commodities?.find((c) => c.name === singleCommodity)?.sizes ??
          [];
        setVarieties([
          {
            id: 'variety-0',
            variety: '',
            quantities: newSizes.reduce((acc, size) => ({ ...acc, [size]: '' }), {}),
            customMarka: newSizes.reduce((acc, size) => ({ ...acc, [size]: '' }), {}),
            locations: newSizes.reduce(
              (acc, size) => ({
                ...acc,
                [size]: { chamber: '', floor: '', row: '' },
              }),
              {}
            ),
          },
        ]);
        varietyIdCounterRef.current = 1;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSingleCommodity, selectedCommodity]);

  // Handle Create Null Voucher confirmation
  const handleConfirmNullVoucher = useCallback(() => {
    // Validate that farmer is selected before creating null voucher
    if (!farmerStorageLinkId) {
      toast.error('Please select a farmer before creating a null voucher');
      setShowNullVoucherDialog(false);
      return;
    }

    // Validate that commodity is selected
    if (!selectedCommodity) {
      toast.error('Please select a commodity before creating a null voucher');
      setShowNullVoucherDialog(false);
      return;
    }

    // Reset varieties (empty array for null voucher)
    setVarieties([
      {
        id: 'variety-0',
        variety: '',
        quantities: sizes.reduce((acc, size) => ({ ...acc, [size]: '' }), {}),
        customMarka: sizes.reduce((acc, size) => ({ ...acc, [size]: '' }), {}),
        locations: sizes.reduce(
          (acc, size) => ({
            ...acc,
            [size]: { chamber: '', floor: '', row: '' },
          }),
          {}
        ),
      },
    ]);

    // Reset date to today
    setOrderDate(formatDate(new Date()));

    // Set null voucher mode and open summary sheet
    setIsNullVoucher(true);
    setSummarySheetOpen(true);
    setShowNullVoucherDialog(false);
  }, [sizes, farmerStorageLinkId, selectedCommodity]);

  const handleSubmit = useCallback(() => {
    const gatePassNumber = data?.data?.nextGatePassNumber;
    if (!gatePassNumber) {
      toast.error('Gate pass number not available. Please select a commodity.');
      return;
    }

    // Get remarks
    const remarks = remarksRef.current?.value || null;

    // Prepare form data for validation
    const formData = {
      farmerStorageLinkId,
      commodity: selectedCommodity as Commodity,
      remarks: remarks || null,
      varieties: isNullVoucher ? [] : varieties.filter((v) => v.variety), // Filter out empty varieties
    };

    // Validate using Zod schema
    let validationResult;
    if (isNullVoucher) {
      validationResult = nullVoucherFormSchema.safeParse({
        ...formData,
        varieties: [],
      });
    } else {
      validationResult = incomingOrderFormSchema.safeParse(formData);
    }

    // Handle validation errors
    if (!validationResult.success) {
      const errors = validationResult.error.issues;
      // Show first error message
      const firstError = errors[0];
      if (firstError) {
        const errorMessage = firstError.message || `Validation error: ${firstError.path.join('.')}`;
        toast.error(errorMessage);
      } else {
        toast.error('Please check your form data and try again');
      }
      return;
    }

    // Transform validated form data into API payload
    const payload: CreateIncomingOrderInput = {
      farmerStorageLinkId: validationResult.data.farmerStorageLinkId,
      commodity: validationResult.data.commodity,
      gatePassNumber,
      remarks: validationResult.data.remarks?.trim() || null,
      date: formatDateToISO(orderDate), // Convert dd.mm.yyyy to ISO format (2025-12-19T00:00:00.000Z)
    };

    // For null voucher, varieties array is empty and gatePassType is optional
    if (isNullVoucher) {
      payload.varieties = [];
      // gatePassType is optional for null voucher, so we can omit it
    } else {
      // Regular voucher - include gatePassType and varieties
      payload.gatePassType = 'RECEIPT';

      // Transform validated varieties data
      const validatedData = validationResult.data as IncomingOrderFormData;
      payload.varieties = validatedData.varieties.map((v) => {
        // Transform bag sizes
        const bagSizes = sizes
          .filter((size) => {
            const quantity = v.quantities[size];
            return quantity && quantity.trim() !== '' && !isNaN(parseFloat(quantity));
          })
          .map((size) => {
            const quantity = parseFloat(v.quantities[size]); // Use parseFloat to support decimals
            const customMarkaValue = v.customMarka?.[size]?.trim();
            const location = v.locations?.[size] || {};

            // Helper to convert empty strings to null
            const toNullIfEmpty = (value: string | undefined | null): string | null => {
              if (!value || value.trim() === '') return null;
              return value.trim();
            };

            // Build bagSize object, only including customMarka if it has a value
            const bagSize = {
              name: size,
              quantityInit: quantity,
              quantityCurr: quantity,
              approxWeight: null, // Not captured in form, set to null
              floor: toNullIfEmpty(location.floor),
              row: toNullIfEmpty(location.row),
              chamber: toNullIfEmpty(location.chamber),
              ...(customMarkaValue && customMarkaValue.trim() !== ''
                ? { customMarka: customMarkaValue.trim() }
                : {}),
            } as IncomingOrderBagSize;

            return bagSize;
          });

        return {
          name: v.variety,
          bagSizes,
        };
      });
    }

    // Submit to API
    createIncomingOrderMutation.mutate(payload, {
      onSuccess: () => {
        // Reset form after successful submission
        setVarieties([
          {
            id: 'variety-0',
            variety: '',
            quantities: sizes.reduce((acc, size) => ({ ...acc, [size]: '' }), {}),
            customMarka: sizes.reduce((acc, size) => ({ ...acc, [size]: '' }), {}),
            locations: sizes.reduce(
              (acc, size) => ({
                ...acc,
                [size]: { chamber: '', floor: '', row: '' },
              }),
              {}
            ),
          },
        ]);
        setSelectedCommodity('');
        setFarmerStorageLinkId('');
        setOrderDate(formatDate(new Date())); // Reset to today's date
        setIsNullVoucher(false);
        setSummarySheetOpen(false);
        if (remarksRef.current) {
          remarksRef.current.value = '';
        }
        setSubmittedData(null);
      },
    });
  }, [
    farmerStorageLinkId,
    selectedCommodity,
    data?.data?.nextGatePassNumber,
    remarksRef,
    isNullVoucher,
    varieties,
    sizes,
    createIncomingOrderMutation,
    orderDate,
  ]);

  // Get farmer name from farmerStorageLinkId
  const selectedFarmer = useMemo(() => {
    if (!farmerStorageLinkId || !farmersQuery.data?.data) return null;
    return farmersQuery.data?.data.find((f) => f.id === farmerStorageLinkId) ?? null;
  }, [farmerStorageLinkId, farmersQuery.data?.data]);

  // Calculate total quantities for each variety
  const varietyTotals = useMemo(() => {
    return varieties
      .filter((v) => v.variety)
      .map((v) => {
        const total = sizes.reduce((sum, size) => {
          const quantity = v.quantities[size];
          if (quantity && quantity.trim() !== '') {
            const num = parseFloat(quantity);
            return sum + (isNaN(num) ? 0 : num);
          }
          return sum;
        }, 0);
        return { variety: v.variety, total, quantities: v.quantities, locations: v.locations };
      });
  }, [varieties, sizes]);

  // Calculate grand total
  const grandTotal = useMemo(() => {
    return varietyTotals.reduce((sum, v) => sum + v.total, 0);
  }, [varietyTotals]);

  // Auto-focus on first input when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      const farmerSearchButton = document.getElementById('farmer-search');
      if (farmerSearchButton) {
        farmerSearchButton.focus();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex w-full max-w-3xl flex-col gap-8 mx-auto px-4">
      <Card>
        <CardHeader className="pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left side: Order info */}
            <div className="flex flex-col">
              <OrderNumber
                gatePassNumber={data?.data?.nextGatePassNumber}
                type="Receipt"
                name="Voucher"
              />
              <CardTitle className="text-2xl mt-2">Incoming Order</CardTitle>
            </div>

            {/* Right side: Action */}
            <Button variant="secondary" onClick={() => setShowNullVoucherDialog(true)}>
              Create Null Voucher
            </Button>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6">
          <div className={cn('space-y-10', isNullVoucher && 'pointer-events-none opacity-50')}>
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Select or add a farmer to start creating an incoming order.
                </p>
                <div className="space-y-4">
                  <Label htmlFor="farmer-search" className="text-base font-medium">
                    Select Farmer
                  </Label>
                  <FarmerSearch
                    onSelect={(id: string) => {
                      setFarmerStorageLinkId(id);
                    }}
                  />
                </div>
              </div>
            </div>

            {!hasSingleCommodity && (
              <CommoditySelector onSelect={handleCommodityChange} disabled={isNullVoucher} />
            )}
            <DatePicker value={orderDate} onChange={setOrderDate} />

            {/* Varieties Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Varieties</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add one or more varieties with their quantities and locations
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddVariety}
                  className="gap-2"
                  disabled={isNullVoucher || !selectedCommodity}
                >
                  <Plus className="h-4 w-4" />
                  Add Variety
                </Button>
              </div>
              <div className="space-y-8">
                {varieties.map((varietyData, index) => (
                  <VarietyEntry
                    key={varietyData.id}
                    index={index}
                    varietyId={varietyData.id}
                    variety={varietyData.variety}
                    commodity={selectedCommodity}
                    sizes={sizes}
                    showCustomMarka={showCustomMarka}
                    varieties={availableVarieties}
                    onRemove={handleRemoveVariety}
                    onVarietyChange={handleVarietyChange}
                    onQuantityChange={handleQuantityChange}
                    onCustomMarkaChange={handleCustomMarkaChange}
                    onLocationChange={handleLocationChange}
                    quantities={varietyData.quantities}
                    customMarka={varietyData.customMarka}
                    locations={varietyData.locations}
                    onLastFieldEnter={() => {
                      // Open summary sheet when Enter is pressed on last field of last variety
                      if (index === varieties.length - 1) {
                        setSummarySheetOpen(true);
                      }
                    }}
                    canRemove={varieties.length > 1}
                    disabled={isNullVoucher || !selectedCommodity}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between items-center pt-6 border-t">
          <div></div>
          <div>
            <Button onClick={() => setSummarySheetOpen(true)} disabled={isNullVoucher}>
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Summary Sheet */}
      <IncomingOrderSummarySheet
        open={summarySheetOpen}
        onOpenChange={setSummarySheetOpen}
        selectedFarmer={selectedFarmer}
        orderDate={orderDate}
        selectedCommodity={selectedCommodity}
        varietyTotals={varietyTotals}
        grandTotal={grandTotal}
        sizes={sizes}
        isNullVoucher={isNullVoucher}
        hasSingleCommodity={hasSingleCommodity}
        remarksRef={remarksRef}
        onSubmit={handleSubmit}
        isSubmitting={createIncomingOrderMutation.isPending}
      />

      {/* Display submitted data */}
      {submittedData && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-2xl">Submitted Form Data</CardTitle>
            <CardDescription>All the details you entered:</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(submittedData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Null Voucher Confirmation Dialog */}
      <AlertDialog open={showNullVoucherDialog} onOpenChange={setShowNullVoucherDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create Null Voucher?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all form data and create a null voucher. All information fields will
              be disabled, and you will be redirected to the Summary sheet to add remarks. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmNullVoucher}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
