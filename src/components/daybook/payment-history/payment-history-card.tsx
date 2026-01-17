'use client';

import React, { useMemo } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import type { PaymentHistoryResponse } from '@/types/paymentHistory';
import { useGetAllFarmers } from '@/services/base/store-admin/functions/useGetAllFarmers';

interface PaymentHistoryCardProps {
  payment: PaymentHistoryResponse;
  onEdit: () => void;
}

// Utility function to format date
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

// Utility function to format amount
const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const PaymentHistoryCard: React.FC<PaymentHistoryCardProps> = ({ payment, onEdit }) => {
  const farmersQuery = useGetAllFarmers();

  // Find farmer information
  const farmer = useMemo(() => {
    if (!farmersQuery.data?.data) return null;
    return farmersQuery.data.data.find((f) => f.id === payment.farmerStorageLinkId) ?? null;
  }, [farmersQuery.data, payment.farmerStorageLinkId]);

  const formattedDate = useMemo(() => formatDate(payment.date), [payment.date]);
  const formattedAmount = useMemo(() => formatAmount(payment.amount), [payment.amount]);

  // Get payment type badge color
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'RENT':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'EXPENSE':
        return 'bg-red-500/10 text-red-600 dark:text-red-400';
      case 'PAYMENT':
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-0.5" />
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-foreground">
              Payment #{payment.id.slice(-8).toUpperCase()}
            </h2>
            <span
              className={`ml-2 px-2.5 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(
                payment.type
              )}`}
            >
              {payment.type}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-muted rounded-full text-xs sm:text-sm text-muted-foreground">
              Date: {formattedDate}
            </div>
            <Button variant="outline" size="sm" onClick={onEdit} aria-label="Edit payment">
              <Edit className="w-4 h-4 text-primary" />
            </Button>
          </div>
        </div>

        {/* Key Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Amount</div>
            <div className="font-semibold text-sm lg:text-base text-foreground">
              {formattedAmount}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Farmer Name</div>
            <div className="font-semibold text-sm lg:text-base text-foreground">
              {farmer?.name ?? 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Mobile Number</div>
            <div className="font-semibold text-sm lg:text-base text-foreground">
              {farmer?.mobileNumber ?? 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Address</div>
            <div className="font-semibold text-sm lg:text-base text-foreground truncate">
              {farmer?.address ?? 'N/A'}
            </div>
          </div>
        </div>

        {/* Remarks */}
        {payment.remarks && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-xs text-muted-foreground mb-1">Remarks</div>
            <div className="text-sm text-foreground">{payment.remarks}</div>
          </div>
        )}
      </CardHeader>
    </Card>
  );
};
