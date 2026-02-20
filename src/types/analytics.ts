/**
 * Analytics Overview API Response
 */
export interface AnalyticsOverviewApiResponse {
  success: boolean;
  data: AnalyticsOverviewData;
}

/** Incoming/outgoing breakdown by variety and bag size */
export interface FarmerSummaryBreakdownItem {
  commodity: string;
  variety: string;
  bagSize: string;
  quantity: number;
}

/**
 * Farmer summary row for analytics (orders + rent)
 */
export interface FarmerSummaryRow {
  farmerStorageLinkId: string;
  farmerName: string;
  totalIncomingOrders: number;
  totalOutgoingOrders: number;
  rentPaid: number;
  rentDue: number;
  incomingBreakdown?: FarmerSummaryBreakdownItem[];
  outgoingBreakdown?: FarmerSummaryBreakdownItem[];
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
  farmerSummary?: FarmerSummaryRow[];
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

/**
 * Variety Analysis API Response
 */
export interface VarietyAnalysisApiResponse {
  success: boolean;
  data: VarietyAnalysisData;
}

/**
 * Variety Analysis Data Structure
 */
export interface VarietyAnalysisData {
  commodity: string;
  variety: string;
  farmers: VarietyAnalysisFarmer[];
  locations: VarietyAnalysisLocation[];
}

/**
 * Farmer breakdown in variety analysis
 */
export interface VarietyAnalysisFarmer {
  farmerId: string;
  farmerName: string;
  sizes: VarietyAnalysisSize[];
  totalInitial: number;
  totalCurrent: number;
  totalOutgoing: number;
}

/**
 * Location breakdown in variety analysis
 */
export interface VarietyAnalysisLocation {
  location: {
    chamber: string;
    floor: string;
    row: string;
  };
  totalInitial: number;
  totalCurrent: number;
  totalOutgoing: number;
  sizes: VarietyAnalysisSize[];
}

/**
 * Size breakdown in variety analysis
 */
export interface VarietyAnalysisSize {
  size: string;
  totalInitial: number;
  totalCurrent: number;
  totalOutgoing: number;
}
