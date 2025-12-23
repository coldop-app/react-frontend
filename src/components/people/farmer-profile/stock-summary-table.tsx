import { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import type { CommodityStockSummary } from './helpers';
import type { DaybookOrder } from '@/types/daybook';
import { Box } from 'lucide-react';

interface StockSummaryTableProps {
  summary: CommodityStockSummary;
  orders: DaybookOrder[];
}

interface TableDataProps {
  data: CommodityStockSummary['current'];
  bagSizes: string[];
  orders: DaybookOrder[];
  commodity: string;
  tabType: 'current' | 'initial' | 'outgoing';
}

export interface BreakdownEntry {
  size: string;
  location: string;
  quantity: number;
  voucherNumber: number;
}

export interface CellClickData {
  variety: string;
  column: string;
  value: number;
  rowIndex: number;
  isTotal: boolean;
}

/**
 * Gets breakdown entries for a specific variety and size from orders
 */
function getBreakdownEntries(
  orders: DaybookOrder[],
  commodity: string,
  variety: string,
  size: string | null,
  tabType: 'current' | 'initial' | 'outgoing'
): BreakdownEntry[] {
  const entries: BreakdownEntry[] = [];

  // Filter orders by commodity
  const relevantOrders = orders.filter((order) => order.commodity === commodity);

  relevantOrders.forEach((order) => {
    // Only process incoming orders for current/initial/outgoing breakdown
    if (order.type === 'incoming') {
      order.varieties.forEach((varietyData) => {
        if (varietyData.name === variety) {
          varietyData.bagSizes.forEach((bagSize) => {
            // If size is specified, only include matching sizes
            // If size is null (variety column clicked), include all sizes
            if (!size || bagSize.name === size) {
              const location = `${bagSize.chamber}/${bagSize.floor}/${bagSize.row}`;

              // Determine which quantity to use based on tab type
              let quantity = 0;
              if (tabType === 'current') {
                quantity = bagSize.quantityCurr;
              } else if (tabType === 'initial') {
                quantity = bagSize.quantityInit;
              } else if (tabType === 'outgoing') {
                quantity = bagSize.quantityInit - bagSize.quantityCurr;
              }

              // Only add entries with quantity > 0
              if (quantity > 0) {
                entries.push({
                  size: bagSize.name,
                  location,
                  quantity,
                  voucherNumber: order.gatePassNumber,
                });
              }
            }
          });
        }
      });
    }
  });

  return entries;
}

function StockSummaryTableContent({ data, bagSizes, orders, commodity, tabType }: TableDataProps) {
  const [alertData, setAlertData] = useState<CellClickData | null>(null);

  // Separate data rows from totals row
  const { dataRows, totalsRow } = useMemo(() => {
    const regularRows = data.filter((row) => row.variety !== 'Total');
    const totalRow = data.find((row) => row.variety === 'Total');
    return {
      dataRows: regularRows,
      totalsRow: totalRow ? [totalRow] : [],
    };
  }, [data]);

  const handleCellClick = (
    variety: string,
    column: string,
    value: number,
    rowIndex: number,
    isTotal: boolean
  ) => {
    setAlertData({ variety, column, value, rowIndex, isTotal });
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Varieties</TableHead>
              {bagSizes.map((size) => (
                <TableHead key={size}>{size}</TableHead>
              ))}
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataRows.map((row, idx) => (
              <TableRow key={`${row.variety}-${idx}`} className="hover:bg-transparent">
                <TableCell
                  className="cursor-pointer hover:bg-muted hover:ring-1 hover:ring-primary/20 transition-all duration-150"
                  onClick={() => handleCellClick(row.variety, 'variety', 0, idx, false)}
                >
                  {row.variety}
                </TableCell>
                {bagSizes.map((size) => (
                  <TableCell
                    key={size}
                    className="cursor-pointer hover:bg-muted hover:ring-1 hover:ring-primary/20 transition-all duration-150"
                    onClick={() =>
                      handleCellClick(row.variety, size, row[size] as number, idx, false)
                    }
                  >
                    {row[size] as number}
                  </TableCell>
                ))}
                <TableCell
                  className="cursor-pointer hover:bg-muted hover:ring-1 hover:ring-primary/20 transition-all duration-150"
                  onClick={() =>
                    handleCellClick(row.variety, 'total', row.total as number, idx, false)
                  }
                >
                  {row.total as number}
                </TableCell>
              </TableRow>
            ))}
            {totalsRow.length > 0 && (
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableCell
                  className="font-bold cursor-pointer hover:bg-muted/70 hover:ring-1 hover:ring-primary/20 transition-all duration-150"
                  onClick={() => handleCellClick('Total', 'variety', 0, -1, true)}
                >
                  Total
                </TableCell>
                {bagSizes.map((size) => (
                  <TableCell
                    key={size}
                    className="font-bold cursor-pointer hover:bg-muted/70 hover:ring-1 hover:ring-primary/20 transition-all duration-150"
                    onClick={() =>
                      handleCellClick('Total', size, totalsRow[0][size] as number, -1, true)
                    }
                  >
                    {totalsRow[0][size] as number}
                  </TableCell>
                ))}
                <TableCell
                  className="font-bold cursor-pointer hover:bg-muted/70 hover:ring-1 hover:ring-primary/20 transition-all duration-150"
                  onClick={() =>
                    handleCellClick('Total', 'total', totalsRow[0].total as number, -1, true)
                  }
                >
                  {totalsRow[0].total as number}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <BreakdownDialog
        alertData={alertData}
        onClose={() => setAlertData(null)}
        orders={orders}
        commodity={commodity}
        tabType={tabType}
      />
    </>
  );
}

interface BreakdownDialogProps {
  alertData: CellClickData | null;
  onClose: () => void;
  orders: DaybookOrder[];
  commodity: string;
  tabType: 'current' | 'initial' | 'outgoing';
}

function BreakdownDialog({ alertData, onClose, orders, commodity, tabType }: BreakdownDialogProps) {
  const breakdownEntries = useMemo(() => {
    if (!alertData) return [];

    let entries: BreakdownEntry[] = [];

    // If clicking on variety column or total row with variety column, show all sizes for that variety
    if (alertData.column === 'variety' || (alertData.isTotal && alertData.column === 'variety')) {
      entries = getBreakdownEntries(orders, commodity, alertData.variety, null, tabType);
    }
    // If clicking on total row with a size column, show all varieties for that size
    else if (alertData.isTotal && alertData.column !== 'total' && alertData.column !== 'variety') {
      // For total row, we need to aggregate across all varieties
      // Get all unique varieties from orders
      const varieties = new Set<string>();
      orders
        .filter((order) => order.commodity === commodity && order.type === 'incoming')
        .forEach((order) => {
          order.varieties.forEach((v) => varieties.add(v.name));
        });

      const allEntries: BreakdownEntry[] = [];
      varieties.forEach((variety) => {
        const varietyEntries = getBreakdownEntries(
          orders,
          commodity,
          variety,
          alertData.column,
          tabType
        );
        allEntries.push(...varietyEntries);
      });
      entries = allEntries;
    }
    // For regular cells (variety + size), show breakdown for that specific variety and size
    else if (!alertData.isTotal && alertData.column !== 'total' && alertData.column !== 'variety') {
      entries = getBreakdownEntries(
        orders,
        commodity,
        alertData.variety,
        alertData.column,
        tabType
      );
    }
    // For total column in a variety row, show all sizes for that variety
    else if (!alertData.isTotal && alertData.column === 'total') {
      entries = getBreakdownEntries(orders, commodity, alertData.variety, null, tabType);
    }

    // Sort entries by voucher number in ascending order
    return entries.sort((a, b) => a.voucherNumber - b.voucherNumber);
  }, [alertData, orders, commodity, tabType]);

  const totalQuantity = useMemo(() => {
    return breakdownEntries.reduce((sum, entry) => sum + entry.quantity, 0);
  }, [breakdownEntries]);

  if (!alertData) return null;

  // Determine title based on what was clicked
  const getTitle = () => {
    if (alertData.isTotal && alertData.column === 'variety') {
      return 'All Varieties - Total Breakdown';
    }
    if (alertData.isTotal && alertData.column !== 'total' && alertData.column !== 'variety') {
      return `Size: ${alertData.column} - Total Breakdown`;
    }
    if (alertData.column === 'variety') {
      return `Variety: ${alertData.variety} - Breakdown`;
    }
    if (alertData.column === 'total') {
      return `Variety: ${alertData.variety} - Total Breakdown`;
    }
    return `Variety: ${alertData.variety} - Size: ${alertData.column}`;
  };

  return (
    <AlertDialog open={!!alertData} onOpenChange={onClose}>
      <AlertDialogContent className="w-[95vw] max-w-3xl max-h-[85vh] flex flex-col p-0">
        <AlertDialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <AlertDialogTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-base sm:text-lg break-words">{getTitle()}</span>
            <span className="text-base sm:text-lg font-semibold text-primary whitespace-nowrap">
              Total: {totalQuantity.toLocaleString()}
            </span>
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription asChild>
          <div className="flex-1 overflow-hidden flex flex-col px-6 pb-4">
            {breakdownEntries.length === 0 ? (
              <p className="text-muted-foreground py-4">No entries found for this selection.</p>
            ) : (
              <div className="flex-1 overflow-auto -mx-2 px-2">
                <div className="rounded-md border min-w-full">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">Size</TableHead>
                          <TableHead className="text-center whitespace-nowrap">Location</TableHead>
                          <TableHead className="text-right whitespace-nowrap">Quantity</TableHead>
                          <TableHead className="text-right whitespace-nowrap">
                            Voucher Number
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {breakdownEntries.map((entry, idx) => (
                          <TableRow
                            key={`${entry.voucherNumber}-${entry.location}-${entry.size}-${idx}`}
                          >
                            <TableCell className="font-medium whitespace-nowrap">
                              {entry.size}
                            </TableCell>
                            <TableCell className="text-center whitespace-nowrap">
                              {entry.location}
                            </TableCell>
                            <TableCell className="text-right text-primary font-semibold whitespace-nowrap">
                              {entry.quantity.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              {entry.voucherNumber}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </AlertDialogDescription>
        <AlertDialogFooter className="px-6 pb-6 pt-4 flex-shrink-0">
          <AlertDialogAction>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function StockSummaryTable({ summary, orders }: StockSummaryTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Box className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">Stock Summary</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          Total Varieties: {summary.varieties.length}
        </div>
      </div>
      <Tabs defaultValue="current" className="w-full">
        <TabsList>
          <TabsTrigger value="current">Current</TabsTrigger>
          <TabsTrigger value="initial">Initial</TabsTrigger>
          <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
        </TabsList>
        <TabsContent value="current" className="mt-4">
          <StockSummaryTableContent
            data={summary.current}
            bagSizes={summary.bagSizes}
            orders={orders}
            commodity={summary.commodity}
            tabType="current"
          />
        </TabsContent>
        <TabsContent value="initial" className="mt-4">
          <StockSummaryTableContent
            data={summary.initial}
            bagSizes={summary.bagSizes}
            orders={orders}
            commodity={summary.commodity}
            tabType="initial"
          />
        </TabsContent>
        <TabsContent value="outgoing" className="mt-4">
          <StockSummaryTableContent
            data={summary.outgoing}
            bagSizes={summary.bagSizes}
            orders={orders}
            commodity={summary.commodity}
            tabType="outgoing"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
