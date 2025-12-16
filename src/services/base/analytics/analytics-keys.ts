export interface AnalyticsQueryParams {
  coldStorageId: string;
}

// Stable query key factory
export const analyticsKeys = {
  all: ['analytics'] as const,
  overviews: () => [...analyticsKeys.all, 'overview'] as const,
  overview: (params?: AnalyticsQueryParams) => [...analyticsKeys.overviews(), params] as const,
};
