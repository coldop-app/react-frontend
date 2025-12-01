'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/store';
import { baseApi } from '@/lib/axios';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';

import type { EditIncomingOrderInput, EditIncomingOrderApiResponse } from '@/types/incomingOrder';

export const useEditIncomingOrder = () => {
  const queryClient = useQueryClient();
  const { setLoading } = useStore();
  const router = useRouter();

  return useMutation<
    EditIncomingOrderApiResponse,
    AxiosError<{ error?: { message?: string }; message?: string }>,
    EditIncomingOrderInput
  >({
    mutationKey: ['incoming-orders', 'edit'],

    // -------------------------
    // Mutation Function
    // -------------------------
    mutationFn: async (payload) => {
      setLoading(true);

      const { id, ...updateData } = payload;

      const { data } = await baseApi.put<EditIncomingOrderApiResponse>(
        `/incoming-orders/${id}`,
        updateData
      );

      return data;
    },

    // -------------------------
    // Success Handler
    // -------------------------
    onSuccess: (data) => {
      setLoading(false);

      if (!data.success) {
        toast.error(data.data?.order ? 'Unexpected error' : data.message);
        return;
      }

      toast.success(data.message || 'Incoming order updated!');

      router.push('/store-admin/daybook');

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['incoming-orders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['daybook'] });
    },

    // -------------------------
    // Error Handler
    // -------------------------
    onError: (error) => {
      setLoading(false);

      const message =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        'Failed to update incoming order';

      toast.error(message);
    },
  });
};
