import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import storeAdminAxiosClient from '@/lib/axios';
import { getErrorMessage } from '@/lib/getErrorMessage';
import type { ApiResponse } from '@/types/apiResponse';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { queryClient } from '@/lib/queryClient';

export const useGetPreferencesById = (id: string, enabled = true) => {
  const query = useQuery<
    ApiResponse,
    AxiosError<{ error?: { message?: string }; message?: string }>
  >({
    queryKey: ['preferences', id],
    enabled: !!id && enabled, // only run if ID exists
    queryFn: async () => {
      const { data } = await storeAdminAxiosClient.get(`/preferences/${id}`);
      return data;
    },
  });

  // Handle errors using useEffect (onError is not available in useQuery)
  useEffect(() => {
    if (query.isError && query.error) {
      toast.error(getErrorMessage(query.error, 'Failed to fetch preferences'));
    }
  }, [query.isError, query.error]);

  return query;
};

export const prefetchPreferencesById = async (id: string) => {
  if (!id) return;

  await queryClient.prefetchQuery({
    queryKey: ['preferences', id],
    queryFn: async (): Promise<ApiResponse> => {
      const { data } = await storeAdminAxiosClient.get(`/preferences/${id}`);
      return data;
    },
  });
};
