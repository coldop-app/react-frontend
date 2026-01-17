'use client';

import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SearchSelector } from '@/components/search-selector';
import { DatePicker } from '@/components/forms/date-picker';
import { AddFarmerModal } from '@/components/forms/add-farmer-modal';
import { useGetAllFarmers } from '@/services/base/store-admin/functions/useGetAllFarmers';
import { formatDate, formatDateToISO } from '@/lib/helpers';
import { useCreatePaymentHistory } from '@/services/base/payment-history/useCreatePaymentHistory';
import { useStore } from '@/stores/store';
import type { CreatePaymentHistoryInput } from '@/types/paymentHistory';
import { toast } from 'sonner';

const paymentTypeOptions: Array<{ label: string; value: 'RENT' | 'EXPENSE' | 'PAYMENT' }> = [
  { label: 'RENT', value: 'RENT' },
  { label: 'EXPENSE', value: 'EXPENSE' },
  { label: 'PAYMENT', value: 'PAYMENT' },
];

const paymentFormSchema = z.object({
  paymentType: z
    .union([z.enum(['RENT', 'EXPENSE', 'PAYMENT']), z.literal(''), z.undefined()])
    .refine((val) => val === 'RENT' || val === 'EXPENSE' || val === 'PAYMENT', {
      message: 'Please select a payment type',
    }),
  farmerStorageLinkId: z.string().min(1, 'Please select a farmer'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
      },
      { message: 'Amount must be a positive number' }
    ),
  date: z.string().min(1, 'Date is required'),
  remarks: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PaymentDialog: React.FC<PaymentDialogProps> = ({ open, onOpenChange }) => {
  const { admin } = useStore();
  const createPaymentHistoryMutation = useCreatePaymentHistory();
  const farmersQuery = useGetAllFarmers();

  const farmerOptions = useMemo(() => {
    const farmers = farmersQuery.data?.data ?? [];
    return farmers.map((farmer) => ({
      label: farmer.name,
      value: farmer.id,
      searchableText: `${farmer.name} ${farmer.mobileNumber} ${farmer.address}`,
      renderLabel: (
        <div className="flex flex-col">
          <span className="font-medium">{farmer.name}</span>
          <span className="text-xs text-muted-foreground">📞 {farmer.mobileNumber}</span>
          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
            📍 {farmer.address}
          </span>
        </div>
      ),
    }));
  }, [farmersQuery.data]);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      paymentType: 'PAYMENT',
      farmerStorageLinkId: '',
      amount: '',
      date: formatDate(new Date()),
      remarks: '',
    },
  });

  const onSubmit = (values: PaymentFormData) => {
    if (!admin?.id) {
      toast.error('Admin information not found. Please log in again.');
      return;
    }

    const payload: CreatePaymentHistoryInput = {
      farmerStorageLinkId: values.farmerStorageLinkId,
      date: formatDateToISO(values.date), // Convert dd.mm.yyyy to ISO format
      amount: parseFloat(values.amount),
      type: values.paymentType as 'RENT' | 'EXPENSE' | 'PAYMENT',
      remarks: values.remarks?.trim() || null,
      createdBy: admin.id,
      voucherId: null, // Optional, can be set later if needed
    };

    createPaymentHistoryMutation.mutate(payload, {
      onSuccess: () => {
        // Reset form and close dialog
        form.reset();
        onOpenChange(false);
      },
    });
  };

  const handleClose = () => {
    form.reset({
      paymentType: 'PAYMENT',
      farmerStorageLinkId: '',
      amount: '',
      date: formatDate(new Date()),
      remarks: '',
    });
    onOpenChange(false);
  };

  // Reset form to defaults when dialog opens
  React.useEffect(() => {
    if (open) {
      form.reset({
        paymentType: 'PAYMENT',
        farmerStorageLinkId: '',
        amount: '',
        date: formatDate(new Date()),
        remarks: '',
      });
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Payment</DialogTitle>
          <DialogDescription>Enter payment details below</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Payment Type Selector */}
            <FormField
              control={form.control}
              name="paymentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Type</FormLabel>
                  <FormControl>
                    <SearchSelector
                      id="payment-type-selector"
                      options={paymentTypeOptions}
                      placeholder="Select payment type..."
                      onSelect={(value) => field.onChange(value || undefined)}
                      className="w-full"
                      buttonClassName="w-full justify-between h-10"
                      defaultValue={field.value || 'PAYMENT'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Farmer Search */}
            <FormField
              control={form.control}
              name="farmerStorageLinkId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Farmer</FormLabel>
                  <FormControl>
                    <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <SearchSelector
                          id="farmer-search"
                          options={farmerOptions}
                          placeholder="Select farmer..."
                          searchPlaceholder="Search by name, mobile, or address..."
                          className="w-full p-0"
                          buttonClassName="w-full justify-between h-10"
                          loading={farmersQuery.isLoading}
                          loadingMessage="Loading farmers..."
                          emptyMessage="No farmers found."
                          onSelect={(id) => field.onChange(id || '')}
                          defaultValue={field.value}
                        />
                      </div>
                      <AddFarmerModal farmers={farmersQuery.data?.data ?? []} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount Field */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter amount"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Field */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DatePicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Remarks Field */}
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter remarks (optional)"
                      {...field}
                      rows={2}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createPaymentHistoryMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createPaymentHistoryMutation.isPending}>
                {createPaymentHistoryMutation.isPending ? 'Submitting...' : 'Submit'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
