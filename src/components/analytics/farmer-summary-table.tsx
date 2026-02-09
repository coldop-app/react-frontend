import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { User, Package, Truck, IndianRupee } from 'lucide-react';
import type { FarmerSummaryRow } from '@/types/analytics';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function FarmerSummaryTable({ data }: { data: FarmerSummaryRow[] }) {
  if (!data?.length) return null;

  return (
    <Card>
      <CardHeader className="pb-4 px-4 sm:pb-6 sm:px-6">
        <CardTitle className="text-base sm:text-xl">Farmer Summary</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Incoming/outgoing orders and rent (paid vs due) per farmer
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        {/* Mobile card list */}
        <div className="sm:hidden space-y-3 px-4">
          {data.map((row, idx) => (
            <Card key={row.farmerStorageLinkId} className="overflow-hidden">
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">#{idx + 1}</span>
                  <span className="font-medium text-sm">{row.farmerName}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Package className="h-3.5 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Incoming:</span>
                    <span>{row.totalIncomingOrders}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Outgoing:</span>
                    <span>{row.totalOutgoingOrders}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IndianRupee className="h-3.5 w-3 text-green-600" />
                    <span className="text-muted-foreground">Rent paid:</span>
                    <span className="text-green-600 font-medium">
                      {formatCurrency(row.rentPaid)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IndianRupee className="h-3.5 w-3 text-destructive" />
                    <span className="text-muted-foreground">Rent due:</span>
                    <span className="text-destructive font-medium">
                      {formatCurrency(row.rentDue)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead className="min-w-[140px]">
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Farmer name
                  </span>
                </TableHead>
                <TableHead className="text-right">Total incoming</TableHead>
                <TableHead className="text-right">Total outgoing</TableHead>
                <TableHead className="text-right">Rent paid</TableHead>
                <TableHead className="text-right">Rent due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow key={row.farmerStorageLinkId}>
                  <TableCell className="text-muted-foreground font-medium">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{row.farmerName}</TableCell>
                  <TableCell className="text-right">{row.totalIncomingOrders}</TableCell>
                  <TableCell className="text-right">{row.totalOutgoingOrders}</TableCell>
                  <TableCell className="text-right text-green-600 font-medium">
                    {formatCurrency(row.rentPaid)}
                  </TableCell>
                  <TableCell className="text-right text-destructive font-medium">
                    {formatCurrency(row.rentDue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
