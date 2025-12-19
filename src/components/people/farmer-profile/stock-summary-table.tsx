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
import { Box } from 'lucide-react';

interface StockSummaryTableProps {
  summary: CommodityStockSummary;
}

interface TableDataProps {
  data: CommodityStockSummary['current'];
  bagSizes: string[];
}

export interface CellClickData {
  variety: string;
  column: string;
  value: number;
  rowIndex: number;
  isTotal: boolean;
}

function StockSummaryTableContent({ data, bagSizes }: TableDataProps) {
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
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleCellClick(row.variety, 'variety', 0, idx, false)}
                >
                  {row.variety}
                </TableCell>
                {bagSizes.map((size) => (
                  <TableCell
                    key={size}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() =>
                      handleCellClick(row.variety, size, row[size] as number, idx, false)
                    }
                  >
                    {row[size] as number}
                  </TableCell>
                ))}
                <TableCell
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
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
                  className="font-bold cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => handleCellClick('Total', 'variety', 0, -1, true)}
                >
                  Total
                </TableCell>
                {bagSizes.map((size) => (
                  <TableCell
                    key={size}
                    className="font-bold cursor-pointer hover:bg-muted transition-colors"
                    onClick={() =>
                      handleCellClick('Total', size, totalsRow[0][size] as number, -1, true)
                    }
                  >
                    {totalsRow[0][size] as number}
                  </TableCell>
                ))}
                <TableCell
                  className="font-bold cursor-pointer hover:bg-muted transition-colors"
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

      <AlertDialog open={!!alertData} onOpenChange={() => setAlertData(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cell Information</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <div>
                <strong>Variety:</strong> {alertData?.variety}
              </div>
              <div>
                <strong>Column:</strong> {alertData?.column}
              </div>
              <div>
                <strong>Value:</strong> {alertData?.value}
              </div>
              <div>
                <strong>Row Type:</strong> {alertData?.isTotal ? 'Total Row' : 'Data Row'}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function StockSummaryTable({ summary }: StockSummaryTableProps) {
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
          <StockSummaryTableContent data={summary.current} bagSizes={summary.bagSizes} />
        </TabsContent>
        <TabsContent value="initial" className="mt-4">
          <StockSummaryTableContent data={summary.initial} bagSizes={summary.bagSizes} />
        </TabsContent>
        <TabsContent value="outgoing" className="mt-4">
          <StockSummaryTableContent data={summary.outgoing} bagSizes={summary.bagSizes} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
