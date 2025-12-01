'use client';

import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useStore } from '@/stores/store';
import type { DaybookApiResponse } from '@/types/daybook';
import { daybookKeys, type DaybookQueryParams } from './daybook-keys';
import { useEffect, useRef, useCallback } from 'react';

/**
 * Daybook Query Hook — Balanced Freshness Mode
 */
export const useDaybook = (params?: DaybookQueryParams) => {
  const { setLoading } = useStore();
  const queryClient = useQueryClient();
  const hasShownError = useRef(false);

  const query = useQuery<DaybookApiResponse, AxiosError<{ message?: string }>>({
    queryKey: daybookKeys.list(params),

    queryFn: async ({ signal }) => {
      const { data } = await storeAdminAxiosClient.get<DaybookApiResponse>('/store-admin/daybook', {
        params,
        signal,
      });
      return data;
    },

    // freshness strategy
    staleTime: 15_000, // 15 seconds
    gcTime: 1000 * 60 * 10, // cache for 10 minutes

    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,

    placeholderData: keepPreviousData,

    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),

    structuralSharing: true,
  });

  /**
   * Auto-prefetch next page
   */
  useEffect(() => {
    if (query.data?.pagination?.hasNextPage && params?.page) {
      const nextPage = { ...params, page: params.page + 1 };

      queryClient.prefetchQuery({
        queryKey: daybookKeys.list(nextPage),
        queryFn: async ({ signal }) => {
          const { data } = await storeAdminAxiosClient.get<DaybookApiResponse>('/daybook', {
            params: nextPage,
            signal,
          });
          return data;
        },
        staleTime: 15_000,
      });
    }
  }, [query.data, params, queryClient]);

  /**
   * Global loading state management
   */
  useEffect(() => {
    const shouldShow = query.isLoading && !query.isFetching;
    setLoading(shouldShow);

    return () => {
      setLoading(false);
    };
  }, [query.isLoading, query.isFetching, setLoading]);

  /**
   * Error toast (once per error)
   */
  useEffect(() => {
    if (query.isError && query.error && !hasShownError.current) {
      const msg =
        query.error.response?.data?.message || query.error.message || 'Failed to fetch daybook';

      toast.error(msg);
      hasShownError.current = true;
    }

    if (!query.isError) {
      hasShownError.current = false;
    }
  }, [query.isError, query.error]);

  return query;
};

/**
 * Prefetch helper — same API as your farmer hook
 */
export const usePrefetchDaybook = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (params?: DaybookQueryParams) => {
      queryClient.prefetchQuery({
        queryKey: daybookKeys.list(params),
        queryFn: async ({ signal }) => {
          const { data } = await storeAdminAxiosClient.get<DaybookApiResponse>(
            '/store-admin/daybook',
            {
              params,
              signal,
            }
          );
          return data;
        },
        staleTime: 15_000,
      });
    },
    [queryClient]
  );
};
