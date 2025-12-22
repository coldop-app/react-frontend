export interface PreferencesQueryParams {
  preferencesId: string;
}

// Stable query key factory
export const preferencesKeys = {
  all: ['preferences'] as const,
  details: () => [...preferencesKeys.all, 'detail'] as const,
  detail: (params?: PreferencesQueryParams) => [...preferencesKeys.details(), params] as const,
};
