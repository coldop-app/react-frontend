/**
 * Analytics Overview API Response
 */
export interface AnalyticsOverviewApiResponse {
  success: boolean;
  data: AnalyticsOverviewData;
}

/**
 * Main analytics data structure
 */
export interface AnalyticsOverviewData {
  meta: AnalyticsMeta;
  summary: AnalyticsSummary;
  commoditySummary: CommoditySummary[];
  stockTrend: StockTrend[];
  locationAnalytics: LocationAnalytics[];
}

/**
 * Metadata about the analytics report
 */
export interface AnalyticsMeta {
  coldStorageId: string;
  generatedAt: string; // ISO string
  unit: string; // e.g., "bags"
}

/**
 * Overall summary statistics
 */
export interface AnalyticsSummary {
  totalBagsInitial: number;
  totalBagsCurrent: number;
  totalIncomingBags: number;
  totalOutgoingBags: number;
}

/**
 * Summary grouped by commodity
 */
export interface CommoditySummary {
  commodity: string;
  totalCurrent: number;
  varieties: VarietySummary[];
}

/**
 * Summary for a specific variety
 */
export interface VarietySummary {
  varietyName: string;
  totalCurrent: number;
  bagSizes: BagSizeSummary[];
}

/**
 * Summary for a specific bag size
 */
export interface BagSizeSummary {
  size: string;
  totalInitial: number;
  totalCurrent: number;
  totalOutgoing: number;
}

/**
 * Stock trend over time
 */
export interface StockTrend {
  date: string; // ISO string
  incoming: number;
  outgoing: number;
  netChange: number;
  totalStock: number;
}

/**
 * Analytics for a specific location
 */
export interface LocationAnalytics {
  locationId: string;
  floor: string;
  row: string;
  chamber: string;
  totalCurrentBags: number;
  breakdownByFarmer: FarmerBreakdown[];
}

/**
 * Breakdown of stock by farmer at a location
 */
export interface FarmerBreakdown {
  farmerId: string;
  farmerName: string;
  accountNumber: number;
  totalCurrentBags: number;
  details: StockDetail[];
}

/**
 * Detailed stock information for a specific commodity/variety/size combination
 */
export interface StockDetail {
  commodity: string;
  variety: string;
  size: string;
  storedOn: string; // ISO string
  initialQuantity: number;
  currentQuantity: number;
}
