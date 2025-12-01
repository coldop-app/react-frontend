import { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { CommodityStockSummary } from './helpers';
import { Box } from 'lucide-react';

interface StockSummaryTableProps {
  summary: CommodityStockSummary;
}

interface TableDataProps {
  data: CommodityStockSummary['current'];
  bagSizes: string[];
}

function StockSummaryTableContent({ data, bagSizes }: TableDataProps) {
  // Separate data rows from totals row
  const { dataRows, totalsRow } = useMemo(() => {
    const regularRows = data.filter((row) => row.variety !== 'Total');
    const totalRow = data.find((row) => row.variety === 'Total');
    return {
      dataRows: regularRows,
      totalsRow: totalRow ? [totalRow] : [],
    };
  }, [data]);

  return (
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
            <TableRow key={`${row.variety}-${idx}`}>
              <TableCell>{row.variety}</TableCell>
              {bagSizes.map((size) => (
                <TableCell key={size}>{row[size] as number}</TableCell>
              ))}
              <TableCell>{row.total as number}</TableCell>
            </TableRow>
          ))}
          {totalsRow.length > 0 && (
            <TableRow className="bg-muted/50">
              <TableCell className="font-bold">Total</TableCell>
              {bagSizes.map((size) => (
                <TableCell key={size} className="font-bold">
                  {totalsRow[0][size] as number}
                </TableCell>
              ))}
              <TableCell className="font-bold">{totalsRow[0].total as number}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
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
