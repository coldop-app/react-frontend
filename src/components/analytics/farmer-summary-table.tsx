import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { User, Package, Truck, IndianRupee, FileDown, Printer, ChevronDown, ChevronUp } from 'lucide-react';
import type { FarmerSummaryRow } from '@/types/analytics';
import { wrapPrintDocument, escapeHtml } from '@/lib/print-layout';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

function escapeCsvCell(val: string | number): string {
  const s = String(val);
  if (/[,"\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function FarmerSummaryTable({ data }: { data: FarmerSummaryRow[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const exportCsv = useCallback(() => {
    const rows: string[] = [];
    rows.push(
      ['#', 'Farmer Name', 'Total Incoming', 'Total Outgoing', 'Rent Paid', 'Rent Due'].map(escapeCsvCell).join(',')
    );
    data.forEach((row, idx) => {
      rows.push(
        [
          idx + 1,
          row.farmerName,
          row.totalIncomingOrders,
          row.totalOutgoingOrders,
          row.rentPaid,
          row.rentDue,
        ].map(escapeCsvCell).join(',')
      );
    });
    rows.push('');
    rows.push('Incoming breakdown (Variety, Bag size, Quantity)');
    rows.push(['Farmer Name', 'Commodity', 'Variety', 'Bag Size', 'Quantity'].map(escapeCsvCell).join(','));
    data.forEach((row) => {
      (row.incomingBreakdown ?? []).forEach((b) => {
        rows.push([row.farmerName, b.commodity, b.variety, b.bagSize, b.quantity].map(escapeCsvCell).join(','));
      });
    });
    rows.push('');
    rows.push('Outgoing breakdown (Variety, Bag size, Quantity)');
    rows.push(['Farmer Name', 'Commodity', 'Variety', 'Bag Size', 'Quantity'].map(escapeCsvCell).join(','));
    data.forEach((row) => {
      (row.outgoingBreakdown ?? []).forEach((b) => {
        rows.push([row.farmerName, b.commodity, b.variety, b.bagSize, b.quantity].map(escapeCsvCell).join(','));
      });
    });
    const blob = new Blob(['\uFEFF' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `farmer-summary-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const handlePrint = useCallback(() => {
    const incomingRows = data.flatMap((row) =>
      (row.incomingBreakdown ?? []).map(
        (b) =>
          `<tr><td>${escapeHtml(row.farmerName)}</td><td>Incoming</td><td>${escapeHtml(b.commodity)}</td><td>${escapeHtml(b.variety)}</td><td>${escapeHtml(b.bagSize)}</td><td class="num">${b.quantity}</td></tr>`
      )
    );
    const outgoingRows = data.flatMap((row) =>
      (row.outgoingBreakdown ?? []).map(
        (b) =>
          `<tr><td>${escapeHtml(row.farmerName)}</td><td>Outgoing</td><td>${escapeHtml(b.commodity)}</td><td>${escapeHtml(b.variety)}</td><td>${escapeHtml(b.bagSize)}</td><td class="num">${b.quantity}</td></tr>`
      )
    );
    const bodyHtml = `
      <div class="print-section">
        <h3>Summary</h3>
        <table class="print-table">
          <thead><tr><th>#</th><th>Farmer name</th><th class="num">Total incoming</th><th class="num">Total outgoing</th><th class="num">Rent paid</th><th class="num">Rent due</th></tr></thead>
          <tbody>
            ${data
              .map(
                (row, idx) =>
                  `<tr><td>${idx + 1}</td><td>${escapeHtml(row.farmerName)}</td><td class="num">${row.totalIncomingOrders}</td><td class="num">${row.totalOutgoingOrders}</td><td class="num">${formatCurrency(row.rentPaid)}</td><td class="num">${formatCurrency(row.rentDue)}</td></tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>
      <div class="print-section">
        <h3>Incoming (variety & bag size)</h3>
        <table class="print-table">
          <thead><tr><th>Farmer</th><th>Type</th><th>Commodity</th><th>Variety</th><th>Bag size</th><th class="num">Quantity</th></tr></thead>
          <tbody>${incomingRows.length ? incomingRows.join('') : '<tr><td colspan="6">No data</td></tr>'}</tbody>
        </table>
      </div>
      <div class="print-section">
        <h3>Outgoing (variety & bag size)</h3>
        <table class="print-table">
          <thead><tr><th>Farmer</th><th>Type</th><th>Commodity</th><th>Variety</th><th>Bag size</th><th class="num">Quantity</th></tr></thead>
          <tbody>${outgoingRows.length ? outgoingRows.join('') : '<tr><td colspan="6">No data</td></tr>'}</tbody>
        </table>
      </div>
    `;
    const html = wrapPrintDocument({
      title: 'Farmer Summary',
      subtitle: 'Incoming/outgoing orders and rent (paid vs due) per farmer',
      bodyHtml,
    });
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  }, [data]);

  if (!data?.length) return null;

  return (
    <Card>
      <CardHeader className="pb-4 px-4 sm:pb-6 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-base sm:text-xl">Farmer Summary</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Incoming/outgoing orders and rent (paid vs due) per farmer. Variety and bag size breakdown below.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCsv} className="gap-2">
              <FileDown className="h-4 w-4" />
              Export Excel (CSV)
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </div>
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
                    <span className="text-green-600 font-medium">{formatCurrency(row.rentPaid)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IndianRupee className="h-3.5 w-3 text-destructive" />
                    <span className="text-muted-foreground">Rent due:</span>
                    <span className="text-destructive font-medium">{formatCurrency(row.rentDue)}</span>
                  </div>
                </div>
                {(row.incomingBreakdown?.length ?? 0) > 0 && (
                  <div className="pt-2 border-t text-xs">
                    <p className="font-medium text-muted-foreground mb-1">Incoming (variety, size, qty)</p>
                    {(row.incomingBreakdown ?? []).map((b, i) => (
                      <div key={i} className="flex gap-2">
                        <span>{b.variety}</span>
                        <span>{b.bagSize}</span>
                        <span>{b.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}
                {(row.outgoingBreakdown?.length ?? 0) > 0 && (
                  <div className="pt-2 border-t text-xs">
                    <p className="font-medium text-muted-foreground mb-1">Outgoing (variety, size, qty)</p>
                    {(row.outgoingBreakdown ?? []).map((b, i) => (
                      <div key={i} className="flex gap-2">
                        <span>{b.variety}</span>
                        <span>{b.bagSize}</span>
                        <span>{b.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Desktop table with expandable breakdown */}
        <div className="hidden sm:block overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
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
                <React.Fragment key={row.farmerStorageLinkId}>
                  <TableRow
                    key={row.farmerStorageLinkId}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      setExpandedId((id) => (id === row.farmerStorageLinkId ? null : row.farmerStorageLinkId))
                    }
                  >
                    <TableCell className="w-10">
                      {(row.incomingBreakdown?.length ?? 0) > 0 || (row.outgoingBreakdown?.length ?? 0) > 0 ? (
                        expandedId === row.farmerStorageLinkId ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )
                      ) : null}
                    </TableCell>
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
                  {expandedId === row.farmerStorageLinkId && (
                    <TableRow key={`${row.farmerStorageLinkId}-detail`}>
                      <TableCell colSpan={7} className="bg-muted/30 p-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Incoming (variety, bag size, quantity)</h4>
                            {(row.incomingBreakdown?.length ?? 0) > 0 ? (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Commodity</TableHead>
                                    <TableHead>Variety</TableHead>
                                    <TableHead>Bag size</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {(row.incomingBreakdown ?? []).map((b, i) => (
                                    <TableRow key={i}>
                                      <TableCell>{b.commodity}</TableCell>
                                      <TableCell>{b.variety}</TableCell>
                                      <TableCell>{b.bagSize}</TableCell>
                                      <TableCell className="text-right">{b.quantity}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <p className="text-sm text-muted-foreground">No incoming breakdown</p>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Outgoing (variety, bag size, quantity)</h4>
                            {(row.outgoingBreakdown?.length ?? 0) > 0 ? (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Commodity</TableHead>
                                    <TableHead>Variety</TableHead>
                                    <TableHead>Bag size</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {(row.outgoingBreakdown ?? []).map((b, i) => (
                                    <TableRow key={i}>
                                      <TableCell>{b.commodity}</TableCell>
                                      <TableCell>{b.variety}</TableCell>
                                      <TableCell>{b.bagSize}</TableCell>
                                      <TableCell className="text-right">{b.quantity}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <p className="text-sm text-muted-foreground">No outgoing breakdown</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

