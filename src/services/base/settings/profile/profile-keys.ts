export interface ProfileQueryParams {
  storeAdminId: string;
}

// Stable query key factory
export const profileKeys = {
  all: ['profile'] as const,
  details: () => [...profileKeys.all, 'detail'] as const,
  detail: (params?: ProfileQueryParams) => [...profileKeys.details(), params] as const,
};
