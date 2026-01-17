'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/stores/store';
import storeAdminAxiosClient from '@/lib/axios';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

import type {
  UpdatePaymentHistoryInput,
  UpdatePaymentHistoryApiResponse,
} from '@/types/paymentHistory';
import { paymentHistoryKeys } from './payment-history-keys';

export const useUpdatePaymentHistory = () => {
  const queryClient = useQueryClient();
  const { setLoading } = useStore();

  return useMutation<
    UpdatePaymentHistoryApiResponse,
    AxiosError<{ error?: { message?: string }; message?: string }>,
    UpdatePaymentHistoryInput
  >({
    mutationKey: ['payment-history', 'update'],

    // -------------------------
    // Mutation Function
    // -------------------------
    mutationFn: async (payload) => {
      setLoading(true);

      const { id, ...updateData } = payload;

      const { data } = await storeAdminAxiosClient.put<UpdatePaymentHistoryApiResponse>(
        `/payment-history/${id}`,
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
        toast.error(data.data?.payment ? 'Unexpected error' : data.message);
        return;
      }

      toast.success(data.message || 'Payment updated successfully!');

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: paymentHistoryKeys.all });
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
        'Failed to update payment';

      toast.error(message);
    },
  });
};
