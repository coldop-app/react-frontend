import { useState, useMemo, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronUp, ChevronDown, Printer } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';

import type { DaybookOrder } from '@/types/daybook';

// ------------------ Types ------------------

interface TableRow {
  variety: string;
  size: string;
  quantityBefore: string;
  quantityRemoved: string;
  quantityAfter: string;
  weight: string;
  chamber: string;
  floor: string;
  row: string;
  rVoucher: string;
}

interface DeliveryVoucherCardProps {
  data: DaybookOrder;
}

// ------------------ Detail Row ------------------

const DetailRow = memo(({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-xs text-muted-foreground mb-1">{label}</div>
    <div className="font-semibold text-sm lg:text-base text-foreground">{value}</div>
  </div>
));
DetailRow.displayName = 'DetailRow';

// ------------------ Table Columns ------------------

const createTableColumns = (): ColumnDef<TableRow>[] => [
  { accessorKey: 'variety', header: 'Variety' },
  { accessorKey: 'size', header: 'Size' },
  { accessorKey: 'quantityBefore', header: 'Qty Before' },
  {
    accessorKey: 'quantityRemoved',
    header: 'Qty Removed',
    cell: ({ row }) => (
      <span className="font-bold text-destructive">{row.original.quantityRemoved}</span>
    ),
  },
  {
    accessorKey: 'quantityAfter',
    header: 'Qty After',
    cell: ({ row }) => <span className="font-bold text-primary">{row.original.quantityAfter}</span>,
  },
  { accessorKey: 'weight', header: 'Weight (kg)' },
  { accessorKey: 'chamber', header: 'Chamber' },
  { accessorKey: 'floor', header: 'Floor' },
  { accessorKey: 'row', header: 'Row' },
  {
    accessorKey: 'incomingOrderId',
    header: 'R. Voucher',
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-1">
        <div className="w-2 h-2 bg-primary rounded-full" />
        <span>{row.original.rVoucher}</span>
      </div>
    ),
  },
];

// ------------------ Utility ------------------

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

// ------------------ Main Component ------------------

function DeliveryVoucherCard({ data }: DeliveryVoucherCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // ------------------ Table Data ------------------

  const tableRows = useMemo((): TableRow[] => {
    const rows: TableRow[] = [];

    data.varieties.forEach((variety) => {
      variety.bagSizes.forEach((bagSize) => {
        const quantityBefore = bagSize.quantityInit;
        const quantityAfter = bagSize.quantityCurr;
        const quantityRemoved = quantityBefore - quantityAfter;

        rows.push({
          variety: variety.name,
          size: bagSize.name,
          quantityBefore: quantityBefore.toString(),
          quantityRemoved: quantityRemoved.toString(),
          quantityAfter: quantityAfter.toString(),
          weight: bagSize.approxWeight?.toFixed(2) ?? 'N/A',
          chamber: bagSize.chamber,
          floor: bagSize.floor,
          row: bagSize.row,
          rVoucher: bagSize.incomingOrderId?.toString() ?? 'N/A',
        });
      });
    });

    const totalBags =
      data.totalBags ??
      data.varieties.reduce(
        (sum, variety) =>
          sum +
          variety.bagSizes.reduce(
            (bagSum, bag) => bagSum + (bag.quantityInit - bag.quantityCurr),
            0
          ),
        0
      );

    const totalWeight =
      data.totalWeight ??
      data.varieties.reduce(
        (sum, variety) =>
          sum +
          variety.bagSizes.reduce((bagSum, bag) => {
            const removed = bag.quantityInit - bag.quantityCurr;
            const weightPerBag =
              bag.approxWeight && bag.quantityInit > 0 ? bag.approxWeight / bag.quantityInit : 0;
            return bagSum + removed * weightPerBag;
          }, 0),
        0
      );

    if (rows.length > 0) {
      rows.push({
        variety: 'Total',
        size: '-',
        quantityBefore: '-',
        quantityRemoved: totalBags.toString(),
        quantityAfter: '-',
        weight: totalWeight > 0 ? totalWeight.toFixed(2) : 'N/A',
        chamber: '-',
        floor: '-',
        row: '-',
        rVoucher: '-',
      });
    }

    return rows;
  }, [data]);

  const columns = useMemo(() => createTableColumns(), []);

  // ------------------ Farmer Details ------------------

  const farmer = data.farmerStorageLink?.farmer;
  const partyName = farmer?.name ?? 'N/A';
  const address = farmer?.address ?? 'N/A';
  const mobileNumber = farmer?.mobileNumber ?? 'N/A';

  const formattedDate = useMemo(() => formatDate(data.createdAt), [data.createdAt]);
  const varietyNames = useMemo(
    () => data.varieties.map((v) => v.name).join(', ') || 'N/A',
    [data.varieties]
  );

  const isNullVoucher = !data.varieties || data.varieties.length === 0;

  // ------------------ Render ------------------

  return (
    <Card
      className={`overflow-hidden transition-opacity ${isNullVoucher && !isExpanded ? 'opacity-50' : ''}`}
    >
      <CardHeader className="pb-4 sm:pb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 bg-destructive rounded-full mt-0.5" />
            <h2 className="text-lg font-bold">
              Delivery Voucher: <span className="text-destructive">{data.gatePassNumber}</span>
            </h2>
            {isNullVoucher && !isExpanded && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-muted rounded border">Null</span>
            )}
          </div>

          <div className="flex gap-2">
            <div className="px-3 py-1.5 bg-muted rounded-full text-xs">Date: {formattedDate}</div>
            <div className="px-3 py-1.5 bg-secondary rounded-full text-xs">
              C.Stock: <span className="font-semibold">{data.currentStockAtThatTime}</span>
            </div>
          </div>
        </div>

        {/* Basic Details */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <DetailRow label="Commodity" value={data.commodity} />
          <DetailRow label="Variety" value={varietyNames} />
          <DetailRow label="Party Name" value={partyName} />
          <DetailRow label="Gate Pass Type" value={data.gatePassType} />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={toggleExpanded}>
            {isExpanded ? 'Less Details' : 'More Details'}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 ml-2" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-2" />
            )}
          </Button>

          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          {/* Farmer */}
          <section className="mb-8">
            <h3 className="font-bold mb-4">Farmer Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <DetailRow label="Name" value={partyName} />
              <DetailRow label="Address" value={address} />
              <DetailRow label="Mobile Number" value={mobileNumber} />
              {farmer?.id && <DetailRow label="Farmer ID" value={farmer.id} />}
            </div>
          </section>

          <Separator className="my-8" />

          {/* Table */}
          <section className="mb-8">
            <h3 className="font-bold mb-4">Bag Details by Variety</h3>
            <DataTable
              columns={columns}
              data={tableRows}
              enableRowSelection={false}
              enablePagination={false}
              enableSorting
              enableFiltering={false}
              enableColumnVisibility
            />
          </section>

          {/* Totals */}
          <div className="bg-muted/50 rounded-lg p-6 mb-8">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex justify-between">
                <span className="font-bold">Total Bags</span>
                <span className="font-bold text-destructive">
                  {tableRows.at(-1)?.quantityRemoved}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Total Weight</span>
                <span className="font-bold text-destructive">{tableRows.at(-1)?.weight} kg</span>
              </div>
            </div>
          </div>

          {/* Created By */}
          {data.createdBy && (
            <>
              <Separator className="my-8" />
              <section className="mb-8">
                <h3 className="font-bold mb-4">Created By</h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  <DetailRow label="Name" value={data.createdBy.name} />
                  <DetailRow label="User ID" value={data.createdBy.id} />
                </div>
              </section>
            </>
          )}

          {/* Remarks */}
          {data.remarks && (
            <>
              <Separator className="my-8" />
              <section>
                <h3 className="font-bold mb-4">Remarks</h3>
                <div className="bg-muted border rounded-md p-5">
                  <p className="text-sm">{data.remarks}</p>
                </div>
              </section>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default memo(DeliveryVoucherCard);
