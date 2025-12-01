import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { baseApi } from '@/lib/axios';
import { ApiResponse } from '@/types/apiResponse';
import { toast } from 'sonner';
import { useEffect } from 'react';
import getQueryClient from '@/lib/get-query-client';

const queryClient = getQueryClient();

export const useGetPreferencesById = (id: string, enabled = true) => {
  const query = useQuery<
    ApiResponse,
    AxiosError<{ error?: { message?: string }; message?: string }>
  >({
    queryKey: ['preferences', id],
    enabled: !!id && enabled, // only run if ID exists
    queryFn: async () => {
      const { data } = await baseApi.get(`/preferences/${id}`);
      return data;
    },
  });

  // Handle errors using useEffect (onError is not available in useQuery)
  useEffect(() => {
    if (query.isError && query.error) {
      const message =
        query.error.response?.data?.error?.message ||
        query.error.response?.data?.message ||
        query.error.message ||
        'Failed to fetch preferences';
      toast.error(message);
    }
  }, [query.isError, query.error]);

  return query;
};

export const prefetchPreferencesById = async (id: string) => {
  if (!id) return;

  await queryClient.prefetchQuery({
    queryKey: ['preferences', id],
    queryFn: async (): Promise<ApiResponse> => {
      const { data } = await baseApi.get(`/preferences/${id}`);
      return data;
    },
  });
};
