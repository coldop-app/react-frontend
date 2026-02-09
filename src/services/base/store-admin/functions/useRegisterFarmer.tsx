import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

import storeAdminAxiosClient from '@/lib/axios';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { storeAdminFarmerRegisterSchema } from '@/schemas/storeAdminFarmerRegister';
import type { z } from 'zod';
import type { ApiResponse } from '@/types/apiResponse';

type RegisterFarmerInput = z.infer<typeof storeAdminFarmerRegisterSchema>;

export const useStoreAdminRegisterFarmer = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse, AxiosError<ApiResponse>, RegisterFarmerInput>({
    mutationFn: async (payload) => {
      const validated = storeAdminFarmerRegisterSchema.parse(payload);

      const res = await storeAdminAxiosClient.post<ApiResponse>(
        '/store-admin/farmer/register',
        validated
      );

      return res.data;
    },

    onSuccess: (data) => {
      toast.success(data.message || 'Farmer registered successfully');

      // invalidate farmer list
      queryClient.invalidateQueries({
        queryKey: ['farmers'],
      });
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to register farmer'));
    },
  });
};
