import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useStore } from '@/stores/store';
import type { CreateOutgoingOrderInput } from '@/types/outgoingOrder';
import { useGetGatePassNumber } from '@/services/base/incoming-orders/useGatePassNumber';
import { useCreateOutgoingOrder } from '@/services/base/outgoing-orders/useCreateOutgoingOrder';
import { useGetAllFarmers } from '@/services/base/store-admin/functions/useGetAllFarmers';
import { useGetOrdersOfFarmer } from '@/services/base/store-admin/functions/useGetOrdersOfFarmer';
import type { DaybookOrder } from '@/types/daybook';
import { toast } from 'sonner';
import { formatDate, formatDateToISO } from '@/lib/helpers';

export function useOutgoingOrder() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedCommodity, setSelectedCommodity] = useState<string>('');
  const [farmerStorageLinkId, setFarmerStorageLinkId] = useState<string>('');
  const [selectedVariety, setSelectedVariety] = useState<string>('');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set());
  const [quantities, setQuantities] = useState<Map<string, number>>(new Map());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCardKey, setSelectedCardKey] = useState<string | null>(null);
  const [quantityInput, setQuantityInput] = useState<string>('');
  const [maxQuantity, setMaxQuantity] = useState<number>(0);
  const [quantityError, setQuantityError] = useState<string>('');
  const [summarySheetOpen, setSummarySheetOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'paid' | 'credit'>('credit');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentDialogInitialData, setPaymentDialogInitialData] = useState<{
    paymentType: 'RENT' | 'PAYMENT' | 'EXPENSE';
    farmerStorageLinkId: string;
    amount?: string;
    date?: string;
  } | null>(null);
  const [orderDate, setOrderDate] = useState<string>(() => formatDate(new Date()));
  const remarksRef = useRef<HTMLTextAreaElement>(null);
  const autoSelectedCommodityRef = useRef<string>('');
  const { coldStorage } = useStore();

  const { data } = useGetGatePassNumber(selectedCommodity || undefined, 'outgoing');
  const createOutgoingOrderMutation = useCreateOutgoingOrder();
  const farmersQuery = useGetAllFarmers();
  const farmerOrdersQuery = useGetOrdersOfFarmer({
    farmerStorageLinkId,
    type: 'incoming',
    enabled: !!farmerStorageLinkId,
  });

  // Extract unique commodities from farmer's incoming orders
  const availableCommodities = useMemo(() => {
    if (!farmerStorageLinkId || !farmerOrdersQuery.data?.data) return [];
    const commoditySet = new Set<string>();
    farmerOrdersQuery.data.data.forEach((order) => {
      if (order.commodity) {
        commoditySet.add(order.commodity);
      }
    });
    return Array.from(commoditySet).sort();
  }, [farmerStorageLinkId, farmerOrdersQuery.data]);

  // Auto-select commodity if only one is available
  useEffect(() => {
    if (availableCommodities.length === 1) {
      const singleCommodity = availableCommodities[0];
      if (
        singleCommodity !== autoSelectedCommodityRef.current &&
        (!selectedCommodity || selectedCommodity === autoSelectedCommodityRef.current)
      ) {
        autoSelectedCommodityRef.current = singleCommodity;
        setSelectedCommodity(singleCommodity);
      }
    } else if (availableCommodities.length === 0) {
      autoSelectedCommodityRef.current = '';
      setSelectedCommodity('');
    } else if (availableCommodities.length > 1) {
      if (selectedCommodity === autoSelectedCommodityRef.current) {
        autoSelectedCommodityRef.current = '';
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableCommodities]);

  // Get incoming orders filtered by selected commodity
  const incomingOrdersByCommodity = useMemo(() => {
    if (!farmerOrdersQuery.data?.data) return [];
    const orders = farmerOrdersQuery.data.data;
    if (selectedCommodity) {
      return orders.filter((order) => order.commodity === selectedCommodity);
    }
    return [];
  }, [farmerOrdersQuery.data, selectedCommodity]);

  // Extract unique varieties from incoming orders
  const availableVarieties = useMemo(() => {
    if (!selectedCommodity || incomingOrdersByCommodity.length === 0) return [];
    const varietySet = new Set<string>();
    incomingOrdersByCommodity.forEach((order) => {
      order.varieties.forEach((variety) => {
        varietySet.add(variety.name);
      });
    });
    return Array.from(varietySet).sort();
  }, [incomingOrdersByCommodity, selectedCommodity]);

  // Handle commodity selection
  const handleCommodityChange = useCallback((commodity: string) => {
    setSelectedCommodity(commodity === '__all__' ? '' : commodity);
    setSelectedVariety(''); // Reset variety when commodity changes
  }, []);

  // Get farmer name from farmerStorageLinkId
  const selectedFarmer = useMemo(() => {
    if (!farmerStorageLinkId || !farmersQuery.data?.data) return null;
    return farmersQuery.data?.data.find((f) => f.id === farmerStorageLinkId) ?? null;
  }, [farmerStorageLinkId, farmersQuery.data?.data]);

  // Get incoming orders filtered by selected commodity and variety
  const incomingOrders = useMemo(() => {
    let orders = incomingOrdersByCommodity;

    // Filter out orders with empty varieties arrays
    orders = orders.filter((order) => order.varieties && order.varieties.length > 0);

    // Filter by selected variety if one is selected
    if (selectedVariety) {
      orders = orders.filter((order) =>
        order.varieties.some((variety) => variety.name === selectedVariety)
      );
    }

    return orders;
  }, [incomingOrdersByCommodity, selectedVariety]);

  // Get bag sizes for selected commodity from preferences
  const bagSizes = useMemo(() => {
    if (!selectedCommodity || !coldStorage?.preferences?.commodities) return [];
    const commodity = coldStorage.preferences.commodities.find((c) => c.name === selectedCommodity);
    return commodity?.sizes ?? [];
  }, [selectedCommodity, coldStorage]);

  // Initialize visible columns when bag sizes change
  useEffect(() => {
    if (bagSizes.length > 0) {
      setVisibleColumns((prev) => {
        const currentSizes = new Set(bagSizes);
        const prevSizes = new Set(prev);
        const sizesMatch =
          currentSizes.size === prevSizes.size &&
          Array.from(currentSizes).every((size) => prevSizes.has(size));
        if (!sizesMatch) {
          return new Set(bagSizes);
        }
        return prev;
      });
    } else {
      setVisibleColumns(new Set());
    }
  }, [bagSizes]);

  // Filter bag sizes to only show visible columns
  const visibleBagSizes = useMemo(() => {
    return bagSizes.filter((size) => visibleColumns.has(size));
  }, [bagSizes, visibleColumns]);

  // Handle column visibility toggle
  const handleColumnToggle = useCallback((size: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(size)) {
        next.delete(size);
      } else {
        next.add(size);
      }
      return next;
    });
  }, []);

  // Get data for a specific order and size combination
  const getOrderSizeData = useCallback((order: DaybookOrder, size: string) => {
    const matchingData: Array<{
      variety: string;
      quantityCurr: number;
      quantityInit: number;
      location: string;
    }> = [];

    order.varieties.forEach((variety) => {
      variety.bagSizes.forEach((bagSize) => {
        if (bagSize.name === size && bagSize.quantityCurr > 0) {
          matchingData.push({
            variety: variety.name,
            quantityCurr: bagSize.quantityCurr,
            quantityInit: bagSize.quantityInit,
            location: `${bagSize.chamber}/${bagSize.floor}/${bagSize.row}`,
          });
        }
      });
    });

    return matchingData;
  }, []);

  // Generate unique key for a card
  const getCardKey = useCallback(
    (orderId: string, size: string, variety: string, location: string) => {
      return `${orderId}-${size}-${variety}-${location}`;
    },
    []
  );

  // Handle order selection
  const handleOrderToggle = useCallback(
    (orderId: string) => {
      setSelectedOrders((prev) => {
        const next = new Set(prev);
        const isCurrentlySelected = next.has(orderId);

        if (isCurrentlySelected) {
          // Unchecking: Remove from selected orders and clear all quantities for this order
          next.delete(orderId);
          setQuantities((prevQuantities) => {
            const nextQuantities = new Map(prevQuantities);
            // Remove all quantities that start with this orderId
            for (const key of nextQuantities.keys()) {
              if (key.startsWith(`${orderId}-`)) {
                nextQuantities.delete(key);
              }
            }
            return nextQuantities;
          });
        } else {
          // Checking: Add to selected orders and set all quantities to max available
          next.add(orderId);
          // Find the order
          const order = incomingOrders.find((o) => o.id === orderId);
          if (order) {
            setQuantities((prevQuantities) => {
              const nextQuantities = new Map(prevQuantities);
              // Iterate through all bag sizes and set quantities
              for (const size of bagSizes) {
                const sizeData = getOrderSizeData(order, size);
                for (const data of sizeData) {
                  const cardKey = getCardKey(orderId, size, data.variety, data.location);
                  // Set quantity to the current available quantity (quantityCurr)
                  nextQuantities.set(cardKey, data.quantityCurr);
                }
              }
              return nextQuantities;
            });
          }
        }
        return next;
      });
    },
    [incomingOrders, bagSizes, getOrderSizeData, getCardKey]
  );

  // Handle card click to open dialog
  const handleCardClick = useCallback(
    (orderId: string, size: string, variety: string, location: string, currentQuantity: number) => {
      const cardKey = getCardKey(orderId, size, variety, location);
      setSelectedCardKey(cardKey);
      setMaxQuantity(currentQuantity);
      const existingQuantity = quantities.get(cardKey);
      setQuantityInput(existingQuantity ? existingQuantity.toString() : '');
      setQuantityError('');
      setDialogOpen(true);
    },
    [getCardKey, quantities]
  );

  // Handle quantity input change with validation
  const handleQuantityInputChange = useCallback(
    (value: string) => {
      setQuantityError('');

      if (value === '' || value === '.') {
        setQuantityInput(value);
        return;
      }

      const quantity = parseFloat(value);

      if (isNaN(quantity)) {
        return;
      }

      if (quantity > maxQuantity) {
        setQuantityInput(value);
        setQuantityError(`Quantity cannot exceed ${maxQuantity.toFixed(1)}`);
        return;
      }

      if (quantity <= 0) {
        setQuantityInput(value);
        setQuantityError('Quantity must be greater than 0');
        return;
      }

      setQuantityInput(value);
    },
    [maxQuantity]
  );

  // Handle quantity submission
  const handleQuantitySubmit = useCallback(() => {
    if (!selectedCardKey) return;

    const quantity = parseFloat(quantityInput);
    if (isNaN(quantity) || quantity <= 0) {
      setQuantityError('Please enter a valid quantity greater than 0');
      toast.error('Please enter a valid quantity greater than 0');
      return;
    }

    if (quantity > maxQuantity) {
      setQuantityError(`Quantity cannot exceed ${maxQuantity.toFixed(1)}`);
      toast.error(`Quantity cannot exceed ${maxQuantity.toFixed(1)}`);
      return;
    }

    setQuantities((prev) => {
      const next = new Map(prev);
      next.set(selectedCardKey, quantity);
      return next;
    });

    setDialogOpen(false);
    setSelectedCardKey(null);
    setQuantityInput('');
    setQuantityError('');
    setMaxQuantity(0);
  }, [selectedCardKey, quantityInput, maxQuantity]);

  // Handle quantity removal
  const handleQuantityRemove = useCallback(() => {
    if (!selectedCardKey) return;

    setQuantities((prev) => {
      const next = new Map(prev);
      next.delete(selectedCardKey);
      return next;
    });

    setDialogOpen(false);
    setSelectedCardKey(null);
    setQuantityInput('');
    setQuantityError('');
    setMaxQuantity(0);
    toast.success('Quantity removed');
  }, [selectedCardKey]);

  // Handle quick remove from badge
  const handleQuickRemove = useCallback((e: React.MouseEvent, cardKey: string) => {
    e.stopPropagation();
    setQuantities((prev) => {
      const next = new Map(prev);
      next.delete(cardKey);
      return next;
    });
    toast.success('Quantity removed');
  }, []);

  // Handle dialog close
  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setSelectedCardKey(null);
    setQuantityInput('');
    setQuantityError('');
    setMaxQuantity(0);
  }, []);

  // Compute selected bags from quantities map
  const selectedBags = useMemo(() => {
    const bags: Array<{
      orderId: string;
      order: DaybookOrder;
      size: string;
      variety: string;
      location: string;
      quantity: number;
      quantityCurr: number;
      quantityInit: number;
    }> = [];

    quantities.forEach((quantity, cardKey) => {
      // Parse cardKey: orderId-size-variety-location
      // Location format is "chamber/floor/row" which may contain slashes
      // We need to find the orderId first, then match the rest
      for (const order of incomingOrders) {
        // Try each bag size
        for (const size of bagSizes) {
          const orderSizeData = getOrderSizeData(order, size);
          for (const data of orderSizeData) {
            const testKey = getCardKey(order.id, size, data.variety, data.location);
            if (testKey === cardKey) {
              bags.push({
                orderId: order.id,
                order,
                size,
                variety: data.variety,
                location: data.location,
                quantity,
                quantityCurr: data.quantityCurr,
                quantityInit: data.quantityInit,
              });
              return; // Found match, move to next cardKey
            }
          }
        }
      }
    });

    return bags;
  }, [quantities, incomingOrders, bagSizes, getOrderSizeData, getCardKey]);

  // Handle farmer selection
  const handleFarmerSelect = useCallback((id: string) => {
    setFarmerStorageLinkId(id);
    setSelectedCommodity('');
    setSelectedVariety('');
    setSelectedOrders(new Set());
    setVisibleColumns(new Set());
    autoSelectedCommodityRef.current = '';
  }, []);

  // Handle date change
  const handleDateChange = useCallback((date: string) => {
    setOrderDate(date);
  }, []);

  // Handle submit
  const handleSubmit = useCallback(() => {
    const gatePassNumber = data?.data?.nextGatePassNumber;
    if (!gatePassNumber) {
      toast.error('Gate pass number not available. Please select a commodity.');
      return;
    }

    if (!farmerStorageLinkId) {
      toast.error('Please select a farmer.');
      return;
    }

    if (!selectedCommodity) {
      toast.error('Please select a commodity.');
      return;
    }

    if (selectedBags.length === 0) {
      toast.error('Please select at least one bag.');
      return;
    }

    const remarks = remarksRef.current?.value || null;

    // Validate all bags have valid locationIds before building payload
    for (const bag of selectedBags) {
      const order = bag.order;
      const variety = order.varieties.find((v) => v.name === bag.variety);

      if (!variety) {
        toast.error(`Could not find variety ${bag.variety} in order. Please try again.`);
        return;
      }

      // Parse location string "chamber/floor/row" to match with bagSize
      const [chamber, floor, row] = bag.location.split('/');
      const bagSize = variety.bagSizes.find(
        (bs) =>
          bs.name === bag.size &&
          bs.chamber === chamber &&
          bs.floor === floor &&
          bs.row === row &&
          bs.quantityCurr === bag.quantityCurr
      );

      if (!bagSize || !bagSize.locationId) {
        toast.error(
          `Could not find locationId for ${bag.size} at ${bag.location}. Please try again.`
        );
        return;
      }
    }

    // Group selected bags by variety
    const varietyMap = new Map<string, typeof selectedBags>();
    selectedBags.forEach((bag) => {
      if (!varietyMap.has(bag.variety)) {
        varietyMap.set(bag.variety, []);
      }
      varietyMap.get(bag.variety)!.push(bag);
    });

    // Build varieties array - grouped by variety name
    // Structure: [{ name: "Variety Name", bagSizes: [...] }]
    const varieties = Array.from(varietyMap.entries()).map(([varietyName, bags]) => {
      // Map each selected bag to the bagSize structure for the API
      const bagSizes = bags.map((bag) => {
        // Find the matching bagSize from the order to get locationId and approxWeight
        const order = bag.order;
        const variety = order.varieties.find((v) => v.name === bag.variety)!;

        // Parse location string "chamber/floor/row" to match with bagSize
        const [chamber, floor, row] = bag.location.split('/');
        const bagSize = variety.bagSizes.find(
          (bs) =>
            bs.name === bag.size &&
            bs.chamber === chamber &&
            bs.floor === floor &&
            bs.row === row &&
            bs.quantityCurr === bag.quantityCurr
        )!;

        // quantityBefore: original available quantity (quantityCurr from the order)
        const quantityBefore = bag.quantityCurr;
        // quantityRemoved: the value entered by the user
        const quantityRemoved = bag.quantity;
        // quantityAfter: remaining quantity after removal
        const quantityAfter = quantityBefore - quantityRemoved;

        // Build bagSize object matching the API structure
        return {
          incomingOrderId: bag.orderId, // The incoming order ID
          varietyName: bag.variety, // Variety name (also in parent variety object)
          name: bag.size, // Bag size name (e.g., "50kg")
          locationId: bagSize.locationId, // Location ID from the order
          quantityBefore, // Original available quantity
          quantityRemoved, // Quantity being removed (user input)
          quantityAfter, // Remaining quantity
          approxWeight: bagSize.approxWeight ?? 0, // Approximate weight (0 if not available)
        };
      });

      return {
        name: varietyName, // Variety name
        bagSizes, // Array of bag sizes for this variety
      };
    });

    const payload: CreateOutgoingOrderInput = {
      farmerStorageLinkId,
      commodity: selectedCommodity,
      gatePassNumber,
      gatePassType: 'DELIVERY',
      remarks: remarks?.trim() || null,
      varieties,
      date: formatDateToISO(orderDate), // Convert dd.mm.yyyy to ISO format (2025-12-19T00:00:00.000Z)
    };

    createOutgoingOrderMutation.mutate(payload, {
      onSuccess: () => {
        setSummarySheetOpen(false);
        setSelectedCommodity('');
        setSelectedVariety('');
        setSelectedOrders(new Set());
        setQuantities(new Map());
        setActiveStep(0);
        setOrderDate(formatDate(new Date()));
        if (remarksRef.current) {
          remarksRef.current.value = '';
        }
        if (paymentMode === 'paid' && farmerStorageLinkId) {
          setPaymentDialogInitialData({
            paymentType: 'RENT',
            farmerStorageLinkId,
            date: formatDate(new Date()),
          });
          setPaymentDialogOpen(true);
        }
        setFarmerStorageLinkId('');
      },
    });
  }, [
    farmerStorageLinkId,
    selectedCommodity,
    selectedBags,
    data?.data?.nextGatePassNumber,
    remarksRef,
    createOutgoingOrderMutation,
    orderDate,
    paymentMode,
  ]);

  return {
    // State
    activeStep,
    setActiveStep,
    selectedCommodity,
    setSelectedCommodity,
    farmerStorageLinkId,
    selectedVariety,
    setSelectedVariety,
    selectedOrders,
    visibleColumns,
    quantities,
    dialogOpen,
    selectedCardKey,
    quantityInput,
    maxQuantity,
    quantityError,
    summarySheetOpen,
    setSummarySheetOpen,
    paymentMode,
    setPaymentMode,
    paymentDialogOpen,
    setPaymentDialogOpen,
    paymentDialogInitialData,
    setPaymentDialogInitialData,
    orderDate,
    remarksRef,
    autoSelectedCommodityRef,

    // Data
    data,
    createOutgoingOrderMutation,
    farmersQuery,
    farmerOrdersQuery,
    availableCommodities,
    incomingOrdersByCommodity,
    availableVarieties,
    selectedFarmer,
    incomingOrders,
    bagSizes,
    visibleBagSizes,
    selectedBags,

    // Handlers
    handleCommodityChange,
    handleFarmerSelect,
    handleDateChange,
    handleSubmit,
    handleColumnToggle,
    getOrderSizeData,
    handleOrderToggle,
    getCardKey,
    handleCardClick,
    handleQuantityInputChange,
    handleQuantitySubmit,
    handleQuantityRemove,
    handleQuickRemove,
    handleDialogClose,
  };
}
