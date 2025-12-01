import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { StoreAdminLoginInput, StoreAdminLoginApiResponse } from '@/types/storeAdmin';
import storeAdminAxiosClient from '@/lib/axios';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { useStore } from '@/stores/store';

export const useStoreAdminLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setAdminData, setLoading } = useStore();

  return useMutation<
    StoreAdminLoginApiResponse,
    AxiosError<{ message?: string }>,
    StoreAdminLoginInput
  >({
    mutationKey: ['store-admin', 'login'],

    mutationFn: async (payload) => {
      setLoading(true);

      const { data } = await storeAdminAxiosClient.post('login', payload, {
        withCredentials: true, // send & receive cookies
      });

      return data;
    },

    onSuccess: (data) => {
      setLoading(false);

      if (!data.success || !data.data) {
        toast.error(data.message || 'Login failed: No data received');
        return;
      }

      const { admin, coldStorage } = data.data;

      // store admin + coldStorage (no token)
      setAdminData(admin, coldStorage);

      toast.success(data.message || 'Logged in successfully!');

      queryClient.invalidateQueries({ queryKey: ['store-admin', 'profile'] });

      // ✅ TanStack Router navigation
      navigate({
        to: '/store-admin/daybook',
      });
    },

    onError: (error) => {
      setLoading(false);

      const errMsg = error.response?.data?.message || error.message || 'Login failed';

      toast.error(errMsg);
    },
  });
};
