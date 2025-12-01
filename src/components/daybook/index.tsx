import { useState, useMemo, useCallback, useEffect, useRef, useTransition } from 'react';
import { useDebounceValue } from 'usehooks-ts';

import { useDaybook } from '@/services/base/store-admin/functions/useDaybookOrders';
import { useStore } from '@/stores/store';

import Toolbar from './toolbar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

import ReceiptVoucherCard from '@/components/receipt-voucher-card';
import DeliveryVoucherCard from '@/components/delivery-voucher-card';

export default function DaybookPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebounceValue(searchQuery, 500);

  const [orderFilter, setOrderFilter] = useState('All Orders');
  const [sortFilter, setSortFilter] = useState('Latest First');
  const [commodityFilter, setCommodityFilter] = useState('All Commodities');
  const [currentPage, setCurrentPage] = useState(1);

  const [isPending, startTransition] = useTransition();

  const { coldStorage, receiptVisibleColumns, setReceiptColumns } = useStore();
  const preferencesId = coldStorage?.preferences.id || '';

  // ----- FILTER MAPS -----
  const typeFilter = useMemo(() => {
    const map = {
      Incoming: 'incoming',
      Outgoing: 'outgoing',
    } as const;

    return (map[orderFilter as keyof typeof map] || 'all') as 'all' | 'incoming' | 'outgoing';
  }, [orderFilter]);

  const sortByFilter = useMemo(() => {
    return sortFilter === 'Oldest First' ? 'oldest' : 'latest';
  }, [sortFilter]) as 'latest' | 'oldest';

  // ----- HANDLERS -----
  const handleOrderFilterChange = useCallback((filter: string) => {
    startTransition(() => {
      setOrderFilter(filter);
      setCurrentPage(1);
    });
  }, []);

  const handleSortFilterChange = useCallback((filter: string) => {
    startTransition(() => {
      setSortFilter(filter);
      setCurrentPage(1);
    });
  }, []);

  const handleCommodityFilterChange = useCallback((filter: string) => {
    startTransition(() => {
      setCommodityFilter(filter);
      setCurrentPage(1);
    });
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // ----- RESET PAGE ON SEARCH -----
  const prevDebouncedSearch = useRef(debouncedSearch);

  useEffect(() => {
    if (prevDebouncedSearch.current !== debouncedSearch) {
      prevDebouncedSearch.current = debouncedSearch;
      startTransition(() => {
        setCurrentPage(1);
      });
    }
  }, [debouncedSearch]);

  // ----- DAYBOOK API -----
  const commodityParam = useMemo(() => {
    return commodityFilter === 'All Commodities' ? undefined : commodityFilter;
  }, [commodityFilter]);

  const { data, isLoading, isFetching, isError, error, refetch } = useDaybook({
    type: typeFilter,
    commodity: commodityParam,
    sortBy: sortByFilter,
    search: debouncedSearch.trim() || undefined,
    page: currentPage,
    limit: 4,
  });

  const pagination = data?.pagination;

  // ----- INITIAL LOADING -----
  if (isLoading) {
    return (
      <div className="p-4 space-y-6">
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl border space-y-2">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalOrders = data?.pagination?.totalItems ?? null;

  return (
    <div className="p-4">
      <Toolbar
        total={totalOrders}
        searchQuery={searchQuery}
        orderFilter={orderFilter}
        sortFilter={sortFilter}
        commodityFilter={commodityFilter}
        preferences={coldStorage?.preferences}
        preferencesId={preferencesId}
        onSearchChange={handleSearchChange}
        onOrderFilterChange={handleOrderFilterChange}
        onSortFilterChange={handleSortFilterChange}
        onCommodityFilterChange={handleCommodityFilterChange}
      />

      {(isFetching || isPending) && !isLoading && (
        <div className="mt-2 flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          <p className="text-xs text-muted-foreground">Updating...</p>
        </div>
      )}

      {isError && (
        <div className="mt-4 text-red-500 flex items-center gap-2">
          <p>Error: {error?.response?.data?.message || error?.message}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-2">
            Retry
          </Button>
        </div>
      )}

      {data && (
        <>
          <div
            className={`mt-4 space-y-4 transition-opacity duration-200 ${
              isPending ? 'opacity-50' : 'opacity-100'
            }`}
          >
            {data.data.map((voucher) =>
              voucher.type === 'incoming' ? (
                <ReceiptVoucherCard
                  key={voucher.id}
                  data={voucher}
                  coldStorage={coldStorage}
                  receiptVisibleColumns={receiptVisibleColumns}
                  setReceiptColumns={setReceiptColumns}
                />
              ) : (
                <DeliveryVoucherCard key={voucher.id} data={voucher} />
              )
            )}
          </div>

          {/* PAGINATION */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination>
                <PaginationContent>
                  {/* PREVIOUS */}
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pagination.hasPreviousPage && pagination.previousPage) {
                          startTransition(() => setCurrentPage(pagination.previousPage!));
                        }
                      }}
                      className={
                        !pagination.hasPreviousPage
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>

                  {/* FIRST PAGE */}
                  {pagination.currentPage > 2 && (
                    <>
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            startTransition(() => setCurrentPage(1));
                          }}
                          className="cursor-pointer"
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>

                      {pagination.currentPage > 3 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                    </>
                  )}

                  {/* PREV PAGE */}
                  {pagination.hasPreviousPage && pagination.previousPage && (
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          startTransition(() => setCurrentPage(pagination.previousPage!));
                        }}
                        className="cursor-pointer"
                      >
                        {pagination.previousPage}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  {/* CURRENT */}
                  <PaginationItem>
                    <PaginationLink href="#" isActive>
                      {pagination.currentPage}
                    </PaginationLink>
                  </PaginationItem>

                  {/* NEXT PAGE */}
                  {pagination.hasNextPage && pagination.nextPage && (
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          startTransition(() => setCurrentPage(pagination.nextPage!));
                        }}
                        className="cursor-pointer"
                      >
                        {pagination.nextPage}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  {/* LAST PAGE */}
                  {pagination.currentPage < pagination.totalPages - 1 && (
                    <>
                      {pagination.currentPage < pagination.totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            startTransition(() => setCurrentPage(pagination.totalPages));
                          }}
                          className="cursor-pointer"
                        >
                          {pagination.totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  {/* NEXT */}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pagination.hasNextPage && pagination.nextPage) {
                          startTransition(() => setCurrentPage(pagination.nextPage!));
                        }
                      }}
                      className={
                        !pagination.hasNextPage
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
