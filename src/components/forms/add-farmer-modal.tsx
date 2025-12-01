import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import type { StoreAdminFarmer } from '@/services/base/store-admin/functions/useGetAllFarmers';
import { useStoreAdminRegisterFarmer } from '@/services/base/store-admin/functions/useRegisterFarmer';
import { useEnterNavigation } from '@/hooks/use-enter-navigation';

interface AddFarmerModalProps {
  farmers?: StoreAdminFarmer[];
}

export const AddFarmerModal = ({ farmers = [] }: AddFarmerModalProps) => {
  const { mutate, isPending } = useStoreAdminRegisterFarmer();
  const fieldsContainerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Collect unique existing account numbers
  const usedAccountNumbers = useMemo(() => {
    return farmers
      .map((f) => f.accountNumber.toString())
      .filter((acc, i, s) => s.indexOf(acc) === i)
      .sort((a, b) => Number(a) - Number(b));
  }, [farmers]);

  // Collect unique existing mobile numbers
  const usedMobileNumbers = useMemo(() => {
    return farmers
      .map((f) => f.mobileNumber.toString())
      .filter((mob, i, s) => s.indexOf(mob) === i)
      .sort();
  }, [farmers]);

  const nextAccountNumber = useMemo(() => {
    if (usedAccountNumbers.length === 0) return 1;
    const latest = Number(usedAccountNumbers[usedAccountNumbers.length - 1]);
    return latest + 1;
  }, [usedAccountNumbers]);

  // Create schema with dynamic validation
  const storeAdminFarmerRegisterSchema = useMemo(() => {
    return z.object({
      name: z.string().min(1, 'Name is required'),
      address: z.string().min(1, 'Address is required'),
      accountNumber: z
        .number()
        .positive('Account number must be a positive number')
        .refine((value) => !usedAccountNumbers.includes(value.toString()), {
          message: 'Account number already in use',
        }),
      mobileNumber: z
        .string()
        .length(10, 'Mobile number must be 10 digits')
        .refine((value) => !usedMobileNumbers.includes(value.toString()), {
          message: 'Mobile number already in use',
        }),
      password: z.string().min(6, 'Password must be at least 6 characters'),
    });
  }, [usedAccountNumbers, usedMobileNumbers]);

  const form = useForm<z.infer<typeof storeAdminFarmerRegisterSchema>>({
    resolver: zodResolver(storeAdminFarmerRegisterSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      address: '',
      mobileNumber: '',
      accountNumber: nextAccountNumber,
      password: '123456',
    },
  });

  const { onKeyDown, containerRef } = useEnterNavigation({
    containerRef: fieldsContainerRef as React.RefObject<HTMLElement>,
    onLastFieldEnter: () => form.handleSubmit(onSubmit)(),
  });

  // Watch both fields for real-time validation
  const currentAccountNumber = useWatch({ control: form.control, name: 'accountNumber' });
  const currentMobileNumber = useWatch({ control: form.control, name: 'mobileNumber' });

  // Reset account number on open dialog
  useEffect(() => {
    if (isOpen) {
      form.setValue('accountNumber', nextAccountNumber);
    }
  }, [isOpen, nextAccountNumber, form]);

  // Manual duplicate check for account numbers
  useEffect(() => {
    if (currentAccountNumber && usedAccountNumbers.includes(currentAccountNumber.toString())) {
      form.setError('accountNumber', {
        type: 'manual',
        message: 'Account number already in use',
      });
    } else if (currentAccountNumber) {
      // Clear only if there's no other validation error
      const errors = form.formState.errors.accountNumber;
      if (errors && errors.message === 'Account number already in use') {
        form.clearErrors('accountNumber');
      }
    }
  }, [currentAccountNumber, usedAccountNumbers, form]);

  // Manual duplicate check for mobile numbers
  useEffect(() => {
    if (currentMobileNumber && usedMobileNumbers.includes(currentMobileNumber.toString())) {
      form.setError('mobileNumber', {
        type: 'manual',
        message: 'Mobile number already in use',
      });
    } else if (currentMobileNumber) {
      // Clear only if there's no other validation error
      const errors = form.formState.errors.mobileNumber;
      if (errors && errors.message === 'Mobile number already in use') {
        form.clearErrors('mobileNumber');
      }
    }
  }, [currentMobileNumber, usedMobileNumbers, form]);

  const onSubmit = (values: z.infer<typeof storeAdminFarmerRegisterSchema>) => {
    if (usedAccountNumbers.includes(values.accountNumber.toString())) {
      form.setError('accountNumber', { type: 'manual', message: 'Account number already in use' });
      return;
    }

    if (usedMobileNumbers.includes(values.mobileNumber.toString())) {
      form.setError('mobileNumber', { type: 'manual', message: 'Mobile number already in use' });
      return;
    }

    mutate(values, {
      onSuccess: () => {
        form.reset({
          name: '',
          address: '',
          mobileNumber: '',
          accountNumber: values.accountNumber + 1,
          password: '123456',
        });
        setIsOpen(false);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 w-full sm:w-auto">Add New Farmer</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Add New Farmer</DialogTitle>
              <DialogDescription>
                Enter the farmer details to register them quickly
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 mt-6" ref={containerRef as React.RefObject<HTMLDivElement>}>
              {/* ACCOUNT NUMBER FIELD */}
              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Account Number</FormLabel>

                      {/* POPOVER */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0 hover:bg-accent/50"
                          >
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-4 shadow-xl rounded-xl">
                          <p className="font-semibold text-sm mb-2 flex items-center gap-1">
                            <Info className="h-4 w-4 text-primary" /> Used Accounts
                          </p>
                          {usedAccountNumbers.length > 0 ? (
                            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                              {usedAccountNumbers.map((acc) => (
                                <span
                                  key={acc}
                                  className="text-xs font-medium rounded-full border px-3 py-1"
                                >
                                  {acc}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="py-3 text-center text-sm">
                              No account numbers in use
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>

                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter account number"
                        {...field}
                        className={`${form.formState.errors.accountNumber ? 'border-red-500 animate-shake' : ''}`}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                        onKeyDown={onKeyDown}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* MOBILE NUMBER FIELD */}
              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Enter 10-digit mobile number"
                        maxLength={10}
                        {...field}
                        className={`${form.formState.errors.mobileNumber ? 'border-red-500 animate-shake' : ''}`}
                        onChange={(e) =>
                          field.onChange(e.target.value.replace(/\D/g, '').slice(0, 10))
                        }
                        onKeyDown={onKeyDown}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* NAME */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter farmer name" {...field} onKeyDown={onKeyDown} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ADDRESS */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter address" {...field} onKeyDown={onKeyDown} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={
                  isPending ||
                  !!form.formState.errors.accountNumber ||
                  !!form.formState.errors.mobileNumber
                }
              >
                {isPending ? 'Adding...' : 'Add Farmer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
