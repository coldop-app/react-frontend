import type {
  VarietyAnalysisData,
  VarietyAnalysisFarmer,
  VarietyAnalysisLocation,
  VarietyAnalysisSize,
} from '@/types/analytics';

export type {
  VarietyAnalysisData,
  VarietyAnalysisFarmer,
  VarietyAnalysisLocation,
  VarietyAnalysisSize,
};

/**
 * Aggregated size data across all farmers
 */
export interface AggregatedSizeData {
  size: string;
  totalInitial: number;
  totalCurrent: number;
  totalOutgoing: number;
}

/**
 * Location chart data
 */
export interface LocationChartData {
  location: string; // e.g., "C-32-A"
  totalCurrent: number;
  totalInitial: number;
  totalOutgoing: number;
}

/**
 * Farmer chart data for pie/donut chart
 */
export interface FarmerChartData {
  name: string;
  value: number; // percentage
  totalCurrent: number;
  farmerId: string;
}
