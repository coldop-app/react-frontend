'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import storeAdminAxiosClient from '@/lib/axios';
import type { ApiResponse } from '@/types/apiResponse';
import type { DaybookOrder } from '@/types/daybook';
import { toast } from 'sonner';
import { useEffect, useMemo, useRef } from 'react';

export type FarmerOrderType = 'all' | 'incoming' | 'outgoing';

export interface UseGetOrdersOfFarmerParams {
  farmerStorageLinkId: string;
  type: FarmerOrderType;
  enabled?: boolean;
}

/** Query tuning constants (same philosophy as analytics) */
const STALE_TIME = 15_000; // 15 seconds
const CACHE_TIME = 600_000; // 10 minutes
const MAX_RETRY_DELAY = 30_000;

/**
 * Shared fetcher
 */
const fetchFarmerOrders = async (
  farmerStorageLinkId: string,
  type: FarmerOrderType,
  signal?: AbortSignal
) => {
  const { data } = await storeAdminAxiosClient.get<ApiResponse<DaybookOrder[]>>(
    '/store-admin/farmer/orders',
    {
      params: { farmerStorageLinkId, type },
      signal,
    }
  );

  return data;
};

export const useGetOrdersOfFarmer = ({
  farmerStorageLinkId,
  type,
  enabled = true,
}: UseGetOrdersOfFarmerParams) => {
  const hasShownError = useRef(false);

  /**
   * Memoized query options (prevents unnecessary re-renders)
   */
  const queryOptions = useMemo(
    () => ({
      queryKey: ['farmer-orders', farmerStorageLinkId, type],
      queryFn: ({ signal }: { signal?: AbortSignal }) =>
        fetchFarmerOrders(farmerStorageLinkId, type, signal),

      enabled: enabled && !!farmerStorageLinkId && !!type,

      staleTime: STALE_TIME,
      gcTime: CACHE_TIME,

      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,

      placeholderData: keepPreviousData,
      structuralSharing: true,

      retry: 2,
      retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, MAX_RETRY_DELAY),
    }),
    [farmerStorageLinkId, type, enabled]
  );

  const query = useQuery<
    ApiResponse<DaybookOrder[]>,
    AxiosError<{ error?: { message?: string }; message?: string }>
  >(queryOptions);

  /**
   * Error toast — show once per error
   */
  useEffect(() => {
    if (!query.isError) {
      hasShownError.current = false;
      return;
    }

    if (query.error && !hasShownError.current) {
      const msg =
        query.error.response?.data?.error?.message ||
        query.error.response?.data?.message ||
        query.error.message ||
        'Failed to fetch farmer orders';

      toast.error(msg);
      hasShownError.current = true;
    }
  }, [query.isError, query.error]);

  return query;
};
