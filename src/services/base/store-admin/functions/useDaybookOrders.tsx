import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { getErrorMessage } from '@/lib/getErrorMessage';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useStore } from '@/stores/store';
import type { DaybookApiResponse } from '@/types/daybook';
import { daybookKeys, type DaybookQueryParams } from './daybook-keys';
import { useEffect, useRef, useCallback, useMemo } from 'react';

const STALE_TIME = 15_000; // 15 seconds
const CACHE_TIME = 600_000; // 10 minutes
const MAX_RETRY_DELAY = 30_000;

/**
 * Shared query function to avoid duplication
 */
const fetchDaybook = async (params: DaybookQueryParams | undefined, signal?: AbortSignal) => {
  const { data } = await storeAdminAxiosClient.get<DaybookApiResponse>('/store-admin/daybook', {
    params,
    signal,
  });
  return data;
};

/**
 * Daybook Query Hook — Balanced Freshness Mode
 */
export const useDaybook = (params?: DaybookQueryParams) => {
  const { setLoading } = useStore();
  const queryClient = useQueryClient();
  const hasShownError = useRef(false);

  // Memoize query options to prevent unnecessary re-renders
  const queryOptions = useMemo(
    () => ({
      queryKey: daybookKeys.list(params),
      queryFn: ({ signal }: { signal?: AbortSignal }) => fetchDaybook(params, signal),
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

  const query = useQuery<DaybookApiResponse, AxiosError<{ message?: string }>>(queryOptions);

  /**
   * Auto-prefetch next page (optimized with useMemo)
   */
  const shouldPrefetch = useMemo(
    () => query.data?.pagination?.hasNextPage && params?.page,
    [query.data?.pagination?.hasNextPage, params?.page]
  );

  useEffect(() => {
    if (shouldPrefetch && params?.page) {
      const nextPage = { ...params, page: params.page + 1 };

      // Use setTimeout to defer prefetching (non-blocking)
      const timerId = setTimeout(() => {
        queryClient.prefetchQuery({
          queryKey: daybookKeys.list(nextPage),
          queryFn: ({ signal }) => fetchDaybook(nextPage, signal),
          staleTime: STALE_TIME,
        });
      }, 100);

      return () => clearTimeout(timerId);
    }
  }, [shouldPrefetch, params, queryClient]);

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
      toast.error(getErrorMessage(query.error, 'Failed to fetch daybook'));
      hasShownError.current = true;
    }
  }, [query.isError, query.error]);

  return query;
};

/**
 * Prefetch helper — memoized for performance
 */
export const usePrefetchDaybook = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (params?: DaybookQueryParams) => {
      queryClient.prefetchQuery({
        queryKey: daybookKeys.list(params),
        queryFn: ({ signal }) => fetchDaybook(params, signal),
        staleTime: STALE_TIME,
      });
    },
    [queryClient]
  );
};
