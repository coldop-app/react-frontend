import React, { useState, useCallback, useMemo } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  User,
  Package,
  Truck,
  IndianRupee,
  FileDown,
  Printer,
  ChevronDown,
  ChevronUp,
  Search,
} from 'lucide-react';
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
  const [farmerFilter, setFarmerFilter] = useState('');

  const filteredData = useMemo(() => {
    if (!farmerFilter.trim()) return data;
    const q = farmerFilter.trim().toLowerCase();
    return data.filter((row) => row.farmerName.toLowerCase().includes(q));
  }, [data, farmerFilter]);

  const totalIncomingQty = (row: FarmerSummaryRow) =>
    (row.incomingBreakdown ?? []).reduce((s, b) => s + b.quantity, 0);
  const totalOutgoingQty = (row: FarmerSummaryRow) =>
    (row.outgoingBreakdown ?? []).reduce((s, b) => s + b.quantity, 0);
  const outgoingQtyByKey = (row: FarmerSummaryRow) => {
    const map = new Map<string, number>();
    (row.outgoingBreakdown ?? []).forEach((b) => {
      const key = `${b.commodity}|${b.variety}|${b.bagSize}`;
      map.set(key, (map.get(key) ?? 0) + b.quantity);
    });
    return map;
  };

  const exportCsv = useCallback(() => {
    const rows: string[] = [];
    rows.push(
      ['#', 'Farmer Name', 'Total Incoming (qty)', 'Total Outgoing (qty)', 'Rent Paid', 'Rent Due']
        .map(escapeCsvCell)
        .join(',')
    );
    filteredData.forEach((row, idx) => {
      rows.push(
        [
          idx + 1,
          row.farmerName,
          totalIncomingQty(row),
          totalOutgoingQty(row),
          row.rentPaid,
          row.rentDue,
        ]
          .map(escapeCsvCell)
          .join(',')
      );
    });
    rows.push('');
    rows.push('Incoming breakdown (Variety, Bag size, Quantity)');
    rows.push(
      ['Farmer Name', 'Commodity', 'Variety', 'Bag Size', 'Quantity'].map(escapeCsvCell).join(',')
    );
    filteredData.forEach((row) => {
      (row.incomingBreakdown ?? []).forEach((b) => {
        rows.push(
          [row.farmerName, b.commodity, b.variety, b.bagSize, b.quantity]
            .map(escapeCsvCell)
            .join(',')
        );
      });
    });
    rows.push('');
    rows.push('Outgoing breakdown (Variety, Bag size, Quantity)');
    rows.push(
      ['Farmer Name', 'Commodity', 'Variety', 'Bag Size', 'Quantity'].map(escapeCsvCell).join(',')
    );
    filteredData.forEach((row) => {
      (row.outgoingBreakdown ?? []).forEach((b) => {
        rows.push(
          [row.farmerName, b.commodity, b.variety, b.bagSize, b.quantity]
            .map(escapeCsvCell)
            .join(',')
        );
      });
    });
    const blob = new Blob(['\uFEFF' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `farmer-summary-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredData]);

  const handlePrint = useCallback(() => {
    const incomingRows = filteredData.flatMap((row) => {
      const outByKey = new Map<string, number>();
      (row.outgoingBreakdown ?? []).forEach((b) => {
        const key = `${b.commodity}|${b.variety}|${b.bagSize}`;
        outByKey.set(key, (outByKey.get(key) ?? 0) + b.quantity);
      });
      return (row.incomingBreakdown ?? []).map((b) => {
        const key = `${b.commodity}|${b.variety}|${b.bagSize}`;
        const remaining = Math.max(0, b.quantity - (outByKey.get(key) ?? 0));
        return `<tr><td>${escapeHtml(row.farmerName)}</td><td>Incoming</td><td>${escapeHtml(b.commodity)}</td><td>${escapeHtml(b.variety)}</td><td>${escapeHtml(b.bagSize)}</td><td class="num">${b.quantity}</td><td class="num">${remaining}</td></tr>`;
      });
    });
    const outgoingRows = filteredData.flatMap((row) =>
      (row.outgoingBreakdown ?? []).map(
        (b) =>
          `<tr><td>${escapeHtml(row.farmerName)}</td><td>Outgoing</td><td>${escapeHtml(b.commodity)}</td><td>${escapeHtml(b.variety)}</td><td>${escapeHtml(b.bagSize)}</td><td class="num">${b.quantity}</td><td class="num">—</td></tr>`
      )
    );
    const bodyHtml = `
      <div class="print-section">
        <h3>Summary</h3>
        <table class="print-table">
          <thead><tr><th>#</th><th>Farmer name</th><th class="num">Total incoming (qty)</th><th class="num">Total outgoing (qty)</th><th class="num">Rent paid</th><th class="num">Rent due</th></tr></thead>
          <tbody>
            ${filteredData
              .map(
                (row, idx) =>
                  `<tr><td>${idx + 1}</td><td>${escapeHtml(row.farmerName)}</td><td class="num">${(row.incomingBreakdown ?? []).reduce((s, b) => s + b.quantity, 0)}</td><td class="num">${(row.outgoingBreakdown ?? []).reduce((s, b) => s + b.quantity, 0)}</td><td class="num">${formatCurrency(row.rentPaid)}</td><td class="num">${formatCurrency(row.rentDue)}</td></tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>
      <div class="print-section">
        <h3>Incoming (variety & bag size)</h3>
        <table class="print-table">
          <thead><tr><th>Farmer</th><th>Type</th><th>Commodity</th><th>Variety</th><th>Bag size</th><th class="num">Quantity</th><th class="num">Remaining</th></tr></thead>
          <tbody>${incomingRows.length ? incomingRows.join('') : '<tr><td colspan="7">No data</td></tr>'}</tbody>
        </table>
      </div>
      <div class="print-section">
        <h3>Outgoing (variety & bag size)</h3>
        <table class="print-table">
          <thead><tr><th>Farmer</th><th>Type</th><th>Commodity</th><th>Variety</th><th>Bag size</th><th class="num">Quantity</th><th class="num">Remaining</th></tr></thead>
          <tbody>${outgoingRows.length ? outgoingRows.join('') : '<tr><td colspan="7">No data</td></tr>'}</tbody>
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
  }, [filteredData]);

  if (!data?.length) return null;

  return (
    <Card>
      <CardHeader className="pb-4 px-4 sm:pb-6 sm:px-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base sm:text-xl">Farmer Summary</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Incoming/outgoing orders and rent (paid vs due) per farmer. Variety and bag size
                breakdown below.
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
          {/* Farmer filter */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <Label
                htmlFor="farmer-summary-filter"
                className="text-sm font-medium text-muted-foreground"
              >
                Filter by farmer
              </Label>
            </div>
            <Input
              id="farmer-summary-filter"
              type="text"
              placeholder="Search by farmer name..."
              value={farmerFilter}
              onChange={(e) => setFarmerFilter(e.target.value)}
              className="max-w-xs h-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        {/* Mobile card list */}
        <div className="sm:hidden space-y-3 px-4">
          {filteredData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No farmers match the filter.
            </p>
          ) : (
            filteredData.map((row, idx) => (
              <Card key={row.farmerStorageLinkId} className="overflow-hidden">
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">#{idx + 1}</span>
                    <span className="font-medium text-sm">{row.farmerName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Package className="h-3.5 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Incoming (qty):</span>
                      <span>{totalIncomingQty(row)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Outgoing (qty):</span>
                      <span>{totalOutgoingQty(row)}</span>
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
                  {(row.incomingBreakdown?.length ?? 0) > 0 && (
                    <div className="pt-2 border-t text-xs">
                      <p className="font-medium text-muted-foreground mb-1">
                        Incoming (variety, size, qty, remaining)
                      </p>
                      {(row.incomingBreakdown ?? []).map((b, i) => {
                        const outByKey = outgoingQtyByKey(row);
                        const key = `${b.commodity}|${b.variety}|${b.bagSize}`;
                        const remaining = Math.max(0, b.quantity - (outByKey.get(key) ?? 0));
                        return (
                          <div key={i} className="flex gap-2 flex-wrap">
                            <span>{b.variety}</span>
                            <span>{b.bagSize}</span>
                            <span>qty: {b.quantity}</span>
                            <span className="text-muted-foreground">rem: {remaining}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {(row.outgoingBreakdown?.length ?? 0) > 0 && (
                    <div className="pt-2 border-t text-xs">
                      <p className="font-medium text-muted-foreground mb-1">
                        Outgoing (variety, size, qty)
                      </p>
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
            ))
          )}
        </div>

        {/* Desktop table with expandable breakdown (shadcn Card layout) */}
        <div className="hidden sm:block overflow-x-auto rounded-lg border">
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
                <TableHead className="text-right">Total incoming (qty)</TableHead>
                <TableHead className="text-right">Total outgoing (qty)</TableHead>
                <TableHead className="text-right">Rent paid</TableHead>
                <TableHead className="text-right">Rent due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No farmers match the filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row, idx) => {
                  const hasBreakdown =
                    (row.incomingBreakdown?.length ?? 0) > 0 ||
                    (row.outgoingBreakdown?.length ?? 0) > 0;
                  const isExpanded = expandedId === row.farmerStorageLinkId;
                  return (
                    <React.Fragment key={row.farmerStorageLinkId}>
                      <TableRow
                        className={hasBreakdown ? 'cursor-pointer hover:bg-muted/50' : ''}
                        onClick={() =>
                          hasBreakdown &&
                          setExpandedId((id) =>
                            id === row.farmerStorageLinkId ? null : row.farmerStorageLinkId
                          )
                        }
                      >
                        <TableCell className="w-10 align-middle">
                          {hasBreakdown ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 -ml-1 rounded-md pointer-events-none"
                              aria-hidden
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-muted-foreground font-medium align-middle">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="font-medium align-middle">{row.farmerName}</TableCell>
                        <TableCell className="text-right align-middle">
                          {totalIncomingQty(row)}
                        </TableCell>
                        <TableCell className="text-right align-middle">
                          {totalOutgoingQty(row)}
                        </TableCell>
                        <TableCell className="text-right text-green-600 font-medium align-middle">
                          {formatCurrency(row.rentPaid)}
                        </TableCell>
                        <TableCell className="text-right text-destructive font-medium align-middle">
                          {formatCurrency(row.rentDue)}
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={7} className="p-0 border-b border-border/50">
                            <div className="bg-muted/20 px-4 py-4">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <Card className="overflow-hidden border shadow-none bg-background/80">
                                  <CardHeader className="py-3 px-4">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                      <Package className="h-4 w-4 text-muted-foreground" />
                                      Incoming
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                      Variety, bag size, quantity
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent className="px-4 pb-4 pt-0">
                                    {(row.incomingBreakdown?.length ?? 0) > 0 ? (
                                      (() => {
                                        const outByKey = outgoingQtyByKey(row);
                                        return (
                                          <div className="rounded-md border">
                                            <Table>
                                              <TableHeader>
                                                <TableRow>
                                                  <TableHead className="text-xs">
                                                    Commodity
                                                  </TableHead>
                                                  <TableHead className="text-xs">Variety</TableHead>
                                                  <TableHead className="text-xs">
                                                    Bag size
                                                  </TableHead>
                                                  <TableHead className="text-right text-xs">
                                                    Qty
                                                  </TableHead>
                                                  <TableHead className="text-right text-xs">
                                                    Remaining
                                                  </TableHead>
                                                </TableRow>
                                              </TableHeader>
                                              <TableBody>
                                                {(row.incomingBreakdown ?? []).map((b, i) => {
                                                  const key = `${b.commodity}|${b.variety}|${b.bagSize}`;
                                                  const outQty = outByKey.get(key) ?? 0;
                                                  const remaining = Math.max(
                                                    0,
                                                    b.quantity - outQty
                                                  );
                                                  return (
                                                    <TableRow key={i}>
                                                      <TableCell className="text-xs py-2">
                                                        {b.commodity}
                                                      </TableCell>
                                                      <TableCell className="text-xs py-2">
                                                        {b.variety}
                                                      </TableCell>
                                                      <TableCell className="text-xs py-2">
                                                        {b.bagSize}
                                                      </TableCell>
                                                      <TableCell className="text-right text-xs py-2 font-medium">
                                                        {b.quantity}
                                                      </TableCell>
                                                      <TableCell className="text-right text-xs py-2 text-muted-foreground">
                                                        {remaining}
                                                      </TableCell>
                                                    </TableRow>
                                                  );
                                                })}
                                              </TableBody>
                                            </Table>
                                          </div>
                                        );
                                      })()
                                    ) : (
                                      <p className="text-xs text-muted-foreground py-2">
                                        No incoming breakdown
                                      </p>
                                    )}
                                  </CardContent>
                                </Card>
                                <Card className="overflow-hidden border shadow-none bg-background/80">
                                  <CardHeader className="py-3 px-4">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                      <Truck className="h-4 w-4 text-muted-foreground" />
                                      Outgoing
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                      Variety, bag size, quantity
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent className="px-4 pb-4 pt-0">
                                    {(row.outgoingBreakdown?.length ?? 0) > 0 ? (
                                      <div className="rounded-md border">
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead className="text-xs">Commodity</TableHead>
                                              <TableHead className="text-xs">Variety</TableHead>
                                              <TableHead className="text-xs">Bag size</TableHead>
                                              <TableHead className="text-right text-xs">
                                                Qty
                                              </TableHead>
                                              <TableHead className="text-right text-xs">
                                                Remaining
                                              </TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {(row.outgoingBreakdown ?? []).map((b, i) => (
                                              <TableRow key={i}>
                                                <TableCell className="text-xs py-2">
                                                  {b.commodity}
                                                </TableCell>
                                                <TableCell className="text-xs py-2">
                                                  {b.variety}
                                                </TableCell>
                                                <TableCell className="text-xs py-2">
                                                  {b.bagSize}
                                                </TableCell>
                                                <TableCell className="text-right text-xs py-2 font-medium">
                                                  {b.quantity}
                                                </TableCell>
                                                <TableCell className="text-right text-xs py-2 text-muted-foreground">
                                                  —
                                                </TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    ) : (
                                      <p className="text-xs text-muted-foreground py-2">
                                        No outgoing breakdown
                                      </p>
                                    )}
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
