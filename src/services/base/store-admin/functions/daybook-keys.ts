export interface DaybookQueryParams {
  type?: 'all' | 'incoming' | 'outgoing';
  commodity?: string;
  search?: string;
  sortBy?: 'latest' | 'oldest';
  page?: number;
  limit?: number;
}

// Stable query key factory
export const daybookKeys = {
  all: ['daybook'] as const,
  lists: () => [...daybookKeys.all, 'list'] as const,
  list: (params?: DaybookQueryParams) => [...daybookKeys.lists(), params] as const,
};
