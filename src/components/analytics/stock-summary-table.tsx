import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp } from 'lucide-react';

interface StockRow {
  variety: string;
  size40to45: number;
  sizeAbove50: number;
  total: number;
}

export function StockSummaryTable({
  data,
}: {
  data: { current: StockRow[]; initial: number; outgoing: number };
}) {
  const totals = data.current.reduce(
    (acc, row) => ({
      size40to45: acc.size40to45 + row.size40to45,
      sizeAbove50: acc.sizeAbove50 + row.sizeAbove50,
      total: acc.total + row.total,
    }),
    { size40to45: 0, sizeAbove50: 0, total: 0 }
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Stock Summary</CardTitle>
            <CardDescription>
              View stock quantities by current inventory, initial quantities, or outgoing
              quantities.
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Custom Analytics
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current" className="mb-4">
          <TabsList>
            <TabsTrigger value="current">Current ({totals.total})</TabsTrigger>
            <TabsTrigger value="initial">Initial ({data.initial.toLocaleString()})</TabsTrigger>
            <TabsTrigger value="outgoing">Outgoing ({data.outgoing.toLocaleString()})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Current Stock</h3>
            <Button variant="outline" size="sm" className="gap-2">
              Print Report
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Current inventory quantities by variety and size. Click on any cell with quantity to
            view detailed breakdown.
          </p>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Varieties</TableHead>
                  <TableHead className="text-center">40-45mm</TableHead>
                  <TableHead className="text-center">Above 50mm</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.current.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.variety}</TableCell>
                    <TableCell className="text-center">
                      {row.size40to45 > 0 ? (
                        <span className="text-primary font-medium">{row.size40to45}</span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.sizeAbove50 > 0 ? (
                        <span className="text-primary font-medium">{row.sizeAbove50}</span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.total > 0 ? (
                        <span className="text-primary font-medium">{row.total}</span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50">
                  <TableCell className="font-semibold">Bag Total</TableCell>
                  <TableCell className="text-center font-semibold">{totals.size40to45}</TableCell>
                  <TableCell className="text-center font-semibold">{totals.sizeAbove50}</TableCell>
                  <TableCell className="text-center font-semibold">{totals.total}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
