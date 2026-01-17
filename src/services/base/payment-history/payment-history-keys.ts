// Stable query key factory
export const paymentHistoryKeys = {
  all: ['payment-history'] as const,
  lists: () => [...paymentHistoryKeys.all, 'list'] as const,
  list: () => [...paymentHistoryKeys.lists()] as const,
  details: () => [...paymentHistoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentHistoryKeys.details(), id] as const,
};
