'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import storeAdminAxiosClient from '@/lib/axios';
import type { ApiResponse } from '@/types/apiResponse';
import type { DaybookOrder } from '@/types/daybook';
import { toast } from 'sonner';
import { useEffect } from 'react';

export type FarmerOrderType = 'all' | 'incoming' | 'outgoing';

export interface UseGetOrdersOfFarmerParams {
  farmerStorageLinkId: string;
  type: FarmerOrderType;
  enabled?: boolean;
}

export const useGetOrdersOfFarmer = ({
  farmerStorageLinkId,
  type,
  enabled = true,
}: UseGetOrdersOfFarmerParams) => {
  const query = useQuery<
    ApiResponse<DaybookOrder[]>,
    AxiosError<{ error?: { message?: string }; message?: string }>
  >({
    queryKey: ['farmer-orders', farmerStorageLinkId, type],

    queryFn: async () => {
      const { data } = await storeAdminAxiosClient.get<ApiResponse<DaybookOrder[]>>(
        '/farmer/orders',
        {
          params: { farmerStorageLinkId, type },
        }
      );
      return data;
    },

    enabled: enabled && !!farmerStorageLinkId && !!type,
  });

  /**
   * Error toast
   */
  useEffect(() => {
    if (query.isError && query.error) {
      const msg =
        query.error.response?.data?.error?.message ||
        query.error.response?.data?.message ||
        query.error.message ||
        'Failed to fetch farmer orders';

      toast.error(msg);
    }
  }, [query.isError, query.error]);

  return query;
};

/**
 * Prefetch orders of a farmer
 */
export const prefetchFarmerOrders = async (
  queryClient: ReturnType<typeof useQueryClient>,
  farmerStorageLinkId: string,
  type: FarmerOrderType
) => {
  await queryClient.prefetchQuery({
    queryKey: ['farmer-orders', farmerStorageLinkId, type],
    queryFn: async () => {
      const { data } = await storeAdminAxiosClient.get<ApiResponse<DaybookOrder[]>>(
        '/farmer/orders',
        {
          params: { farmerStorageLinkId, type },
        }
      );
      return data;
    },
  });
};
