import type { VarietyAnalysisData, VarietyAnalysisFarmer } from '@/types/analytics';
import type { AggregatedSizeData, LocationChartData, FarmerChartData } from './types';

/**
 * Aggregate size quantities across all farmers
 */
export function aggregateSizesByFarmers(farmers: VarietyAnalysisFarmer[]): AggregatedSizeData[] {
  const sizeMap = new Map<string, AggregatedSizeData>();

  farmers.forEach((farmer) => {
    farmer.sizes.forEach((size) => {
      const existing = sizeMap.get(size.size);
      if (existing) {
        existing.totalInitial += size.totalInitial;
        existing.totalCurrent += size.totalCurrent;
        existing.totalOutgoing += size.totalOutgoing;
      } else {
        sizeMap.set(size.size, {
          size: size.size,
          totalInitial: size.totalInitial,
          totalCurrent: size.totalCurrent,
          totalOutgoing: size.totalOutgoing,
        });
      }
    });
  });

  return Array.from(sizeMap.values()).sort((a, b) => b.totalCurrent - a.totalCurrent);
}

/**
 * Prepare location data for chart
 */
export function prepareLocationChartData(
  locations: VarietyAnalysisData['locations']
): LocationChartData[] {
  return locations
    .map((location) => ({
      location: `${location.location.chamber}-${location.location.floor}-${location.location.row}`,
      totalCurrent: location.totalCurrent,
      totalInitial: location.totalInitial,
      totalOutgoing: location.totalOutgoing,
    }))
    .sort((a, b) => b.totalCurrent - a.totalCurrent);
}

/**
 * Prepare farmer data for pie/donut chart
 */
export function prepareFarmerChartData(
  farmers: VarietyAnalysisFarmer[],
  totalQuantity: number
): FarmerChartData[] {
  return farmers
    .map((farmer) => ({
      name: farmer.farmerName,
      value: totalQuantity > 0 ? (farmer.totalCurrent / totalQuantity) * 100 : 0,
      totalCurrent: farmer.totalCurrent,
      farmerId: farmer.farmerId,
    }))
    .sort((a, b) => b.totalCurrent - a.totalCurrent);
}

/**
 * Calculate total quantity from farmers
 */
export function calculateTotalQuantity(farmers: VarietyAnalysisFarmer[]): number {
  return farmers.reduce((sum, farmer) => sum + farmer.totalCurrent, 0);
}
