'use client';

import { useState, useMemo } from 'react';
import { useGetPaymentHistory } from '@/services/base/payment-history/useGetPaymentHistory';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PaymentHistoryCard } from './payment-history-card';
import { EditPaymentDialog } from './edit-payment-dialog';
import type { PaymentHistoryResponse } from '@/types/paymentHistory';
import { IndianRupee, Receipt, TrendingUp, AlertCircle } from 'lucide-react';

const PaymentHistoryPage = () => {
  const { data, isLoading, isError, error, refetch } = useGetPaymentHistory();
  const [editingPayment, setEditingPayment] = useState<PaymentHistoryResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'payment' | 'expense'>('all');

  // Calculate summary totals
  const summaryTotals = useMemo(() => {
    if (!data?.data) {
      return {
        totalRent: 0,
        totalPaid: 0,
        totalDue: 0,
        totalExpense: 0,
      };
    }

    const totalRent = data.data
      .filter((p) => p.type === 'RENT')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalPaid = data.data
      .filter((p) => p.type === 'PAYMENT')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalExpense = data.data
      .filter((p) => p.type === 'EXPENSE')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalDue = totalRent - totalPaid;

    return {
      totalRent,
      totalPaid,
      totalDue,
      totalExpense,
    };
  }, [data.data]);

  // Filter payments based on active tab
  const filteredPayments = useMemo(() => {
    if (!data?.data) return [];

    switch (activeTab) {
      case 'payment':
        return data.data.filter((p) => p.type === 'PAYMENT');
      case 'expense':
        return data.data.filter((p) => p.type === 'EXPENSE');
      case 'all':
      default:
        return data.data;
    }
  }, [data, activeTab]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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

  if (isError) {
    return (
      <div className="p-4">
        <div className="mt-4 text-red-500 flex items-center gap-2">
          <p>Error: {error?.response?.data?.message || error?.message}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-2">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Summary Cards */}
      {data?.data && data.data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Rent */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="w-full">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-2">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Receipt className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                    <span className="font-medium uppercase tracking-wide">Total Rent</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold mb-1">
                    {formatCurrency(summaryTotals.totalRent)}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Total rent charged</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Amount Paid */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="w-full">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-2">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                      <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                    <span className="font-medium uppercase tracking-wide">Total Paid</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold mb-1">
                    {formatCurrency(summaryTotals.totalPaid)}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Total payments received
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Amount Due */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="w-full">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-2">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                      <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                    <span className="font-medium uppercase tracking-wide">Total Due</span>
                  </div>
                  <div
                    className={`text-2xl sm:text-3xl font-bold mb-1 ${
                      summaryTotals.totalDue > 0 ? 'text-destructive' : 'text-foreground'
                    }`}
                  >
                    {formatCurrency(summaryTotals.totalDue)}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Outstanding balance
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Expense */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="w-full">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-2">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                      <IndianRupee className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                    <span className="font-medium uppercase tracking-wide">Total Expense</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold mb-1">
                    {formatCurrency(summaryTotals.totalExpense)}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Total expenses incurred
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs and Payment List */}
      {data?.data && data.data.length > 0 ? (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="expense">Expense</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {filteredPayments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No {activeTab === 'all' ? '' : activeTab} payments found.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredPayments.map((payment) => (
                  <PaymentHistoryCard
                    key={payment.id}
                    payment={payment}
                    onEdit={() => setEditingPayment(payment)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        !isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No payment history found.</p>
            </CardContent>
          </Card>
        )
      )}

      {editingPayment && (
        <EditPaymentDialog
          payment={editingPayment}
          open={!!editingPayment}
          onOpenChange={(open) => {
            if (!open) {
              setEditingPayment(null);
            }
          }}
        />
      )}
    </div>
  );
};

export default PaymentHistoryPage;
