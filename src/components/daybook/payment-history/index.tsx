'use client';

import { useState, useMemo, useCallback } from 'react';
import { useGetPaymentHistory } from '@/services/base/payment-history/useGetPaymentHistory';
import { useGetAllFarmers } from '@/services/base/store-admin/functions/useGetAllFarmers';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PaymentHistoryCard } from './payment-history-card';
import { EditPaymentDialog } from './edit-payment-dialog';
import type { PaymentHistoryResponse } from '@/types/paymentHistory';
import { wrapPrintDocument, escapeHtml } from '@/lib/print-layout';
import { IndianRupee, Receipt, TrendingUp, AlertCircle, Filter, X, FileDown } from 'lucide-react';

const PaymentHistoryPage = () => {
  // Form inputs (what user sees/edits)
  const [dateFromInput, setDateFromInput] = useState('');
  const [dateToInput, setDateToInput] = useState('');
  const [farmerInput, setFarmerInput] = useState<string>('');
  // Applied filters (sent to API when user clicks Apply)
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [farmerStorageLinkId, setFarmerStorageLinkId] = useState<string>('');

  const listFilters = useMemo(
    () => ({
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
      ...(farmerStorageLinkId && { farmerStorageLinkId }),
    }),
    [dateFrom, dateTo, farmerStorageLinkId]
  );

  const { data, isLoading, isError, error, refetch } = useGetPaymentHistory(
    Object.keys(listFilters).length > 0 ? listFilters : undefined
  );
  const { data: farmersData } = useGetAllFarmers();
  const farmers = useMemo(() => farmersData?.data ?? [], [farmersData?.data]);

  const [editingPayment, setEditingPayment] = useState<PaymentHistoryResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'rent' | 'payment' | 'expense'>('all');

  const applyFilters = () => {
    setDateFrom(dateFromInput);
    setDateTo(dateToInput);
    setFarmerStorageLinkId(farmerInput);
  };

  const clearFilters = () => {
    setDateFromInput('');
    setDateToInput('');
    setFarmerInput('');
    setDateFrom('');
    setDateTo('');
    setFarmerStorageLinkId('');
  };

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
  }, [data]);

  // Filter payments based on active tab (Rent, Payment, Expense are segregated)
  const filteredPayments = useMemo(() => {
    if (!data?.data) return [];

    switch (activeTab) {
      case 'rent':
        return data.data.filter((p) => p.type === 'RENT');
      case 'payment':
        return data.data.filter((p) => p.type === 'PAYMENT');
      case 'expense':
        return data.data.filter((p) => p.type === 'EXPENSE');
      case 'all':
      default:
        return data.data;
    }
  }, [data, activeTab]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDateForPrint = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const handlePrintPaymentHistory = useCallback(() => {
    const payments = filteredPayments;
    const farmerMap = new Map(farmers.map((f) => [f.id, f.name]));
    const rows = payments.map(
      (p) =>
        `<tr>
          <td>${formatDateForPrint(p.date)}</td>
          <td>${escapeHtml(farmerMap.get(p.farmerStorageLinkId) ?? 'N/A')}</td>
          <td>${escapeHtml(p.type)}</td>
          <td class="num">${formatCurrency(p.amount)}</td>
          <td>${escapeHtml(p.remarks ?? '')}</td>
        </tr>`
    );
    const bodyHtml = `
      <div class="print-section">
        <h3>Summary</h3>
        <p><strong>Total Rent:</strong> ${formatCurrency(summaryTotals.totalRent)} &nbsp; <strong>Total Paid:</strong> ${formatCurrency(summaryTotals.totalPaid)} &nbsp; <strong>Total Due:</strong> ${formatCurrency(summaryTotals.totalDue)} &nbsp; <strong>Total Expense:</strong> ${formatCurrency(summaryTotals.totalExpense)}</p>
      </div>
      <div class="print-section">
        <h3>Payment History</h3>
        <table class="print-table">
          <thead><tr><th>Date</th><th>Farmer</th><th>Type</th><th class="num">Amount</th><th>Remarks</th></tr></thead>
          <tbody>${rows.length ? rows.join('') : '<tr><td colspan="5">No entries</td></tr>'}</tbody>
        </table>
      </div>
    `;
    const html = wrapPrintDocument({
      title: 'Payment History',
      subtitle: activeTab !== 'all' ? `Filter: ${activeTab}` : undefined,
      bodyHtml,
    });
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  }, [filteredPayments, farmers, summaryTotals, activeTab]);

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
      {/* Date-wise & Farmer-wise filters — shadcn Card, Input, Select, Button */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium text-muted-foreground">Filters</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 min-w-0">
              <div className="space-y-2">
                <Label htmlFor="payment-date-from" className="text-sm font-medium">
                  Date from
                </Label>
                <Input
                  id="payment-date-from"
                  type="date"
                  value={dateFromInput}
                  onChange={(e) => setDateFromInput(e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-date-to" className="text-sm font-medium">
                  Date to
                </Label>
                <Input
                  id="payment-date-to"
                  type="date"
                  value={dateToInput}
                  onChange={(e) => setDateToInput(e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-farmer" className="text-sm font-medium">
                  Farmer
                </Label>
                <Select
                  value={farmerInput || 'all'}
                  onValueChange={(v) => setFarmerInput(v === 'all' ? '' : v)}
                >
                  <SelectTrigger id="payment-farmer" className="h-10">
                    <SelectValue placeholder="All farmers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All farmers</SelectItem>
                    {farmers.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name} (#{f.accountNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="default"
                  size="default"
                  className="h-10 px-4 gap-2 shrink-0"
                  onClick={applyFilters}
                >
                  <Filter className="h-4 w-4" />
                  Apply filters
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  className="h-10 px-4 gap-2 shrink-0"
                  onClick={clearFilters}
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                    <div className="p-1.5 sm:p-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
            <TabsList className="w-full sm:w-auto flex flex-wrap gap-1">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="rent">Rent</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="expense">Expense</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm" onClick={handlePrintPaymentHistory} className="gap-2 shrink-0">
              <FileDown className="h-4 w-4" />
              Print / Save as PDF
            </Button>
          </div>

          <TabsContent value={activeTab} className="mt-4">
            {filteredPayments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No {activeTab === 'all' ? 'payment history' : activeTab} entries found.
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
