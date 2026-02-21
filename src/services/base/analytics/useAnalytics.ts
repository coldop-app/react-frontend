import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { getErrorMessage } from '@/lib/getErrorMessage';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useStore } from '@/stores/store';
import type { AnalyticsOverviewApiResponse } from '@/types/analytics';
import { analyticsKeys, type AnalyticsQueryParams } from './analytics-keys';
import { useEffect, useRef, useMemo, useCallback } from 'react';

const STALE_TIME = 15_000; // 15 seconds
const CACHE_TIME = 600_000; // 10 minutes
const MAX_RETRY_DELAY = 30_000;

/**
 * Shared query function to avoid duplication
 */
const fetchAnalyticsOverview = async (
  params: AnalyticsQueryParams | undefined,
  signal?: AbortSignal
) => {
  if (!params?.coldStorageId) {
    throw new Error('coldStorageId is required');
  }

  const { data } = await storeAdminAxiosClient.get<AnalyticsOverviewApiResponse>(
    '/store-admin/analytics/overview',
    {
      params: {
        coldStorageId: params.coldStorageId,
        ...(params.dateFrom && { dateFrom: params.dateFrom }),
        ...(params.dateTo && { dateTo: params.dateTo }),
        ...(params.commodity && { commodity: params.commodity }),
        ...(params.farmerId && { farmerId: params.farmerId }),
        ...(params.locationId && { locationId: params.locationId }),
      },
      signal,
    }
  );
  return data;
};

/**
 * Analytics Overview Query Hook — Balanced Freshness Mode
 */
export const useAnalyticsOverview = (params?: AnalyticsQueryParams) => {
  const { setLoading } = useStore();
  const hasShownError = useRef(false);

  // Memoize query options to prevent unnecessary re-renders
  const queryOptions = useMemo(
    () => ({
      queryKey: analyticsKeys.overview(params),
      queryFn: ({ signal }: { signal?: AbortSignal }) => fetchAnalyticsOverview(params, signal),
      enabled: !!params?.coldStorageId, // Only run query if coldStorageId is provided
      staleTime: STALE_TIME,
      gcTime: CACHE_TIME,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      placeholderData: keepPreviousData,
      retry: 2,
      retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, MAX_RETRY_DELAY),
      structuralSharing: true,
    }),
    [params]
  );

  const query = useQuery<AnalyticsOverviewApiResponse, AxiosError<{ message?: string }>>(
    queryOptions
  );

  /**
   * Global loading state management (optimized condition)
   */
  useEffect(() => {
    const shouldShow = query.isLoading && !query.isFetching;
    setLoading(shouldShow);

    return () => setLoading(false);
  }, [query.isLoading, query.isFetching, setLoading]);

  /**
   * Error toast (once per error) - optimized with early return
   */
  useEffect(() => {
    if (!query.isError) {
      hasShownError.current = false;
      return;
    }

    if (query.error && !hasShownError.current) {
      toast.error(getErrorMessage(query.error, 'Failed to fetch analytics overview'));
      hasShownError.current = true;
    }
  }, [query.isError, query.error]);

  return query;
};

/**
 * Prefetch helper — memoized for performance
 */
export const usePrefetchAnalyticsOverview = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (params?: AnalyticsQueryParams) => {
      if (!params?.coldStorageId) return;

      queryClient.prefetchQuery({
        queryKey: analyticsKeys.overview(params),
        queryFn: ({ signal }) => fetchAnalyticsOverview(params, signal),
        staleTime: STALE_TIME,
      });
    },
    [queryClient]
  );
};
