import { useQuery, keepPreviousData } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useStore } from '@/stores/store';
import type { GetPaymentHistoryApiResponse } from '@/types/paymentHistory';
import { paymentHistoryKeys } from './payment-history-keys';
import { useEffect, useRef, useMemo } from 'react';

const STALE_TIME = 15_000; // 15 seconds
const CACHE_TIME = 600_000; // 10 minutes
const MAX_RETRY_DELAY = 30_000;

/**
 * Shared query function to avoid duplication
 */
const fetchPaymentHistory = async (signal?: AbortSignal) => {
  const { data } = await storeAdminAxiosClient.get<GetPaymentHistoryApiResponse>(
    '/payment-history',
    {
      signal,
    }
  );
  return data;
};

/**
 * Payment History Query Hook — Balanced Freshness Mode
 */
export const useGetPaymentHistory = () => {
  const { setLoading } = useStore();
  const hasShownError = useRef(false);

  // Memoize query options to prevent unnecessary re-renders
  const queryOptions = useMemo(
    () => ({
      queryKey: paymentHistoryKeys.list(),
      queryFn: ({ signal }: { signal?: AbortSignal }) => fetchPaymentHistory(signal),
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
    []
  );

  const query = useQuery<GetPaymentHistoryApiResponse, AxiosError<{ message?: string }>>(
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
      const msg =
        query.error.response?.data?.message ||
        query.error.message ||
        'Failed to fetch payment history';

      toast.error(msg);
      hasShownError.current = true;
    }
  }, [query.isError, query.error]);

  return query;
};
