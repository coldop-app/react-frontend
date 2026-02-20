export interface PaymentHistoryListFilters {
  farmerStorageLinkId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

// Stable query key factory
export const paymentHistoryKeys = {
  all: ['payment-history'] as const,
  lists: () => [...paymentHistoryKeys.all, 'list'] as const,
  list: (filters?: PaymentHistoryListFilters) =>
    [...paymentHistoryKeys.lists(), filters ?? {}] as const,
  details: () => [...paymentHistoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentHistoryKeys.details(), id] as const,
};
