'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/stores/store';
import storeAdminAxiosClient from '@/lib/axios';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { useNavigate } from '@tanstack/react-router';
import { getErrorMessage } from '@/lib/getErrorMessage';

import type {
  CreateOutgoingOrderInput,
  CreateOutgoingOrderApiResponse,
} from '@/types/outgoingOrder';

export const useCreateOutgoingOrder = () => {
  const queryClient = useQueryClient();
  const { setLoading } = useStore();
  const navigate = useNavigate();

  return useMutation<
    CreateOutgoingOrderApiResponse,
    AxiosError<{ error?: { message?: string }; message?: string }>,
    CreateOutgoingOrderInput
  >({
    mutationKey: ['outgoing-orders', 'create'],

    // -------------------------
    // Mutation Function
    // -------------------------
    mutationFn: async (payload) => {
      setLoading(true);

      const { data } = await storeAdminAxiosClient.post<CreateOutgoingOrderApiResponse>(
        '/outgoing-orders',
        payload
      );

      return data;
    },

    // -------------------------
    // Success Handler
    // -------------------------
    onSuccess: (data, variables) => {
      if (!data.success) {
        toast.error(data.message || 'Unexpected error');
        return;
      }

      toast.success(data.message || 'Outgoing order created!');

      // When paid, caller opens Add Payment dialog — stay on page; otherwise go to daybook
      if (!variables.isPaid) {
        navigate({
          to: '/store-admin/daybook',
        });
      }

      // Invalidate data
      queryClient.invalidateQueries({ queryKey: ['outgoing-orders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['daybook'] });
    },

    // -------------------------
    // Error Handler
    // -------------------------
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to create outgoing order'));
    },

    // -------------------------
    // Always run (success or error)
    // -------------------------
    onSettled: () => {
      setLoading(false);
    },
  });
};
