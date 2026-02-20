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
  IndianRupee,
  Calendar,
  FileText,
  Wallet,
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useGetOrdersOfFarmer } from '@/services/base/store-admin/functions/useGetOrdersOfFarmer';
import {
  type StoreAdminFarmer,
  useGetAllFarmers,
} from '@/services/base/store-admin/functions/useGetAllFarmers';
import { useStore } from '@/stores/store';
import { groupOrdersByCommodity, getCommoditiesFromOrders, calculateStockSummary } from './helpers';
import { StockSummaryTable } from './stock-summary-table';
import ReceiptVoucherCard from '@/components/receipt-voucher-card';
import DeliveryVoucherCard from '@/components/delivery-voucher-card';
import { PaymentDialog } from '@/components/daybook/payment-dialog';

export default function FarmerProfilePage() {
  // Get the route param
  const { farmerStorageLinkId } = useParams({
    from: '/_authenticated/store-admin/people/$farmerStorageLinkId',
  });

  // Get farmer data: prefer server data (so after Add Payment we see updated rent), fallback to router state
  const routerState = useRouterState();
  const farmerFromState = routerState.location.state?.farmer as StoreAdminFarmer | undefined;
  const { data: farmersData } = useGetAllFarmers();
  const farmerFromQuery = useMemo(
    () => farmersData?.data?.find((f) => f.id === farmerStorageLinkId),
    [farmersData?.data, farmerStorageLinkId]
  );
  const farmer = farmerFromQuery ?? farmerFromState;

  // Payment dialog for Pay Rent (amount = remaining rent / amount to be paid)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentDialogInitialData, setPaymentDialogInitialData] = useState<{
    paymentType: 'RENT';
    farmerStorageLinkId: string;
    amount: string;
  } | null>(null);

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

  // Store charge entries (rent due) have this in remarks; actual "rent paid" entries are from Add Payment
  const isStoreChargeEntry = (entry: { type: string; remarks?: string | null }) =>
    entry.type === 'RENT' && entry.remarks?.includes('Store charge for incoming order');

  // Rent: total = sum of storeCharge from incoming orders; paid = only Add Payment RENT (exclude store charge entries); remaining = total - paid
  const rentCalculations = useMemo(() => {
    const fromOrders = orders
      .filter((o) => o.type === 'incoming' && (o as { storeCharge?: number }).storeCharge != null)
      .reduce((sum, o) => sum + ((o as { storeCharge?: number }).storeCharge ?? 0), 0);
    const totalRent = fromOrders > 0 ? fromOrders : (farmer?.totalRentFromOrders ?? 0);
    const paymentHistory = farmer?.paymentHistory || [];
    const rentPaid = paymentHistory
      .filter((entry) => entry.type === 'RENT' && !isStoreChargeEntry(entry))
      .reduce((sum, entry) => sum + entry.amount, 0);
    const remainingRent = totalRent - rentPaid;
    return { totalRent, rentPaid, remainingRent };
  }, [orders, farmer?.paymentHistory, farmer?.totalRentFromOrders]);

  // Format date helper
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Sort payment history by date (latest first)
  const sortedPaymentHistory = useMemo(() => {
    const paymentHistory = farmer?.paymentHistory || [];
    return [...paymentHistory].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // Latest first
    });
  }, [farmer?.paymentHistory]);

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

      {/* Financial History: show when there is total rent (from incoming) or any payment history */}
      {(rentCalculations.totalRent > 0 ||
        rentCalculations.rentPaid > 0 ||
        (farmer.paymentHistory && farmer.paymentHistory.length > 0)) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5" />
              Financial History
            </CardTitle>
            <CardDescription>Rent and payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Rent Summary */}
            <div className="mb-6 p-4 rounded-lg border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 dark:from-primary/20 dark:via-primary/10 dark:to-primary/20">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Rent</p>
                  <p className="text-lg font-bold text-foreground">
                    ₹{rentCalculations.totalRent.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Rent Paid</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    ₹{rentCalculations.rentPaid.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                  <p
                    className={`text-lg font-bold ${
                      rentCalculations.remainingRent > 0 ? 'text-destructive' : 'text-foreground'
                    }`}
                  >
                    ₹{rentCalculations.remainingRent.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              {farmer && rentCalculations.remainingRent > 0 && (
                <Button
                  className="mt-3 gap-2"
                  onClick={() => {
                    setPaymentDialogInitialData({
                      paymentType: 'RENT',
                      farmerStorageLinkId: farmer.id,
                      amount: String(rentCalculations.remainingRent),
                    });
                    setIsPaymentDialogOpen(true);
                  }}
                >
                  <Wallet className="h-4 w-4" />
                  Add Payment (amount = rent to be paid)
                </Button>
              )}
            </div>

            {/* Payment History List */}
            <div className="space-y-3">
              <h3 className="font-semibold text-base mb-3">Transaction History</h3>
              {sortedPaymentHistory.map((entry) => {
                const isRentDue = isStoreChargeEntry(entry);
                const isRentPaid = entry.type === 'RENT' && !isRentDue;
                const isPayment = entry.type === 'PAYMENT';
                const isExpense = entry.type === 'EXPENSE';
                // Badge & amount: red = rent due, green = payment / rent paid, blue = expense
                const badgeClass =
                  isRentDue
                    ? 'bg-destructive/10 text-destructive'
                    : isRentPaid || isPayment
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                      : isExpense
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'bg-muted text-muted-foreground';
                const amountClass =
                  isRentDue
                    ? 'text-destructive'
                    : isRentPaid || isPayment
                      ? 'text-green-600 dark:text-green-400'
                      : isExpense
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-muted-foreground';
                const label =
                  isRentDue ? 'Rent due' : isRentPaid ? 'Rent paid' : isPayment ? 'Payment' : isExpense ? 'Expense' : entry.type;
                const sign = isRentDue ? '-' : isRentPaid || isPayment ? '+' : '';
                return (
                  <div
                    key={entry.id}
                    className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}
                          >
                            {label}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(entry.date)}
                          </div>
                        </div>
                        {entry.remarks && (
                          <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                            <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                            <span>{entry.remarks}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${amountClass}`}>
                          {sign}₹{entry.amount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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

      <PaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={(open) => {
          if (!open) setPaymentDialogInitialData(null);
          setIsPaymentDialogOpen(open);
        }}
        initialData={paymentDialogInitialData}
      />
    </div>
  );
}
