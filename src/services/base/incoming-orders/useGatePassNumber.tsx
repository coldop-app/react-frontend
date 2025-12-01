'use client';

import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { baseApi } from '@/lib/axios';
import { toast } from 'sonner';
import { useEffect } from 'react';

export type Commodity =
  | 'POTATO'
  | 'ONION'
  | 'GARLIC'
  | 'TOMATO'
  | 'CARROT'
  | 'APPLE'
  | 'SWEETS'
  | 'OTHER';

export type GatePassType = 'incoming' | 'outgoing';

export interface GatePassNumberResponse {
  success: boolean;
  data: {
    nextGatePassNumber: number;
    commodity: Commodity;
    coldStorageId: string;
    type: GatePassType;
  };
}

export const useGetGatePassNumber = (
  commodity: Commodity | undefined,
  type: GatePassType | undefined
) => {
  const query = useQuery<
    GatePassNumberResponse,
    AxiosError<{ error?: { message?: string }; message?: string }>
  >({
    queryKey: ['gate-pass-number', commodity, type],
    queryFn: async () => {
      const { data } = await baseApi.get<GatePassNumberResponse>(`/store-admin/gate-pass-number`, {
        params: { commodity, type }, // ⬅️ now includes type
      });
      return data;
    },
    enabled: !!commodity && !!type, // Run only when both are provided
  });

  // 🔥 Error toast handler
  useEffect(() => {
    if (query.isError && query.error) {
      const message =
        query.error.response?.data?.error?.message ||
        query.error.response?.data?.message ||
        query.error.message ||
        'Failed to fetch gate pass number';
      toast.error(message);
    }
  }, [query.isError, query.error]);

  return query;
};
