import React from 'react';

import { FarmerSearch, DatePicker } from '@/components/forms';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Checkbox } from '@/components/ui/checkbox';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Button } from '@/components/ui/button';

import { MapPin, Columns, X } from 'lucide-react';
import { cn } from '@/lib/utils';

import type { UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import type { DaybookOrder } from '@/types/daybook';
import type { ApiResponse } from '@/types/apiResponse';

interface StepInfoProps {
  farmerStorageLinkId: string;
  selectedCommodity: string;
  selectedVariety: string;
  selectedOrders: Set<string>;
  visibleBagSizes: string[];
  bagSizes: string[];
  visibleColumns: Set<string>;
  quantities: Map<string, number>;
  farmerOrdersQuery: UseQueryResult<
    ApiResponse<DaybookOrder[]>,
    AxiosError<{ error?: { message?: string }; message?: string }>
  >;
  availableCommodities: string[];
  availableVarieties: string[];
  incomingOrders: DaybookOrder[];
  orderDate: string;
  onFarmerSelect: (id: string) => void;
  onCommodityChange: (commodity: string) => void;
  onVarietyChange: (variety: string) => void;
  onDateChange: (date: string) => void;
  onColumnToggle: (size: string) => void;
  onOrderToggle: (orderId: string) => void;
  onCardClick: (
    orderId: string,
    size: string,
    variety: string,
    location: string,
    currentQuantity: number
  ) => void;
  onQuickRemove: (e: React.MouseEvent, cardKey: string) => void;
  getOrderSizeData: (
    order: DaybookOrder,
    size: string
  ) => Array<{
    variety: string;
    quantityCurr: number;
    quantityInit: number;
    location: string;
    pricePerBag?: number;
  }>;
  getCardKey: (orderId: string, size: string, variety: string, location: string) => string;
}

export const StepInfo: React.FC<StepInfoProps> = ({
  farmerStorageLinkId,
  selectedCommodity,
  selectedVariety,
  selectedOrders,
  visibleBagSizes,
  bagSizes,
  visibleColumns,
  quantities,
  farmerOrdersQuery,
  availableCommodities,
  availableVarieties,
  incomingOrders,
  orderDate,
  onFarmerSelect,
  onCommodityChange,
  onVarietyChange,
  onDateChange,
  onColumnToggle,
  onOrderToggle,
  onCardClick,
  onQuickRemove,
  getOrderSizeData,
  getCardKey,
}) => {
  return (
    <div className="space-y-8">
      {/* Farmer Selection */}
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground mb-4">
          Select or add a farmer to start creating an outgoing order.
        </p>

        <div className="space-y-3">
          <Label htmlFor="farmer-search" className="text-base font-medium">
            Select Farmer
          </Label>
          <FarmerSearch onSelect={onFarmerSelect} />
        </div>
      </div>

      {/* Commodity Selector - Only show if more than one commodity */}
      {farmerStorageLinkId && availableCommodities.length > 1 && (
        <div className="space-y-3">
          <Label htmlFor="commodity" className="text-base font-medium">
            Select Commodity
          </Label>

          {farmerOrdersQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading commodities...</p>
          ) : availableCommodities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No commodities found for this farmer</p>
          ) : (
            <Select value={selectedCommodity || '__all__'} onValueChange={onCommodityChange}>
              <SelectTrigger id="commodity">
                <SelectValue placeholder="Choose a commodity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Commodities</SelectItem>
                {availableCommodities.map((commodity) => (
                  <SelectItem key={commodity} value={commodity}>
                    {commodity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {/* Date Picker */}
      {farmerStorageLinkId && <DatePicker value={orderDate} onChange={onDateChange} />}

      {/* Variety Selector */}
      {selectedCommodity && availableVarieties.length > 0 && (
        <div className="space-y-3">
          <Label htmlFor="variety" className="text-base font-medium">
            Select Variety
          </Label>
          <Select
            value={selectedVariety || '__all__'}
            onValueChange={(val) => onVarietyChange(val === '__all__' ? '' : val)}
          >
            <SelectTrigger id="variety">
              <SelectValue placeholder="Choose a variety" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Varieties</SelectItem>
              {availableVarieties.map((variety) => (
                <SelectItem key={variety} value={variety}>
                  {variety}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Incoming Orders Table */}
      {farmerStorageLinkId && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-xl">Incoming Orders</CardTitle>

                <CardDescription>
                  {selectedCommodity
                    ? selectedVariety
                      ? `Showing orders for ${selectedCommodity} - ${selectedVariety}`
                      : `Showing orders for ${selectedCommodity}`
                    : 'Select a commodity to view orders'}
                </CardDescription>
              </div>

              {selectedCommodity && bagSizes.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Columns className="h-4 w-4" /> Columns
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {bagSizes.map((size) => (
                      <DropdownMenuCheckboxItem
                        key={size}
                        checked={visibleColumns.has(size)}
                        onCheckedChange={() => onColumnToggle(size)}
                      >
                        {size}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {/* Fetch States */}
            {farmerOrdersQuery.isLoading && (
              <p className="text-sm text-muted-foreground">Loading orders...</p>
            )}

            {farmerOrdersQuery.isError && (
              <p className="text-sm text-destructive">Error loading orders</p>
            )}

            {/* No commodity selected */}
            {!farmerOrdersQuery.isLoading &&
              !farmerOrdersQuery.isError &&
              (!selectedCommodity || bagSizes.length === 0) && (
                <p className="text-sm text-muted-foreground">
                  {!selectedCommodity
                    ? 'Please select a commodity to view orders'
                    : 'No bag sizes configured for this commodity'}
                </p>
              )}

            {/* Orders Table */}
            {!farmerOrdersQuery.isLoading &&
              !farmerOrdersQuery.isError &&
              selectedCommodity &&
              bagSizes.length > 0 && (
                <div className="overflow-x-auto">
                  {visibleBagSizes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">
                        No columns selected. Use the Columns button to show columns.
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-[120px] font-medium text-foreground/80">
                            R. Voucher
                          </TableHead>

                          {visibleBagSizes.map((size) => (
                            <TableHead key={size} className="font-medium text-foreground/80">
                              {size}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {/* No orders */}
                        {incomingOrders.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={visibleBagSizes.length + 1}
                              className="text-center text-muted-foreground/70 py-8"
                            >
                              No incoming orders found
                            </TableCell>
                          </TableRow>
                        ) : (
                          incomingOrders.map((order) => (
                            <TableRow
                              key={order.id}
                              className="hover:bg-transparent border-border/40"
                            >
                              {/* Checkbox + Voucher */}
                              <TableCell className="py-3">
                                <div className="flex items-center gap-2.5">
                                  <Checkbox
                                    checked={selectedOrders.has(order.id)}
                                    onCheckedChange={() => onOrderToggle(order.id)}
                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                  />
                                  <span className="font-medium text-foreground/90">
                                    #{order.gatePassNumber}
                                  </span>
                                </div>
                              </TableCell>

                              {/* Bag Size Columns */}
                              {visibleBagSizes.map((size) => {
                                const sizeData = getOrderSizeData(order, size);

                                return (
                                  <TableCell key={size} className="py-2">
                                    {sizeData.length === 0 ? (
                                      <div className="h-20 bg-muted/30 rounded-lg border border-border/40"></div>
                                    ) : (
                                      <div className="space-y-2.5">
                                        {sizeData.map((data, idx) => {
                                          const cardKey = getCardKey(
                                            order.id,
                                            size,
                                            data.variety,
                                            data.location
                                          );

                                          const quantity = quantities.get(cardKey);

                                          const isActive =
                                            selectedOrders.has(order.id) || quantity !== undefined;

                                          return (
                                            <div
                                              key={idx}
                                              className={cn(
                                                'group relative p-3 rounded-lg border cursor-pointer transition-all duration-200',
                                                'hover:bg-muted/50 hover:border-muted-foreground/20 hover:shadow-sm',
                                                isActive
                                                  ? 'bg-primary/5 border-primary/30 shadow-sm'
                                                  : 'bg-card/50 border-border/60'
                                              )}
                                              onClick={() =>
                                                onCardClick(
                                                  order.id,
                                                  size,
                                                  data.variety,
                                                  data.location,
                                                  data.quantityCurr
                                                )
                                              }
                                            >
                                              {quantity !== undefined && (
                                                <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center text-[10px] font-semibold shadow-lg ring-2 ring-background z-10 group/badge">
                                                  <span className="group-hover/badge:hidden">
                                                    {quantity.toFixed(1)}
                                                  </span>
                                                  <button
                                                    onClick={(e) => onQuickRemove(e, cardKey)}
                                                    className="hidden group-hover/badge:flex items-center justify-center w-full h-full rounded-full hover:bg-green-700 transition-colors"
                                                  >
                                                    <X className="h-3 w-3" />
                                                  </button>
                                                </div>
                                              )}

                                              <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                  <p className="text-sm font-medium text-foreground/90 truncate mb-1.5">
                                                    {data.variety}
                                                  </p>
                                                  <div className="flex items-center gap-1.5">
                                                    <MapPin className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                                                    <p className="text-xs text-muted-foreground/80 truncate">
                                                      {data.location}
                                                    </p>
                                                  </div>
                                                </div>

                                                <div className="text-right shrink-0">
                                                  <p className="text-lg font-semibold text-foreground leading-none">
                                                    {data.quantityCurr.toFixed(1)}
                                                  </p>
                                                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                                                    /{data.quantityInit.toFixed(1)}
                                                  </p>
                                                  {data.pricePerBag != null && (
                                                    <p className="text-xs text-primary font-medium mt-1">
                                                      ₹{data.pricePerBag}/bag
                                                    </p>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </div>
              )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
