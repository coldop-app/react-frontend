import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/stores/store';
import storeAdminAxiosClient from '@/lib/axios';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import type { PreferencesApiResponse, PreferencesData } from '@/types/settings/preferences';
import type { ColdStorage, ColdStoragePreferences } from '@/types/coldStorage';
import { preferencesKeys } from './preferences-keys';

export interface UpdatePreferencesInput {
  preferencesId: string;
  data: Partial<Omit<PreferencesData, 'id' | 'createdAt' | 'updatedAt'>>;
}

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  const { setLoading, updatePreferences, coldStorage } = useStore();

  return useMutation<
    PreferencesApiResponse,
    AxiosError<{ error?: { message?: string }; message?: string }>,
    UpdatePreferencesInput,
    { previousData: PreferencesApiResponse | undefined; previousColdStorage: ColdStorage | null }
  >({
    mutationKey: ['preferences', 'update'],

    // Optimistic update - runs before mutation
    onMutate: async (variables) => {
      const queryKey = preferencesKeys.detail({ preferencesId: variables.preferencesId });

      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value for rollback
      const previousData = queryClient.getQueryData<PreferencesApiResponse>(queryKey);
      const previousColdStorage = coldStorage;

      // Optimistically update the cache
      if (previousData?.data) {
        const optimisticData: PreferencesApiResponse = {
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

        queryClient.setQueryData<PreferencesApiResponse>(queryKey, optimisticData);

        // Optimistically update the store
        if (coldStorage?.preferences) {
          const optimisticPreferences: ColdStoragePreferences = {
            ...coldStorage.preferences,
            ...variables.data,
            id: coldStorage.preferences.id,
          };
          updatePreferences(optimisticPreferences);
        }
      }

      // Return context with previous data for rollback
      return { previousData, previousColdStorage };
    },

    mutationFn: async ({ preferencesId, data }) => {
      setLoading(true);

      const { data: response } = await storeAdminAxiosClient.put<PreferencesApiResponse>(
        `/preferences/${preferencesId}`,
        data
      );

      return response;
    },

    onSuccess: (data, variables, context) => {
      setLoading(false);

      if (!data.success) {
        // Rollback on failure
        if (context?.previousData) {
          const queryKey = preferencesKeys.detail({ preferencesId: variables.preferencesId });
          queryClient.setQueryData<PreferencesApiResponse>(queryKey, context.previousData);
        }
        // Rollback store state
        if (context?.previousColdStorage?.preferences) {
          updatePreferences(context.previousColdStorage.preferences);
        }
        toast.error(data.message || 'Failed to update preferences');
        return;
      }

      // Update with server response
      const queryKey = preferencesKeys.detail({ preferencesId: variables.preferencesId });
      queryClient.setQueryData<PreferencesApiResponse>(queryKey, data);

      // Update store with server response
      if (data.data && coldStorage?.preferences) {
        const updatedPreferences: ColdStoragePreferences = {
          id: data.data.id,
          commodities: data.data.commodities,
          generation: data.data.generation,
          rouging: data.data.rouging,
          tuberType: data.data.tuberType,
          grader: data.data.grader,
          incoming: data.data.incoming,
          customFields: data.data.customFields,
        };
        updatePreferences(updatedPreferences);
      }

      toast.success(data.message || 'Preferences updated successfully!');

      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: preferencesKeys.all });
    },

    onError: (error, variables, context) => {
      setLoading(false);

      // Rollback to previous data on error
      if (context?.previousData) {
        const queryKey = preferencesKeys.detail({ preferencesId: variables.preferencesId });
        queryClient.setQueryData<PreferencesApiResponse>(queryKey, context.previousData);
      }
      // Rollback store state
      if (context?.previousColdStorage?.preferences) {
        updatePreferences(context.previousColdStorage.preferences);
      }

      const message =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        'Failed to update preferences';

      toast.error(message);
    },

    // Always refetch after error or success to ensure we have the latest data
    onSettled: (data, error, variables) => {
      const queryKey = preferencesKeys.detail({ preferencesId: variables.preferencesId });
      queryClient.invalidateQueries({ queryKey });
    },
  });
};
