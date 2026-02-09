import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import storeAdminAxiosClient from '@/lib/axios';
import { getErrorMessage } from '@/lib/getErrorMessage';
import type { ApiResponse } from '@/types/apiResponse';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { queryClient } from '@/lib/queryClient';

// ------------------ Types ------------------
export interface PaymentHistoryEntry {
  id: string;
  date: string;
  amount: number;
  type: string;
  remarks: string | null;
  createdBy: string;
  voucherId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreAdminFarmer {
  id: string;
  farmerId: string;
  name: string;
  mobileNumber: string;
  address: string;
  accountNumber: number;
  isActive: boolean;
  paymentHistory?: PaymentHistoryEntry[];
  /** Sum of storeCharge from all incoming orders (total rent owed) */
  totalRentFromOrders?: number;
}

// ------------------ GET ALL FARMERS ------------------
export const useGetAllFarmers = () => {
  const query = useQuery<
    ApiResponse<StoreAdminFarmer[]>,
    AxiosError<{ error?: { message?: string }; message?: string }>
  >({
    queryKey: ['farmers'],
    queryFn: async () => {
      const { data } =
        await storeAdminAxiosClient.get<ApiResponse<StoreAdminFarmer[]>>('/store-admin/farmers');
      return data;
    },
  });

  // 🔥 Unified error handling
  useEffect(() => {
    if (query.isError && query.error) {
      toast.error(getErrorMessage(query.error, 'Failed to fetch farmers'));
    }
  }, [query.isError, query.error]);

  return query;
};

// ------------------ PREFETCH ------------------
export const prefetchAllFarmers = async () => {
  await queryClient.prefetchQuery({
    queryKey: ['farmers'],
    queryFn: async (): Promise<ApiResponse<StoreAdminFarmer[]>> => {
      const { data } = await storeAdminAxiosClient.get('/store-admin/farmers');
      return data;
    },
  });
};

// ------------------ GET FARMER BY ID ------------------
export const useGetFarmerById = (id: string) => {
  const queryClient = useQueryClient();

  const query = useQuery<
    ApiResponse<StoreAdminFarmer>,
    AxiosError<{ error?: { message?: string }; message?: string }>
  >({
    queryKey: ['farmer', id],
    queryFn: async () => {
      const { data } = await storeAdminAxiosClient.get<ApiResponse<StoreAdminFarmer>>(
        `/store-admin/farmers/${id}`
      );
      return data;
    },
    initialData: () => {
      const existingList = queryClient.getQueryData<ApiResponse<StoreAdminFarmer[]>>(['farmers']);

      const match = existingList?.data?.find((f) => f.id === id);

      if (match) {
        return {
          success: true,
          message: 'Loaded from cache',
          data: match,
        } as ApiResponse<StoreAdminFarmer>;
      }

      return undefined;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });

  // 🔥 Error toast
  useEffect(() => {
    if (query.isError && query.error) {
      toast.error(getErrorMessage(query.error, 'Failed to fetch farmer'));
    }
  }, [query.isError, query.error]);

  return query;
};
