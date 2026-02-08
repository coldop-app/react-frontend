'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { formatDate, formatDateToISO } from '@/lib/helpers';
import { FarmerSearch, DatePicker } from '@/components/forms/index';
import { VarietyEntry } from '@/components/forms/variety-entry';
import { Label } from '@/components/ui/label';
import { IncomingOrderSummarySheet } from '@/components/forms/incoming-order/summary-sheet';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { OrderNumber } from '@/components/forms/order-number';
import { CommoditySelector } from '@/components/forms/commodity-selector';
import { useStore } from '@/stores/store';
import type { DaybookOrder } from '@/types/daybook';
import { toast } from 'sonner';
import { useEditIncomingOrder } from '@/services/base/incoming-orders/useEditIncomingOrder';
import type { EditIncomingOrderInput, IncomingOrderBagSize } from '@/types/incomingOrder';
import { useGetAllFarmers } from '@/services/base/store-admin/functions/useGetAllFarmers';
import { useNavigate } from '@tanstack/react-router';

interface VarietyData {
  id: string;
  variety: string;
  quantities: Record<string, string>;
  customMarka: Record<string, string>;
  locations: Record<string, { chamber: string; floor: string; row: string }>;
  pricePerBagSize: Record<string, string>;
}

interface EditIncomingOrderPageProps {
  order: DaybookOrder | null;
}

export default function EditIncomingOrderPage({ order }: EditIncomingOrderPageProps) {
  const [summarySheetOpen, setSummarySheetOpen] = useState(false);
  const [selectedCommodity, setSelectedCommodity] = useState<string>('');
  const [farmerStorageLinkId, setFarmerStorageLinkId] = useState<string>('');
  const [orderDate, setOrderDate] = useState<string>('');
  const remarksRef = useRef<HTMLTextAreaElement>(null);
  const varietyIdCounterRef = useRef(1);
  const { coldStorage } = useStore();
  const editIncomingOrderMutation = useEditIncomingOrder();
  const farmersQuery = useGetAllFarmers();
  const navigate = useNavigate();

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
  const [varieties, setVarieties] = useState<VarietyData[]>([]);

  // Initialize form data from order when component mounts or order changes
  useEffect(() => {
    if (!order) return;

    // Get commodity sizes
    const commoditySizes =
      coldStorage?.preferences?.commodities?.find((c) => c.name === order.commodity)?.sizes ?? [];

    // Initialize varieties from order data
    const initializedVarieties: VarietyData[] = order.varieties.map((variety, index) => {
      const varietyId = `variety-${index}`;
      const quantities: Record<string, string> = {};
      const customMarka: Record<string, string> = {};
      const locations: Record<string, { chamber: string; floor: string; row: string }> = {};

      variety.bagSizes.forEach((bagSize) => {
        quantities[bagSize.name] = bagSize.quantityCurr.toString();
        locations[bagSize.name] = {
          chamber: bagSize.chamber || '',
          floor: bagSize.floor || '',
          row: bagSize.row || '',
        };
      });

      // Initialize empty quantities/locations for sizes not in bagSizes
      commoditySizes.forEach((size) => {
        if (!quantities[size]) {
          quantities[size] = '';
        }
        if (!locations[size]) {
          locations[size] = { chamber: '', floor: '', row: '' };
        }
      });

      return {
        id: varietyId,
        variety: variety.name,
        quantities,
        customMarka,
        locations,
        pricePerBagSize: commoditySizes.reduce((acc, size) => ({ ...acc, [size]: '' }), {}),
      };
    });

    const defaultVarieties =
      initializedVarieties.length > 0
        ? initializedVarieties
        : [
            {
              id: 'variety-0',
              variety: '',
              quantities: commoditySizes.reduce((acc, size) => ({ ...acc, [size]: '' }), {}),
              customMarka: commoditySizes.reduce((acc, size) => ({ ...acc, [size]: '' }), {}),
              locations: commoditySizes.reduce(
                (acc, size) => ({
                  ...acc,
                  [size]: { chamber: '', floor: '', row: '' },
                }),
                {}
              ),
              pricePerBagSize: commoditySizes.reduce((acc, size) => ({ ...acc, [size]: '' }), {}),
            },
          ];

    // Batch state updates using setTimeout to avoid cascading renders
    setTimeout(() => {
      setFarmerStorageLinkId(order.farmerStorageLinkId);
      setSelectedCommodity(order.commodity);
      setOrderDate(formatDate(new Date(order.date)));
      setVarieties(defaultVarieties);
      varietyIdCounterRef.current = initializedVarieties.length;
      if (remarksRef.current) {
        remarksRef.current.value = order.remarks || '';
      }
    }, 0);
  }, [order, coldStorage?.preferences?.commodities]);

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
        pricePerBagSize: sizes.reduce((acc, size) => ({ ...acc, [size]: '' }), {}),
      },
    ]);
  }, [sizes, generateVarietyId]);

  // Remove a variety entry
  const handleRemoveVariety = useCallback(
    (id: string) => {
      setVarieties((prev) => {
        const filtered = prev.filter((v) => v.id !== id);
        // If no varieties left, add a default one
        if (filtered.length === 0) {
          const newId = 'variety-0';
          return [
            {
              id: newId,
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
              pricePerBagSize: sizes.reduce((acc, size) => ({ ...acc, [size]: '' }), {}),
            },
          ];
        }
        return filtered;
      });
    },
    [sizes]
  );

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
          pricePerBagSize: newSizes.reduce((acc, size) => ({ ...acc, [size]: '' }), {}),
        },
      ]);
      varietyIdCounterRef.current = 1;
    },
    [coldStorage?.preferences?.commodities]
  );

  const handlePricePerBagSizeChange = useCallback((id: string, size: string, value: string) => {
    setVarieties((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, pricePerBagSize: { ...v.pricePerBagSize, [size]: value } } : v
      )
    );
  }, []);

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

  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (!order) {
      toast.error('Order data is missing');
      return;
    }

    // Basic validation
    if (!farmerStorageLinkId) {
      toast.error('Please select a farmer');
      return;
    }

    if (!selectedCommodity) {
      toast.error('Please select a commodity');
      return;
    }

    // Filter varieties that have a name and at least one valid quantity
    const validVarieties = varieties.filter((v) => {
      if (!v.variety || v.variety.trim() === '') return false;
      return Object.values(v.quantities).some((qty) => {
        if (!qty || qty.trim() === '') return false;
        const num = parseFloat(qty);
        return !isNaN(num) && num > 0;
      });
    });

    if (validVarieties.length === 0) {
      toast.error('Please add at least one variety with quantities');
      return;
    }

    // Transform varieties data to API format
    const transformedVarieties = validVarieties.map((v) => {
      // Transform bag sizes - only include sizes with valid quantities
      const bagSizes = sizes
        .filter((size) => {
          const quantity = v.quantities[size];
          return quantity && quantity.trim() !== '' && !isNaN(parseFloat(quantity));
        })
        .map((size) => {
          const quantity = parseFloat(v.quantities[size]);
          const customMarkaValue = v.customMarka?.[size]?.trim();
          const location = v.locations?.[size] || {};

          // Helper to convert empty strings to null
          const toNullIfEmpty = (value: string | undefined | null): string | null => {
            if (!value || value.trim() === '') return null;
            return value.trim();
          };

          // Build bagSize object, only including customMarka if it has a value
          const bagSize: IncomingOrderBagSize = {
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
          };

          return bagSize;
        });

      return {
        name: v.variety,
        bagSizes,
      };
    });

    // Get remarks from ref
    const remarksValue = remarksRef.current?.value || null;

    // Build the payload
    const payload: EditIncomingOrderInput = {
      id: order.id,
      farmerStorageLinkId,
      commodity: selectedCommodity,
      gatePassType: order.gatePassType,
      gatePassNumber: order.gatePassNumber,
      date: formatDateToISO(orderDate), // Convert dd.mm.yyyy to ISO format (2025-12-19T00:00:00.000Z)
      remarks: remarksValue?.trim() || null,
      varieties: transformedVarieties,
    };

    // Submit to API
    editIncomingOrderMutation.mutate(payload, {
      onSuccess: () => {
        setSummarySheetOpen(false);
        // Navigate back or refresh
        navigate({ to: '/store-admin/daybook' });
      },
    });
  }, [
    order,
    farmerStorageLinkId,
    selectedCommodity,
    varieties,
    sizes,
    remarksRef,
    orderDate,
    editIncomingOrderMutation,
    navigate,
  ]);

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

  if (!order) {
    return (
      <div className="flex w-full max-w-3xl flex-col gap-8 mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Order Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The order you're trying to edit could not be found.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-8 mx-auto px-4">
      <Card>
        <CardHeader className="pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left side: Order info */}
            <div className="flex flex-col">
              <OrderNumber gatePassNumber={order.gatePassNumber} type="Receipt" name="Voucher" />
              <CardTitle className="text-2xl mt-2">Edit Incoming Order</CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6">
          <div className="space-y-10">
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Update the details of this incoming order voucher.
                </p>
                <div className="space-y-4">
                  <Label htmlFor="farmer-search" className="text-base font-medium">
                    Select Farmer
                  </Label>
                  <FarmerSearch
                    onSelect={(id: string) => {
                      setFarmerStorageLinkId(id);
                    }}
                    defaultValue={farmerStorageLinkId}
                  />
                </div>
              </div>
            </div>

            {!hasSingleCommodity && (
              <CommoditySelector
                onSelect={handleCommodityChange}
                defaultValue={selectedCommodity}
              />
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
                  disabled={!selectedCommodity}
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
                    onPricePerBagSizeChange={handlePricePerBagSizeChange}
                    quantities={varietyData.quantities}
                    customMarka={varietyData.customMarka}
                    locations={varietyData.locations}
                    pricePerBagSize={varietyData.pricePerBagSize}
                    onLastFieldEnter={() => {
                      if (index === varieties.length - 1) {
                        setSummarySheetOpen(true);
                      }
                    }}
                    canRemove={varieties.length > 1}
                    disabled={!selectedCommodity}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between items-center pt-6 border-t">
          <div></div>
          <div>
            <Button onClick={() => setSummarySheetOpen(true)}>Next</Button>
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
        isNullVoucher={false}
        hasSingleCommodity={hasSingleCommodity}
        remarksRef={remarksRef}
        onSubmit={handleSubmit}
        isSubmitting={editIncomingOrderMutation.isPending}
      />
    </div>
  );
}
