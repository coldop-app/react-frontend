import { useQuery, keepPreviousData } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import { getErrorMessage } from '@/lib/getErrorMessage';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useStore } from '@/stores/store';
import type { GetPaymentHistoryApiResponse } from '@/types/paymentHistory';
import {
  paymentHistoryKeys,
  type PaymentHistoryListFilters,
} from './payment-history-keys';
import { useEffect, useRef, useMemo } from 'react';

const STALE_TIME = 15_000; // 15 seconds
const CACHE_TIME = 600_000; // 10 minutes
const MAX_RETRY_DELAY = 30_000;
const DEFAULT_LIMIT = 100;

/**
 * Convert YYYY-MM-DD to ISO date-time for API (format "date-time").
 * dateFrom -> start of day UTC; dateTo -> end of day UTC.
 */
function toDateTimeISO(dateOnly: string, endOfDay = false): string {
  if (endOfDay) return `${dateOnly}T23:59:59.999Z`;
  return `${dateOnly}T00:00:00.000Z`;
}

/**
 * Build query params for GET /payment-history (date-wise, farmer-wise filters).
 * Sends dateFrom/dateTo as ISO date-time strings for backend validation.
 */
function buildPaymentHistoryParams(filters?: PaymentHistoryListFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: filters?.page ?? 1,
    limit: filters?.limit ?? DEFAULT_LIMIT,
  };
  if (filters?.farmerStorageLinkId) params.farmerStorageLinkId = filters.farmerStorageLinkId;
  if (filters?.dateFrom) params.dateFrom = toDateTimeISO(filters.dateFrom, false);
  if (filters?.dateTo) params.dateTo = toDateTimeISO(filters.dateTo, true);
  return params;
}

/**
 * Payment History Query Hook — with optional date-wise and farmer-wise filters
 */
export const useGetPaymentHistory = (filters?: PaymentHistoryListFilters) => {
  const { setLoading } = useStore();
  const hasShownError = useRef(false);

  const queryParams = useMemo(() => buildPaymentHistoryParams(filters), [filters]);

  const queryOptions = useMemo(
    () => ({
      queryKey: paymentHistoryKeys.list(filters),
      queryFn: ({ signal }: { signal?: AbortSignal }) =>
        storeAdminAxiosClient
          .get<GetPaymentHistoryApiResponse>('/payment-history', {
            params: queryParams,
            signal,
          })
          .then((res) => res.data),
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
    [queryParams, filters]
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
      toast.error(getErrorMessage(query.error, 'Failed to fetch payment history'));
      hasShownError.current = true;
    }
  }, [query.isError, query.error]);

  return query;
};
