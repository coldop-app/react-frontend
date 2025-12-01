'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/stores/store';
import storeAdminAxiosClient from '@/lib/axios';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { useNavigate } from '@tanstack/react-router';

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
        '/store-admin/outgoing-orders',
        payload
      );

      return data;
    },

    // -------------------------
    // Success Handler
    // -------------------------
    onSuccess: (data) => {
      if (!data.success) {
        toast.error(data.message || 'Unexpected error');
        return;
      }

      toast.success(data.message || 'Outgoing order created!');

      // TanStack Router navigation
      navigate({
        to: '/store-admin/daybook',
      });

      // Invalidate data
      queryClient.invalidateQueries({ queryKey: ['outgoing-orders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['daybook'] });
    },

    // -------------------------
    // Error Handler
    // -------------------------
    onError: (error) => {
      const message =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        'Failed to create outgoing order';

      toast.error(message);
    },

    // -------------------------
    // Always run (success or error)
    // -------------------------
    onSettled: () => {
      setLoading(false);
    },
  });
};
