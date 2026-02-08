'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useRouterState } from '@tanstack/react-router';
import storeAdminAxiosClient from '@/lib/axios';

export type GatePassType = 'incoming' | 'outgoing';

export interface GatePassNumberResponse {
  success: boolean;
  data: {
    nextGatePassNumber: number;
    commodity: string;
    coldStorageId: string;
    type: GatePassType;
  };
}

/** commodity: free string (enum-free), e.g. POTATO, FRUIT, OTHER, or any custom name */
export const useGetGatePassNumber = (
  commodity: string | undefined,
  type: GatePassType | undefined
) => {
  const router = useRouterState(); // 🔥 detect client-side route/tab changes

  const query = useQuery<
    GatePassNumberResponse,
    AxiosError<{ error?: { message?: string }; message?: string }>
  >({
    queryKey: ['gate-pass-number', commodity, type],
    queryFn: async () => {
      const { data } = await storeAdminAxiosClient.get<GatePassNumberResponse>(
        `/store-admin/gate-pass-number`,
        {
          params: { commodity, type },
        }
      );
      return data;
    },
    enabled: !!commodity && !!type, // only run when both exist
  });

  // 🔥 Refetch on every route change (tab switch)
  useEffect(() => {
    if (commodity && type) {
      query.refetch();
    }
  }, [router.location.pathname]); // runs on client-side navigation

  // 🔥 Error toast
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
