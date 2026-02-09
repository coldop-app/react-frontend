import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import storeAdminAxiosClient from '@/lib/axios';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { useStore } from '@/stores/store';

type LogoutResponse = {
  success: boolean;
  message: string;
};

export const useStoreAdminLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { clearAdminData, setLoading } = useStore();

  return useMutation<LogoutResponse, AxiosError<{ message?: string }>, void>({
    mutationKey: ['store-admin', 'logout'],

    mutationFn: async () => {
      setLoading(true);

      const { data } = await storeAdminAxiosClient.post<LogoutResponse>('/store-admin/logout', {});

      return data;
    },

    onSuccess: (data) => {
      setLoading(false);

      // Clear Zustand store
      clearAdminData();

      // Clear all admin-related queries
      queryClient.removeQueries({ queryKey: ['store-admin'] });

      toast.success(data.message || 'Logged out successfully');

      // Redirect to login page
      navigate({
        to: '/auth/login',
        replace: true,
      });
    },

    onError: (error) => {
      setLoading(false);

      // Even on error, clear local session + cache
      clearAdminData();
      queryClient.removeQueries({ queryKey: ['store-admin'] });

      toast.error(getErrorMessage(error, 'Logout failed'));

      navigate({
        to: '/auth/login',
        replace: true,
      });
    },
  });
};
