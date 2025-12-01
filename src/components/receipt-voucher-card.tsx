import { useState, useMemo, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronUp, ChevronDown, Edit, Printer } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import type { DaybookOrder } from '@/types/daybook';
import type { ColdStorage } from '@/types/coldStorage';
import EditIncomingOrderDialog from '@/components/forms/edit-incoming-order';

interface TableRow {
  variety: string;
  size: string;
  quantity: string;
  weight: string;
  chamber: string;
  floor: string;
  row: string;
}

interface ReceiptVoucherCardProps {
  data: DaybookOrder;
  coldStorage: ColdStorage | null;
  receiptVisibleColumns: string[];
  setReceiptColumns: (cols: string[]) => void;
}

// Memoized detail row component
const DetailRow = memo(({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-xs text-muted-foreground mb-1">{label}</div>
    <div className="font-semibold text-sm lg:text-base text-foreground">{value}</div>
  </div>
));
DetailRow.displayName = 'DetailRow';

// Static column definition
const createTableColumns = (): ColumnDef<TableRow>[] => [
  {
    accessorKey: 'variety',
    header: 'Variety',
  },
  {
    accessorKey: 'size',
    header: 'Size',
  },
  {
    accessorKey: 'quantity',
    header: 'Quantity',
  },
  {
    accessorKey: 'weight',
    header: 'Weight (kg)',
  },
  {
    accessorKey: 'chamber',
    header: 'Chamber',
  },
  {
    accessorKey: 'floor',
    header: 'Floor',
  },
  {
    accessorKey: 'row',
    header: 'Row',
  },
];

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

function ReceiptVoucherCard({
  data,
  coldStorage,
  receiptVisibleColumns,
  setReceiptColumns,
}: ReceiptVoucherCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Memoize toggle handler
  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // Memoize print handler (placeholder)
  const handlePrint = useCallback(() => {
    // Implement print logic
    window.print();
  }, []);

  // Get commodity size order from preferences
  const commodityOrder = useMemo(() => {
    return (
      coldStorage?.preferences?.commodities?.find((c) => c.name === data.commodity)?.sizes ?? []
    );
  }, [coldStorage?.preferences?.commodities, data.commodity]);

  // Transform varieties and bagSizes into grouped tables by variety
  const groupedTables = useMemo((): Record<string, TableRow[]> => {
    const grouped: Record<string, TableRow[]> = {};

    // Process each variety
    data.varieties.forEach((variety) => {
      const varietyRows: TableRow[] = [];

      // Create rows for this variety
      variety.bagSizes.forEach((bagSize) => {
        varietyRows.push({
          variety: variety.name,
          size: bagSize.name,
          quantity: `${bagSize.quantityCurr} / ${bagSize.quantityInit}`,
          weight:
            bagSize.approxWeight !== undefined && bagSize.approxWeight !== null
              ? bagSize.approxWeight.toFixed(2)
              : 'N/A',
          chamber: bagSize.chamber,
          floor: bagSize.floor,
          row: bagSize.row,
        });
      });

      // Sort rows within this variety by size order from preferences
      varietyRows.sort((a, b) => {
        const indexA = commodityOrder.indexOf(a.size);
        const indexB = commodityOrder.indexOf(b.size);
        // If size not found in order, put it at the end
        if (indexA === -1 && indexB === -1) return a.size.localeCompare(b.size);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });

      // Calculate totals for this variety
      const totalQuantityCurr = variety.bagSizes.reduce((sum, bag) => sum + bag.quantityCurr, 0);
      const totalQuantityInit = variety.bagSizes.reduce((sum, bag) => sum + bag.quantityInit, 0);
      const totalWeight = variety.bagSizes.reduce(
        (sum, bag) =>
          sum +
          (bag.approxWeight !== undefined && bag.approxWeight !== null ? bag.approxWeight : 0),
        0
      );

      // Add Total row for this variety
      varietyRows.push({
        variety: variety.name,
        size: 'Total',
        quantity: `${totalQuantityCurr} / ${totalQuantityInit}`,
        weight: totalWeight > 0 ? totalWeight.toFixed(2) : 'N/A',
        chamber: '-',
        floor: '-',
        row: '-',
      });

      grouped[variety.name] = varietyRows;
    });

    return grouped;
  }, [data.varieties, commodityOrder]);

  // Get variety names for iteration
  const varietyNamesForTables = useMemo(() => Object.keys(groupedTables), [groupedTables]);

  // Memoize columns
  const columns = useMemo(() => createTableColumns(), []);

  // Convert receiptVisibleColumns array to VisibilityState object
  const columnVisibility = useMemo(() => {
    const visibility: Record<string, boolean> = {};
    // All columns are visible by default
    columns.forEach((col) => {
      if ('accessorKey' in col && typeof col.accessorKey === 'string') {
        visibility[col.accessorKey] = receiptVisibleColumns.includes(col.accessorKey);
      }
    });
    return visibility;
  }, [columns, receiptVisibleColumns]);

  // Handle column visibility changes
  const handleColumnVisibilityChange = useCallback(
    (visibility: Record<string, boolean>) => {
      // Convert VisibilityState back to array of visible column names
      const visibleColumns = columns
        .map((col) =>
          'accessorKey' in col && typeof col.accessorKey === 'string' ? col.accessorKey : null
        )
        .filter((key): key is string => key !== null && visibility[key] === true);
      setReceiptColumns(visibleColumns);
    },
    [columns, setReceiptColumns]
  );

  // Extract farmer information
  const farmer = data.farmerStorageLink?.farmer;
  const partyName = farmer?.name ?? 'N/A';
  const address = farmer?.address ?? 'N/A';
  const mobileNumber = farmer?.mobileNumber ?? 'N/A';

  // Format date
  const formattedDate = useMemo(() => formatDate(data.createdAt), [data.createdAt]);

  // Get all variety names for display in header
  const varietyNamesDisplay = useMemo(
    () => data.varieties.map((v) => v.name).join(', ') || 'N/A',
    [data.varieties]
  );

  // Check if voucher is null (no varieties)
  const isNullVoucher = useMemo(
    () => !data.varieties || data.varieties.length === 0,
    [data.varieties]
  );

  return (
    <Card
      className={`overflow-hidden transition-opacity ${
        isNullVoucher && !isExpanded ? 'opacity-50' : ''
      }`}
    >
      <CardHeader className="pb-4 sm:pb-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-5 sm:mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-0.5" />
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-foreground">
              Receipt Voucher: <span className="text-primary font-bold">{data.gatePassNumber}</span>
            </h2>
            {isNullVoucher && !isExpanded && (
              <span className="ml-2 px-2 py-0.5 text-xs text-muted-foreground/70 bg-muted/50 rounded border border-border/50">
                Null
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            <div className="px-3 py-1.5 bg-muted rounded-full text-xs sm:text-sm text-muted-foreground">
              Date: {formattedDate}
            </div>
            <div className="px-3 py-1.5 bg-secondary rounded-full text-xs sm:text-sm">
              <span className="text-muted-foreground">C.Stock:</span>{' '}
              <span className="text-foreground font-semibold">{data.currentStockAtThatTime}</span>
            </div>
          </div>
        </div>

        {/* Key Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-5 sm:mb-6">
          <DetailRow label="Commodity" value={data.commodity} />
          <DetailRow label="Variety" value={varietyNamesDisplay} />
          <DetailRow label="Party Name" value={partyName} />
          <DetailRow label="Gate Pass Type" value={data.gatePassType} />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={toggleExpanded} className="w-full sm:w-auto">
            <span>{isExpanded ? 'Less Details' : 'More Details'}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 ml-2" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-2" />
            )}
          </Button>
          <div className="flex gap-2 w-full sm:w-auto justify-end sm:justify-start">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
              aria-label="Edit voucher"
            >
              <Edit className="w-4 h-4 text-primary" />
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} aria-label="Print voucher">
              <Printer className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 pb-6 sm:pb-8">
          {/* Farmer Details */}
          <section className="mb-6 sm:mb-8">
            <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-5 text-foreground">
              Farmer Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
              <DetailRow label="Name" value={partyName} />
              <DetailRow label="Address" value={address} />
              <DetailRow label="Mobile Number" value={mobileNumber} />
              {farmer?.id && <DetailRow label="Farmer ID" value={farmer.id} />}
            </div>
          </section>

          <Separator className="my-6 sm:my-8" />

          {/* Table Section - Separate table for each variety */}
          <section className="mb-6 sm:mb-8">
            <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-5 text-foreground">
              Bag Details by Variety
            </h3>
            <div className="space-y-6 sm:space-y-8">
              {varietyNamesForTables.map((varietyName) => (
                <div key={varietyName} className="space-y-3">
                  <h4 className="font-semibold text-sm sm:text-base text-foreground border-b border-border pb-2">
                    {varietyName}
                  </h4>
                  <div className="overflow-x-auto -mx-1 sm:mx-0">
                    <DataTable
                      columns={columns}
                      data={groupedTables[varietyName]}
                      enableRowSelection={false}
                      enablePagination={false}
                      enableSorting={true}
                      enableFiltering={false}
                      enableColumnVisibility={true}
                      initialColumnVisibility={columnVisibility}
                      onColumnVisibilityChange={handleColumnVisibilityChange}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Created By */}
          {data.createdBy && (
            <>
              <Separator className="my-6 sm:my-8" />
              <section className="mb-6 sm:mb-8">
                <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-5 text-foreground">
                  Created By
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
                  <DetailRow label="Name" value={data.createdBy.name} />
                  <DetailRow label="User ID" value={data.createdBy.id} />
                </div>
              </section>
            </>
          )}

          {/* Remarks */}
          {data.remarks && (
            <>
              <Separator className="my-6 sm:my-8" />
              <section>
                <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-5 text-foreground">
                  Remarks
                </h3>
                <div className="bg-muted border border-border rounded-md p-4 sm:p-5">
                  <p className="text-sm sm:text-base text-foreground leading-relaxed">
                    {data.remarks}
                  </p>
                </div>
              </section>
            </>
          )}
        </CardContent>
      )}

      {/* Edit Dialog */}
      <EditIncomingOrderDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        order={data}
      />
    </Card>
  );
}

export default memo(ReceiptVoucherCard);
