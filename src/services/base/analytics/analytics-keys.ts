export interface AnalyticsQueryParams {
  coldStorageId: string;
  dateFrom?: string;
  dateTo?: string;
  commodity?: string;
  farmerId?: string;
  locationId?: string;
}

export interface VarietyAnalysisQueryParams {
  storageId: string;
  commodity: string;
  variety: string;
}

// Stable query key factory
export const analyticsKeys = {
  all: ['analytics'] as const,
  overviews: () => [...analyticsKeys.all, 'overview'] as const,
  overview: (params?: AnalyticsQueryParams) => [...analyticsKeys.overviews(), params] as const,
  varietyAnalyses: () => [...analyticsKeys.all, 'variety-analysis'] as const,
  varietyAnalysis: (params?: VarietyAnalysisQueryParams) =>
    [...analyticsKeys.varietyAnalyses(), params] as const,
};
