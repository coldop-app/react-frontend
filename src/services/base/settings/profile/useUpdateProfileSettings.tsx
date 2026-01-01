import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/stores/store';
import storeAdminAxiosClient from '@/lib/axios';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import type { ProfileSettingsApiResponse, StoreAdmin } from '@/types/storeAdmin';
import { profileKeys } from './profile-keys';
import type { ProfileUpdateInput } from '@/schemas/profileUpdate';

export interface UpdateProfileSettingsInput {
  storeAdminId: string;
  data: ProfileUpdateInput;
}

export const useUpdateProfileSettings = () => {
  const queryClient = useQueryClient();
  const { setLoading, setAdminData, admin, coldStorage, token } = useStore();

  return useMutation<
    StoreAdmin,
    AxiosError<{ error?: { message?: string }; message?: string }>,
    UpdateProfileSettingsInput,
    {
      previousData: ProfileSettingsApiResponse | undefined;
      previousAdmin: Omit<StoreAdmin, 'password'> | null;
    }
  >({
    mutationKey: ['profile', 'update'],

    // Optimistic update - runs before mutation
    onMutate: async (variables) => {
      const queryKey = profileKeys.detail({ storeAdminId: variables.storeAdminId });

      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value for rollback
      const previousData = queryClient.getQueryData<ProfileSettingsApiResponse>(queryKey);
      const previousAdmin = admin;

      // Optimistically update the cache
      if (previousData?.data) {
        const optimisticData: ProfileSettingsApiResponse = {
          ...previousData,
          data: {
            ...previousData.data,
            ...variables.data,
            // Preserve id and timestamps
            id: previousData.data.id,
            createdAt: previousData.data.createdAt,
            updatedAt: previousData.data.updatedAt,
          },
        };

        queryClient.setQueryData<ProfileSettingsApiResponse>(queryKey, optimisticData);

        // Optimistically update the store
        if (admin && coldStorage && token) {
          // Exclude password from store update (store expects Omit<StoreAdmin, 'password'>)
          const { password: _, ...updateDataWithoutPassword } = variables.data;
          const optimisticAdmin: Omit<StoreAdmin, 'password'> = {
            ...admin,
            ...updateDataWithoutPassword,
            id: admin.id,
          };
          setAdminData(optimisticAdmin, coldStorage, token);
        }
      }

      // Return context with previous data for rollback
      return { previousData, previousAdmin };
    },

    mutationFn: async ({ storeAdminId, data }) => {
      setLoading(true);

      // Remove password if it's empty (user doesn't want to change it)
      const updateData = { ...data };
      if (!updateData.password || updateData.password.trim() === '') {
        delete updateData.password;
      }

      const { data: response } = await storeAdminAxiosClient.put<StoreAdmin>(
        `/store-admin/${storeAdminId}`,
        updateData
      );

      return response;
    },

    onSuccess: (data, variables, _context) => {
      setLoading(false);

      // Update with server response
      const queryKey = profileKeys.detail({ storeAdminId: variables.storeAdminId });
      const updatedApiResponse: ProfileSettingsApiResponse = {
        success: true,
        data,
      };
      queryClient.setQueryData<ProfileSettingsApiResponse>(queryKey, updatedApiResponse);

      // Update store with server response
      // The API response (data) is StoreAdmin which doesn't include password,
      // so it's safe to use as Omit<StoreAdmin, 'password'>
      if (coldStorage && token) {
        const updatedAdmin: Omit<StoreAdmin, 'password'> = {
          id: data.id,
          coldStorageId: data.coldStorageId,
          name: data.name,
          mobileNumber: data.mobileNumber,
          role: data.role,
          isVerified: data.isVerified,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          personalAddress: data.personalAddress,
        };
        setAdminData(updatedAdmin, coldStorage, token);
      }

      toast.success('Profile updated successfully!');

      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },

    onError: (error, variables, context) => {
      setLoading(false);

      // Rollback to previous data on error
      if (context?.previousData) {
        const queryKey = profileKeys.detail({ storeAdminId: variables.storeAdminId });
        queryClient.setQueryData<ProfileSettingsApiResponse>(queryKey, context.previousData);
      }
      // Rollback store state
      if (context?.previousAdmin && coldStorage && token) {
        // previousAdmin is already Omit<StoreAdmin, 'password'> from the store
        setAdminData(context.previousAdmin, coldStorage, token);
      }

      const message =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        'Failed to update profile';

      toast.error(message);
    },

    // Always refetch after error or success to ensure we have the latest data
    onSettled: (_data, _error, variables) => {
      const queryKey = profileKeys.detail({ storeAdminId: variables.storeAdminId });
      queryClient.invalidateQueries({ queryKey });
    },
  });
};
