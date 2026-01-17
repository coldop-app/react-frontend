'use client';

import React from 'react';
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
import { useUpdatePaymentHistory } from '@/services/base/payment-history/useUpdatePaymentHistory';
import type { PaymentHistoryResponse, UpdatePaymentHistoryInput } from '@/types/paymentHistory';

const updatePaymentFormSchema = z.object({
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
  remarks: z.string().optional(),
  voucherId: z.string().optional().nullable(),
});

type UpdatePaymentFormData = z.infer<typeof updatePaymentFormSchema>;

interface EditPaymentDialogProps {
  payment: PaymentHistoryResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditPaymentDialog: React.FC<EditPaymentDialogProps> = ({
  payment,
  open,
  onOpenChange,
}) => {
  const updatePaymentHistoryMutation = useUpdatePaymentHistory();

  const form = useForm<UpdatePaymentFormData>({
    resolver: zodResolver(updatePaymentFormSchema),
    defaultValues: {
      amount: payment.amount.toString(),
      remarks: payment.remarks || '',
      voucherId: payment.voucherId || '',
    },
  });

  const onSubmit = (values: UpdatePaymentFormData) => {
    const payload: UpdatePaymentHistoryInput = {
      id: payment.id,
      amount: parseFloat(values.amount),
      remarks: values.remarks?.trim() || null,
      voucherId: values.voucherId?.trim() || null,
    };

    updatePaymentHistoryMutation.mutate(payload, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  };

  const handleClose = () => {
    form.reset({
      amount: payment.amount.toString(),
      remarks: payment.remarks || '',
      voucherId: payment.voucherId || '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Payment</DialogTitle>
          <DialogDescription>Update payment details below</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      rows={3}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Voucher ID Field */}
            <FormField
              control={form.control}
              name="voucherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voucher ID (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter voucher ID"
                      {...field}
                      value={field.value || ''}
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
                disabled={updatePaymentHistoryMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updatePaymentHistoryMutation.isPending}>
                {updatePaymentHistoryMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
