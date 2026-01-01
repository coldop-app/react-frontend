import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import storeAdminAxiosClient from '@/lib/axios';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useStore } from '@/stores/store';
import type { ProfileSettingsApiResponse } from '@/types/storeAdmin';
import { profileKeys, type ProfileQueryParams } from './profile-keys';
import { useEffect, useRef, useMemo, useCallback } from 'react';

const STALE_TIME = 15_000; // 15 seconds
const CACHE_TIME = 600_000; // 10 minutes
const MAX_RETRY_DELAY = 30_000;

/**
 * Shared query function to avoid duplication
 */
const fetchProfileSettings = async (
  params: ProfileQueryParams | undefined,
  signal?: AbortSignal
) => {
  if (!params?.storeAdminId) {
    throw new Error('storeAdminId is required');
  }

  const { data } = await storeAdminAxiosClient.get<ProfileSettingsApiResponse>(
    `/store-admin/${params.storeAdminId}`,
    {
      signal,
    }
  );
  return data;
};

/**
 * Profile Settings Query Hook — Balanced Freshness Mode
 */
export const useProfileSettings = (params?: ProfileQueryParams) => {
  const { setLoading } = useStore();
  const hasShownError = useRef(false);

  // Memoize query options to prevent unnecessary re-renders
  const queryOptions = useMemo(
    () => ({
      queryKey: profileKeys.detail(params),
      queryFn: ({ signal }: { signal?: AbortSignal }) => fetchProfileSettings(params, signal),
      enabled: !!params?.storeAdminId, // Only run query if storeAdminId is provided
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

  const query = useQuery<ProfileSettingsApiResponse, AxiosError<{ message?: string }>>(
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
        'Failed to fetch profile settings';

      toast.error(msg);
      hasShownError.current = true;
    }
  }, [query.isError, query.error]);

  return query;
};

/**
 * Prefetch helper — memoized for performance
 */
export const usePrefetchProfileSettings = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (params?: ProfileQueryParams) => {
      if (!params?.storeAdminId) return;

      queryClient.prefetchQuery({
        queryKey: profileKeys.detail(params),
        queryFn: ({ signal }) => fetchProfileSettings(params, signal),
        staleTime: STALE_TIME,
      });
    },
    [queryClient]
  );
};
