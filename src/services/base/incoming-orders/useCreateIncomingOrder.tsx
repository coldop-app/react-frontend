'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/stores/store';
import storeAdminAxiosClient from '@/lib/axios';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { useNavigate } from '@tanstack/react-router';
import { getErrorMessage } from '@/lib/getErrorMessage';

import type {
  CreateIncomingOrderInput,
  CreateIncomingOrderApiResponse,
} from '@/types/incomingOrder';

export const useCreateIncomingOrder = () => {
  const queryClient = useQueryClient();
  const { setLoading } = useStore();
  const navigate = useNavigate();

  return useMutation<
    CreateIncomingOrderApiResponse,
    AxiosError<{ error?: { message?: string }; message?: string }>,
    CreateIncomingOrderInput
  >({
    mutationKey: ['incoming-orders', 'create'],

    // -------------------------
    // Mutation Function
    // -------------------------
    mutationFn: async (payload) => {
      setLoading(true);

      const { data } = await storeAdminAxiosClient.post<CreateIncomingOrderApiResponse>(
        '/incoming-orders',
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
        toast.error(data.data?.order ? 'Unexpected error' : data.message);
        return;
      }

      toast.success(data.message || 'Incoming order created!');

      // Navigate using TanStack Router
      navigate({ to: '/store-admin/daybook' });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['incoming-orders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },

    // -------------------------
    // Error Handler
    // -------------------------
    onError: (error) => {
      setLoading(false);
      toast.error(getErrorMessage(error, 'Failed to create incoming order'));
    },
  });
};
