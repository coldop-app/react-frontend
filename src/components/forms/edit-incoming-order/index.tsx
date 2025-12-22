import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { formatDate, formatDateToISO } from '@/lib/helpers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FarmerSearch } from '@/components/forms/farmer-search';
import { CommoditySelector } from '@/components/forms/commodity-selector';
import { VarietySelector } from '@/components/forms/variety-selector';
import { QuantityInputSection } from '@/components/forms/quantity-input';
import { LocationInputSection } from '@/components/forms/location-input';
import { DatePicker } from '@/components/forms/date-picker';
import { useStore } from '@/stores/store';
import type { DaybookOrder } from '@/types/daybook';
import { cn } from '@/lib/utils';
import { Plus, X } from 'lucide-react';
import { OrderNumber } from '@/components/forms/order-number';
import { toast } from 'sonner';
import { useEditIncomingOrder } from '@/services/base/incoming-orders/useEditIncomingOrder';
import type { EditIncomingOrderInput, IncomingOrderBagSize } from '@/types/incomingOrder';

interface VarietyData {
  id: string;
  variety: string;
  quantities: Record<string, string>;
  customMarka: Record<string, string>;
  locations: Record<string, { chamber: string; floor: string; row: string }>;
}

interface EditIncomingOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: DaybookOrder | null;
}

export default function EditIncomingOrderDialog({
  open,
  onOpenChange,
  order,
}: EditIncomingOrderDialogProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [activeVarietyTab, setActiveVarietyTab] = useState<string>('');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('');
  const [farmerStorageLinkId, setFarmerStorageLinkId] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [orderDate, setOrderDate] = useState<string>('');
  const remarksRef = useRef<HTMLTextAreaElement>(null);
  const varietyIdCounterRef = useRef(1);
  const { coldStorage } = useStore();
  const editIncomingOrderMutation = useEditIncomingOrder();

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

  // Generate a stable ID for variety entries
  const generateVarietyId = useCallback(() => {
    const id = `variety-${varietyIdCounterRef.current}`;
    varietyIdCounterRef.current += 1;
    return id;
  }, []);

  // State for managing multiple varieties
  const [varieties, setVarieties] = useState<VarietyData[]>([]);

  // Initialize form data from order when dialog opens
  useEffect(() => {
    if (!open || !order) return;

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
            },
          ];

    // Batch state updates using setTimeout to avoid cascading renders
    setTimeout(() => {
      setFarmerStorageLinkId(order.farmerStorageLinkId);
      setSelectedCommodity(order.commodity);
      setRemarks(order.remarks || '');
      setOrderDate(formatDate(new Date(order.date)));
      setVarieties(defaultVarieties);
      varietyIdCounterRef.current = initializedVarieties.length;
      setActiveStep(0);
      if (defaultVarieties.length > 0) {
        setActiveVarietyTab(defaultVarieties[0].id);
      }
      if (remarksRef.current) {
        remarksRef.current.value = order.remarks || '';
      }
    }, 0);
  }, [open, order, coldStorage?.preferences?.commodities]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      // Use setTimeout to batch state updates and avoid cascading renders
      setTimeout(() => {
        setActiveStep(0);
        setSelectedCommodity('');
        setFarmerStorageLinkId('');
        setRemarks('');
        setOrderDate('');
        setVarieties([]);
        setActiveVarietyTab('');
        varietyIdCounterRef.current = 1;
      }, 0);
    }
  }, [open]);

  // Add a new variety entry
  const handleAddVariety = useCallback(() => {
    const newId = generateVarietyId();
    setVarieties((prev) => {
      // Find the index of the currently active variety
      const activeIndex = prev.findIndex((v) => v.id === activeVarietyTab);

      // If there's an active variety, insert after it; otherwise append to end
      if (activeIndex >= 0) {
        const newVariety = {
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
        };
        // Insert after the active variety
        return [...prev.slice(0, activeIndex + 1), newVariety, ...prev.slice(activeIndex + 1)];
      } else {
        // If no active variety, append to end
        return [
          ...prev,
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
          },
        ];
      }
    });
    // Switch to the new variety tab
    setActiveVarietyTab(newId);
    // Switch to Varieties tab if not already there
    setActiveStep(1);
  }, [sizes, generateVarietyId, activeVarietyTab]);

  // Remove a variety entry
  const handleRemoveVariety = useCallback(
    (id: string) => {
      setVarieties((prev) => {
        const filtered = prev.filter((v) => v.id !== id);
        // If we removed the active variety, switch to first remaining variety
        if (activeVarietyTab === id && filtered.length > 0) {
          setActiveVarietyTab(filtered[0].id);
        } else if (filtered.length === 0) {
          // If no varieties left, add a default one
          const newId = 'variety-0';
          setActiveVarietyTab(newId);
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
            },
          ];
        }
        return filtered;
      });
    },
    [activeVarietyTab, sizes]
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
        },
      ]);
      varietyIdCounterRef.current = 1;
    },
    [coldStorage?.preferences?.commodities]
  );

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
        return { variety: v.variety, total, quantities: v.quantities };
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

    // Build the payload
    const payload: EditIncomingOrderInput = {
      id: order.id,
      farmerStorageLinkId,
      commodity: selectedCommodity,
      gatePassType: order.gatePassType,
      gatePassNumber: order.gatePassNumber,
      date: formatDateToISO(orderDate), // Convert dd.mm.yyyy to ISO format (2025-12-19T00:00:00.000Z)
      remarks: remarks.trim() || null,
      varieties: transformedVarieties,
    };

    // Submit to API
    editIncomingOrderMutation.mutate(payload, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  }, [
    order,
    farmerStorageLinkId,
    selectedCommodity,
    varieties,
    sizes,
    remarks,
    orderDate,
    editIncomingOrderMutation,
    onOpenChange,
  ]);

  const steps = [
    {
      title: 'Info',
      description: 'Farmer details, commodity, and date.',
      content: (
        <div className="space-y-6">
          {/* Voucher Number - Read Only */}
          {order && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Voucher Number</Label>
              <div className="px-3 py-2 bg-muted/50 rounded-md border border-border">
                <p className="text-sm font-medium text-foreground">{order.gatePassNumber}</p>
              </div>
              <p className="text-xs text-muted-foreground">Voucher number cannot be changed</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="farmer-search" className="text-sm font-medium text-foreground">
                Select Farmer
              </Label>
              <FarmerSearch
                onSelect={(id) => {
                  setFarmerStorageLinkId(id);
                }}
                defaultValue={farmerStorageLinkId}
              />
            </div>
          </div>

          <CommoditySelector onSelect={handleCommodityChange} defaultValue={selectedCommodity} />

          <DatePicker value={orderDate} onChange={setOrderDate} />
        </div>
      ),
    },
    {
      title: 'Varieties',
      description: 'Manage varieties, quantities, and locations.',
      content: (
        <div className="space-y-4">
          {/* Add Variety Button */}
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddVariety}
              className="gap-2 h-9"
            >
              <Plus className="h-4 w-4" />
              Add Variety
            </Button>
          </div>

          {/* Variety Sub-tabs */}
          {varieties.length > 0 && (
            <Tabs value={activeVarietyTab} onValueChange={setActiveVarietyTab} className="w-full">
              <div className="border-b border-border">
                <TabsList className="h-auto w-full bg-transparent p-0 justify-start gap-0 overflow-x-auto">
                  {varieties.map((varietyData, index) => (
                    <TabsTrigger
                      key={varietyData.id}
                      value={varietyData.id}
                      className={cn(
                        'rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 text-sm font-medium transition-all',
                        'hover:bg-muted/50 hover:text-foreground',
                        'data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none',
                        'text-muted-foreground',
                        index === 0 && 'pl-0'
                      )}
                    >
                      {varietyData.variety || `Variety ${index + 1}`}
                      {varieties.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveVariety(varietyData.id);
                          }}
                          className="ml-2 h-5 w-5 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Variety Content */}
              {varieties.map((varietyData) => (
                <TabsContent key={varietyData.id} value={varietyData.id} className="mt-6 space-y-6">
                  {/* Variety Selector */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground">Select Variety</Label>
                    <VarietySelector
                      key={`${varietyData.id}-${selectedCommodity || 'no-commodity'}`}
                      id={`variety-selector-${varietyData.id}`}
                      onSelect={(value) => handleVarietyChange(varietyData.id, value)}
                      varieties={availableVarieties}
                      defaultValue={varietyData.variety}
                    />
                  </div>

                  {/* Quantities Section */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground">Quantities</Label>
                    <QuantityInputSection
                      quantities={varietyData.quantities}
                      customMarka={varietyData.customMarka}
                      onQuantityChange={(size, quantity) =>
                        handleQuantityChange(varietyData.id, size, quantity)
                      }
                      onCustomMarkaChange={(size, customMarka) =>
                        handleCustomMarkaChange(varietyData.id, size, customMarka)
                      }
                      varietyId={varietyData.id}
                      sizes={sizes}
                      disabled={!varietyData.variety}
                      showCustomMarka={showCustomMarka}
                      inline={true}
                    />
                  </div>

                  {/* Locations Section */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground">Locations</Label>
                    <LocationInputSection
                      locations={varietyData.locations}
                      onLocationChange={(size, field, value) =>
                        handleLocationChange(varietyData.id, size, field, value)
                      }
                      varietyId={varietyData.id}
                      commodity={selectedCommodity}
                      sizes={sizes.filter((size) => {
                        const quantity = varietyData.quantities[size];
                        return quantity && quantity.trim() !== '' && !isNaN(parseFloat(quantity));
                      })}
                      disabled={!varietyData.variety}
                      showApplyToAll={true}
                      inline={true}
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      ),
    },
    {
      title: 'Summary',
      description: 'Review changes and add remarks.',
      content: (
        <div className="space-y-6">
          {/* Order Summary */}
          <Card className="border">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Order Summary</CardTitle>
              <CardDescription className="text-xs">
                Review the details before submitting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-0">
              {/* Voucher Number */}
              {order && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Voucher Number
                  </Label>
                  <p className="text-sm font-medium text-foreground">{order.gatePassNumber}</p>
                </div>
              )}

              {/* Commodity */}
              {selectedCommodity && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Commodity</Label>
                  <p className="text-sm font-medium text-foreground">{selectedCommodity}</p>
                </div>
              )}

              {/* Varieties and Quantities */}
              {varietyTotals.length > 0 && (
                <div className="space-y-4">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Varieties & Quantities
                  </Label>
                  <div className="space-y-3">
                    {varietyTotals.map((vt, idx) => (
                      <div key={idx} className="rounded-md border bg-card overflow-hidden">
                        {/* Header Section */}
                        <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b">
                          <h3 className="text-sm font-semibold text-foreground">{vt.variety}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">
                              Total:
                            </span>
                            <span className="text-base font-bold text-primary">
                              {vt.total.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                        {/* Quantities Grid */}
                        <div className="p-4">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2">
                            {sizes.map((size) => {
                              const qty = vt.quantities[size];
                              if (!qty || qty.trim() === '') return null;
                              return (
                                <div
                                  key={size}
                                  className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-b-0"
                                >
                                  <span className="text-xs font-medium text-muted-foreground">
                                    {size}
                                  </span>
                                  <span className="text-xs font-semibold text-foreground ml-3">
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
                    <div className="rounded-md border-2 border-primary/20 bg-primary/5 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold text-foreground">Grand Total</Label>
                        <p className="text-xl font-bold text-primary">
                          {grandTotal.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="remarks" className="text-sm font-medium text-foreground">
              Add Remarks
            </Label>
            <Textarea
              ref={remarksRef}
              id="remarks"
              placeholder="Enter any additional remarks or notes..."
              className="min-h-[100px] text-sm"
              defaultValue={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </div>
      ),
    },
  ];

  const isLastStep = activeStep === steps.length - 1;
  const isFirstStep = activeStep === 0;

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">Edit Incoming Order</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Update the details of this incoming order voucher
          </DialogDescription>
        </DialogHeader>

        <div className="w-full">
          <Tabs value={steps[activeStep].title} className="w-full">
            {/* Step Titles - Horizontal Tab Bar */}
            <div className="border-b border-border px-6">
              <TabsList className="h-auto w-full bg-transparent p-0 justify-start gap-0">
                {steps.map((step, i) => (
                  <TabsTrigger
                    key={step.title}
                    value={step.title}
                    className={cn(
                      'rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 text-sm font-medium transition-all',
                      'hover:bg-muted/50 hover:text-foreground',
                      'data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none',
                      'text-muted-foreground',
                      i === 0 && 'pl-0',
                      i === steps.length - 1 && 'pr-0'
                    )}
                    onClick={() => setActiveStep(i)}
                  >
                    {step.title}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Step Content */}
            {steps.map((step) => (
              <TabsContent key={step.title} value={step.title} className="mt-0">
                <div className="px-6 py-6">
                  {/* Step Header */}
                  <div className="mb-6">
                    {order && (
                      <div className="mb-2">
                        <OrderNumber
                          gatePassNumber={order.gatePassNumber}
                          type="Receipt"
                          name="Voucher"
                        />
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                    {step.description && (
                      <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="space-y-6">{step.content}</div>

                  {/* Step Footer */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6 mt-6 border-t">
                    <div>
                      {!isFirstStep && (
                        <Button variant="outline" onClick={() => setActiveStep((s) => s - 1)}>
                          Back
                        </Button>
                      )}
                    </div>
                    <div>
                      {isLastStep ? (
                        <Button
                          onClick={handleSubmit}
                          className="w-full sm:w-auto"
                          disabled={editIncomingOrderMutation.isPending}
                        >
                          {editIncomingOrderMutation.isPending ? 'Updating...' : 'Update Order'}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => setActiveStep((s) => s + 1)}
                          className="w-full sm:w-auto"
                        >
                          Next
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
