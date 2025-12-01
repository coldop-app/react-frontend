import type { DaybookOrder } from '@/types/daybook';
import type { ColdStorage } from '@/types/coldStorage';

export interface StockSummaryRow {
  variety: string;
  [key: string]: string | number; // Dynamic bag size columns + variety
}

export interface CommodityStockSummary {
  commodity: string;
  varieties: string[];
  bagSizes: string[];
  current: StockSummaryRow[];
  initial: StockSummaryRow[];
  outgoing: StockSummaryRow[];
  totals: {
    current: { [key: string]: number; total: number };
    initial: { [key: string]: number; total: number };
    outgoing: { [key: string]: number; total: number };
  };
}

/**
 * Groups orders by commodity
 */
export function groupOrdersByCommodity(orders: DaybookOrder[]): Record<string, DaybookOrder[]> {
  return orders.reduce(
    (acc, order) => {
      if (!acc[order.commodity]) {
        acc[order.commodity] = [];
      }
      acc[order.commodity].push(order);
      return acc;
    },
    {} as Record<string, DaybookOrder[]>
  );
}

/**
 * Gets bag sizes for a commodity from preferences in the correct order
 * If bag sizes appear in data but not in preferences, they are added at the end
 */
export function getBagSizesForCommodity(
  commodity: string,
  coldStorage: ColdStorage | null,
  orders: DaybookOrder[] = []
): string[] {
  // Get preference-ordered sizes
  const prefSizes: string[] =
    coldStorage?.preferences?.commodities?.find((c) => c.name === commodity)?.sizes ?? [];

  // Extract all unique bag sizes from orders data
  const bagSizeSet = new Set<string>();
  orders.forEach((order) => {
    if (order.commodity === commodity) {
      order.varieties.forEach((variety) => {
        variety.bagSizes.forEach((bagSize) => {
          bagSizeSet.add(bagSize.name);
        });
      });
    }
  });

  // Combine: preference-ordered sizes first, then any additional sizes from data
  const orderedSizes = [...prefSizes];
  const additionalSizes = Array.from(bagSizeSet)
    .filter((size) => !prefSizes.includes(size))
    .sort();

  return [...orderedSizes, ...additionalSizes];
}

/**
 * Calculates stock summary for a commodity from its orders
 * Returns current, initial, and outgoing quantities separately
 */
export function calculateStockSummary(
  orders: DaybookOrder[],
  commodity: string,
  coldStorage: ColdStorage | null
): CommodityStockSummary {
  const bagSizes = getBagSizesForCommodity(commodity, coldStorage, orders);

  // Aggregate by variety and bag size for current, initial, and outgoing
  const currentMap = new Map<string, Map<string, number>>(); // variety -> bagSize -> current qty
  const initialMap = new Map<string, Map<string, number>>(); // variety -> bagSize -> initial qty
  const outgoingMap = new Map<string, Map<string, number>>(); // variety -> bagSize -> outgoing qty

  orders.forEach((order) => {
    order.varieties.forEach((variety) => {
      // Initialize maps if needed
      if (!currentMap.has(variety.name)) {
        currentMap.set(variety.name, new Map<string, number>());
        initialMap.set(variety.name, new Map<string, number>());
        outgoingMap.set(variety.name, new Map<string, number>());
      }

      const currentVarietyMap = currentMap.get(variety.name)!;
      const initialVarietyMap = initialMap.get(variety.name)!;
      const outgoingVarietyMap = outgoingMap.get(variety.name)!;

      variety.bagSizes.forEach((bagSize) => {
        if (order.type === 'incoming') {
          // For incoming: add to current and initial
          const currentQty = currentVarietyMap.get(bagSize.name) || 0;
          const initialQty = initialVarietyMap.get(bagSize.name) || 0;
          currentVarietyMap.set(bagSize.name, currentQty + bagSize.quantityCurr);
          initialVarietyMap.set(bagSize.name, initialQty + bagSize.quantityInit);
        } else {
          // For outgoing: subtract from current, add to outgoing
          const currentQty = currentVarietyMap.get(bagSize.name) || 0;
          const outgoingQty = outgoingVarietyMap.get(bagSize.name) || 0;
          currentVarietyMap.set(bagSize.name, currentQty - bagSize.quantityCurr);
          outgoingVarietyMap.set(bagSize.name, outgoingQty + bagSize.quantityCurr);
        }
      });
    });
  });

  // Helper function to convert map to table rows
  const mapToRows = (
    map: Map<string, Map<string, number>>,
    totals: Record<string, number>
  ): StockSummaryRow[] => {
    const varieties = Array.from(map.keys()).sort();
    const data: StockSummaryRow[] = [];

    // Initialize totals
    bagSizes.forEach((size) => {
      totals[size] = 0;
    });
    totals.total = 0;

    varieties.forEach((variety) => {
      const varietyMap = map.get(variety)!;
      const row: StockSummaryRow = {
        variety,
      };

      let varietyTotal = 0;

      bagSizes.forEach((size) => {
        const qty = varietyMap.get(size) || 0;
        row[size] = qty;
        totals[size] = (totals[size] || 0) + qty;
        varietyTotal += qty;
      });

      row.total = varietyTotal;
      totals.total += varietyTotal;
      data.push(row);
    });

    // Add totals row
    const totalsRow: StockSummaryRow = {
      variety: 'Total',
      ...totals,
    };
    data.push(totalsRow);

    return data;
  };

  // Get all unique varieties first
  const allVarieties = new Set<string>();
  currentMap.forEach((_, variety) => allVarieties.add(variety));
  initialMap.forEach((_, variety) => allVarieties.add(variety));
  outgoingMap.forEach((_, variety) => allVarieties.add(variety));
  const varieties = Array.from(allVarieties).sort();

  // Ensure all varieties exist in all maps (with empty maps if needed)
  varieties.forEach((variety) => {
    if (!currentMap.has(variety)) {
      currentMap.set(variety, new Map<string, number>());
    }
    if (!initialMap.has(variety)) {
      initialMap.set(variety, new Map<string, number>());
    }
    if (!outgoingMap.has(variety)) {
      outgoingMap.set(variety, new Map<string, number>());
    }
  });

  // Calculate totals for each type
  const currentTotals: Record<string, number> = {};
  const initialTotals: Record<string, number> = {};
  const outgoingTotals: Record<string, number> = {};

  const currentData = mapToRows(currentMap, currentTotals);
  const initialData = mapToRows(initialMap, initialTotals);
  const outgoingData = mapToRows(outgoingMap, outgoingTotals);

  return {
    commodity,
    varieties,
    bagSizes,
    current: currentData,
    initial: initialData,
    outgoing: outgoingData,
    totals: {
      current: currentTotals as { [key: string]: number; total: number },
      initial: initialTotals as { [key: string]: number; total: number },
      outgoing: outgoingTotals as { [key: string]: number; total: number },
    },
  };
}

/**
 * Gets all unique commodities from orders, ordered by preferences
 * If preferences exist, uses that order; otherwise sorts alphabetically
 */
export function getCommoditiesFromOrders(
  orders: DaybookOrder[],
  coldStorage: ColdStorage | null
): string[] {
  const commodities = new Set<string>();
  orders.forEach((order) => {
    if (order.commodity) {
      commodities.add(order.commodity);
    }
  });

  // If preferences exist, use that order
  if (coldStorage?.preferences?.commodities) {
    const orderedCommodities: string[] = [];
    // First, add commodities in preference order
    coldStorage.preferences.commodities.forEach((prefCommodity) => {
      if (commodities.has(prefCommodity.name)) {
        orderedCommodities.push(prefCommodity.name);
      }
    });
    // Then, add any remaining commodities not in preferences (sorted)
    const remaining = Array.from(commodities)
      .filter((c) => !orderedCommodities.includes(c))
      .sort();
    return [...orderedCommodities, ...remaining];
  }

  // If no preferences, sort alphabetically
  return Array.from(commodities).sort();
}
