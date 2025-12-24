import { useMemo, useState } from 'react';
import { useRouterState, useParams } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  User,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Package,
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useGetOrdersOfFarmer } from '@/services/base/store-admin/functions/useGetOrdersOfFarmer';
import type { StoreAdminFarmer } from '@/services/base/store-admin/functions/useGetAllFarmers';
import { useStore } from '@/stores/store';
import { groupOrdersByCommodity, getCommoditiesFromOrders, calculateStockSummary } from './helpers';
import { StockSummaryTable } from './stock-summary-table';
import ReceiptVoucherCard from '@/components/receipt-voucher-card';
import DeliveryVoucherCard from '@/components/delivery-voucher-card';

export default function FarmerProfilePage() {
  // Get the route param
  const { farmerStorageLinkId } = useParams({
    from: '/_authenticated/store-admin/people/$farmerStorageLinkId',
  });

  // Get farmer data from router.state
  const routerState = useRouterState();
  const farmer = routerState.location.state?.farmer as StoreAdminFarmer | undefined;

  // Get coldStorage and receipt columns from store
  const { coldStorage, receiptVisibleColumns, setReceiptColumns } = useStore();

  // State for showing vouchers
  const [showVouchers, setShowVouchers] = useState(false);

  // Fetch orders unconditionally but disable if ID is missing
  const { data: ordersData, isLoading } = useGetOrdersOfFarmer({
    farmerStorageLinkId: farmerStorageLinkId!,
    type: 'all',
    enabled: !!farmerStorageLinkId,
  });

  // Process orders data and sort by date (latest first)
  const orders = useMemo(() => {
    const ordersList = ordersData?.data || [];
    return [...ordersList].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Latest first
    });
  }, [ordersData?.data]);

  // Group orders by commodity
  const ordersByCommodity = useMemo(() => groupOrdersByCommodity(orders), [orders]);

  // Get unique commodities (ordered by preferences)
  const commodities = useMemo(
    () => getCommoditiesFromOrders(orders, coldStorage),
    [orders, coldStorage]
  );

  // Calculate stock summaries for each commodity
  const stockSummaries = useMemo(() => {
    return commodities.map((commodity) =>
      calculateStockSummary(ordersByCommodity[commodity] || [], commodity, coldStorage)
    );
  }, [commodities, ordersByCommodity, coldStorage]);

  // Default to first commodity from preferences (index 0) that exists in orders
  // If no preferences, use first commodity from orders
  const defaultCommodity = useMemo(() => {
    if (coldStorage?.preferences?.commodities && commodities.length > 0) {
      // Find the first commodity from preferences that exists in orders
      const firstPrefCommodity = coldStorage.preferences.commodities.find((prefCommodity) =>
        commodities.includes(prefCommodity.name)
      );
      return firstPrefCommodity?.name || commodities[0] || '';
    }
    return commodities[0] || '';
  }, [coldStorage, commodities]);

  // Calculate total current bags across all commodities
  const totalBags = useMemo(() => {
    return stockSummaries.reduce((sum, summary) => {
      return sum + (summary.totals.current.total || 0);
    }, 0);
  }, [stockSummaries]);

  if (!farmer) {
    return (
      <div className="p-4">
        <p className="text-destructive">Farmer data not found in router state.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{farmer.name}</CardTitle>
                <CardDescription className="mt-1">
                  Account #
                  {typeof farmer.accountNumber === 'number'
                    ? farmer.accountNumber.toLocaleString()
                    : farmer.accountNumber}
                </CardDescription>
              </div>
            </div>

            <div
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
                farmer.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              }`}
            >
              {farmer.isActive ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              {farmer.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Mobile Number</p>
                <p className="text-muted-foreground">{farmer.mobileNumber}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Address</p>
                <p className="text-muted-foreground">{farmer.address}</p>
              </div>
            </div>
            {!isLoading && (
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Total Bags</p>
                  <p className="text-muted-foreground">{totalBags.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stock Summary by Commodity */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center gap-3 py-8">
            <Spinner className="size-5" />
            <p className="text-muted-foreground">Loading orders...</p>
          </CardContent>
        </Card>
      ) : commodities.length > 0 ? (
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue={defaultCommodity} className="w-full">
              <TabsList>
                {commodities.map((commodity) => (
                  <TabsTrigger key={commodity} value={commodity}>
                    {commodity}
                  </TabsTrigger>
                ))}
              </TabsList>
              {stockSummaries.map((summary) => (
                <TabsContent key={summary.commodity} value={summary.commodity} className="mt-6">
                  <StockSummaryTable summary={summary} orders={orders} />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">No orders found for this farmer.</p>
          </CardContent>
        </Card>
      )}

      {/* Show Vouchers Button and Vouchers List */}
      {orders.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Order Vouchers</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVouchers(!showVouchers)}
                className="gap-2"
              >
                {showVouchers ? (
                  <>
                    Hide Vouchers
                    <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Show Vouchers
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            {showVouchers && (
              <div className="mt-4 space-y-4">
                {orders.map((voucher) =>
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
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
