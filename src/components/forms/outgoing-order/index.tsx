import { useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { OrderNumber } from '@/components/forms/order-number';
import { useOutgoingOrder } from './useOutgoingOrder';
import { StepInfo } from './step-info';
import { QuantityDialog } from './quantity-dialog';
import { SummarySheet } from './summary-sheet';

export default function OutgoingOrderPage() {
  const {
    // State
    selectedCommodity,
    farmerStorageLinkId,
    selectedVariety,
    setSelectedVariety,
    selectedOrders,
    visibleColumns,
    quantities,
    dialogOpen,
    selectedCardKey,
    quantityInput,
    maxQuantity,
    quantityError,
    summarySheetOpen,
    setSummarySheetOpen,
    selectedBags,
    remarksRef,

    // Data
    data,
    createOutgoingOrderMutation,
    farmerOrdersQuery,
    availableCommodities,
    availableVarieties,
    selectedFarmer,
    incomingOrders,
    bagSizes,
    visibleBagSizes,

    // Handlers
    handleCommodityChange,
    handleFarmerSelect,
    handleSubmit,
    handleColumnToggle,
    getOrderSizeData,
    handleOrderToggle,
    getCardKey,
    handleCardClick,
    handleQuantityInputChange,
    handleQuantitySubmit,
    handleQuantityRemove,
    handleQuickRemove,
    handleDialogClose,
  } = useOutgoingOrder();

  // Autofocus farmer search input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const farmerSearchButton = document.getElementById('farmer-search');
      if (farmerSearchButton) farmerSearchButton.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex w-full max-w-full flex-col gap-8 mx-auto px-4">
      {/* MAIN CARD */}
      <Card>
        <CardHeader className="pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col">
              <OrderNumber
                gatePassNumber={data?.data?.nextGatePassNumber}
                type="Delivery"
                name="Voucher"
              />

              <CardTitle className="text-2xl mt-2">Outgoing Order</CardTitle>
              <CardDescription className="text-base mt-1">
                Select farmer, commodity, and variety.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6">
          <StepInfo
            farmerStorageLinkId={farmerStorageLinkId}
            selectedCommodity={selectedCommodity}
            selectedVariety={selectedVariety}
            selectedOrders={selectedOrders}
            visibleBagSizes={visibleBagSizes}
            bagSizes={bagSizes}
            visibleColumns={visibleColumns}
            quantities={quantities}
            farmerOrdersQuery={farmerOrdersQuery}
            availableCommodities={availableCommodities}
            availableVarieties={availableVarieties}
            incomingOrders={incomingOrders}
            onFarmerSelect={handleFarmerSelect}
            onCommodityChange={handleCommodityChange}
            onVarietyChange={setSelectedVariety}
            onColumnToggle={handleColumnToggle}
            onOrderToggle={handleOrderToggle}
            onCardClick={handleCardClick}
            onQuickRemove={handleQuickRemove}
            getOrderSizeData={getOrderSizeData}
            getCardKey={getCardKey}
          />
        </CardContent>

        <CardFooter className="flex justify-between items-center pt-6 border-t">
          <div />
          <Button onClick={() => setSummarySheetOpen(true)}>Next</Button>
        </CardFooter>
      </Card>

      {/* Quantity Input Dialog */}
      <QuantityDialog
        open={dialogOpen}
        quantityInput={quantityInput}
        quantityError={quantityError}
        maxQuantity={maxQuantity}
        selectedCardKey={selectedCardKey}
        quantities={quantities}
        onQuantityInputChange={handleQuantityInputChange}
        onQuantitySubmit={handleQuantitySubmit}
        onQuantityRemove={handleQuantityRemove}
        onClose={handleDialogClose}
      />

      {/* Summary Sheet */}
      <SummarySheet
        open={summarySheetOpen}
        onOpenChange={setSummarySheetOpen}
        selectedBags={selectedBags}
        selectedFarmer={selectedFarmer}
        selectedCommodity={selectedCommodity}
        selectedVariety={selectedVariety}
        remarksRef={remarksRef}
        onSubmit={handleSubmit}
        isSubmitting={createOutgoingOrderMutation.isPending}
      />
    </div>
  );
}
