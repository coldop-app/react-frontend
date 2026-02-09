'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/stores/store';
import storeAdminAxiosClient from '@/lib/axios';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

import type {
  CreatePaymentHistoryInput,
  CreatePaymentHistoryApiResponse,
} from '@/types/paymentHistory';

export const useCreatePaymentHistory = () => {
  const queryClient = useQueryClient();
  const { setLoading } = useStore();

  return useMutation<
    CreatePaymentHistoryApiResponse,
    AxiosError<{ error?: { message?: string }; message?: string }>,
    CreatePaymentHistoryInput
  >({
    mutationKey: ['payment-history', 'create'],

    // -------------------------
    // Mutation Function
    // -------------------------
    mutationFn: async (payload) => {
      setLoading(true);

      const { data } = await storeAdminAxiosClient.post<CreatePaymentHistoryApiResponse>(
        '/payment-history',
        payload
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

      toast.success(data.message || 'Payment created successfully!');

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['payment-history'] });
      queryClient.invalidateQueries({ queryKey: ['daybook'] });
    },

    // -------------------------
    // Error Handler
    // -------------------------
    onError: (error) => {
      setLoading(false);
      toast.error(getErrorMessage(error, 'Failed to create payment'));
    },
  });
};
