import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { getErrorMessage } from '@/lib/getErrorMessage';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useStore } from '@/stores/store';
import type { VarietyAnalysisApiResponse } from '@/types/analytics';
import { analyticsKeys, type VarietyAnalysisQueryParams } from './analytics-keys';
import { useEffect, useRef, useMemo, useCallback } from 'react';

const STALE_TIME = 15_000; // 15 seconds
const CACHE_TIME = 600_000; // 10 minutes
const MAX_RETRY_DELAY = 30_000;

/**
 * Shared query function to avoid duplication
 * Uses encodeURIComponent to ensure proper encoding (%20 instead of + for spaces)
 */
const fetchVarietyAnalysis = async (
  params: VarietyAnalysisQueryParams | undefined,
  signal?: AbortSignal
) => {
  if (!params?.storageId || !params?.commodity || !params?.variety) {
    throw new Error('storageId, commodity, and variety are required');
  }

  // Manually encode each parameter to ensure %20 for spaces (not +)
  const encodedParams = [
    `storageId=${encodeURIComponent(params.storageId)}`,
    `commodity=${encodeURIComponent(params.commodity)}`,
    `variety=${encodeURIComponent(params.variety)}`,
  ].join('&');

  const { data } = await storeAdminAxiosClient.get<VarietyAnalysisApiResponse>(
    `/store-admin/inventory/variety-analysis?${encodedParams}`,
    {
      signal,
    }
  );
  return data;
};

/**
 * Variety Analysis Query Hook — Balanced Freshness Mode
 */
export const useVarietyAnalysis = (params?: VarietyAnalysisQueryParams) => {
  const { setLoading } = useStore();
  const hasShownError = useRef(false);

  // Memoize query options to prevent unnecessary re-renders
  const queryOptions = useMemo(
    () => ({
      queryKey: analyticsKeys.varietyAnalysis(params),
      queryFn: ({ signal }: { signal?: AbortSignal }) => fetchVarietyAnalysis(params, signal),
      enabled: !!params?.storageId && !!params?.commodity && !!params?.variety, // Only run query if all required params are provided
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

  const query = useQuery<VarietyAnalysisApiResponse, AxiosError<{ message?: string }>>(
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
      toast.error(getErrorMessage(query.error, 'Failed to fetch variety analysis'));
      hasShownError.current = true;
    }
  }, [query.isError, query.error]);

  return query;
};

/**
 * Prefetch helper — memoized for performance
 */
export const usePrefetchVarietyAnalysis = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (params?: VarietyAnalysisQueryParams) => {
      if (!params?.storageId || !params?.commodity || !params?.variety) return;

      queryClient.prefetchQuery({
        queryKey: analyticsKeys.varietyAnalysis(params),
        queryFn: ({ signal }) => fetchVarietyAnalysis(params, signal),
        staleTime: STALE_TIME,
      });
    },
    [queryClient]
  );
};
