import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useStore } from '@/stores/store';
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Settings2, ChevronDown } from 'lucide-react';
import type { CommoditySummary } from '@/types/analytics';

type TabType = 'current' | 'initial' | 'outgoing';

interface StockSummaryTableProps {
  data: CommoditySummary[];
}

export function StockSummaryTable({ data }: StockSummaryTableProps) {
  const { coldStorage } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('current');
  const initializedBagSizesRef = useRef<Set<string>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    // Initialize with all columns visible by default
    return new Set(['commodity', 'variety', 'total']);
  });

  // Handle cell click for navigation
  const handleCellClick = useCallback(
    (commodity: string, variety: string, bagSize?: string) => {
      navigate({
        to: '/store-admin/variety-breakdown',
        search: {
          commodity,
          variety,
          ...(bagSize && { bagSize }),
        },
      });
    },
    [navigate]
  );

  // Get commodity order from preferences
  const commodityOrder = useMemo(() => {
    return coldStorage?.preferences?.commodities?.map((c) => c.name) ?? [];
  }, [coldStorage?.preferences?.commodities]);

  // Sort commodities by preference order
  const sortedCommodities = useMemo(() => {
    const sorted = [...data];
    sorted.sort((a, b) => {
      const indexA = commodityOrder.indexOf(a.commodity);
      const indexB = commodityOrder.indexOf(b.commodity);
      // If commodity not found in order, put it at the end
      if (indexA === -1 && indexB === -1) return a.commodity.localeCompare(b.commodity);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
    return sorted;
  }, [data, commodityOrder]);

  // Get all unique bag sizes across all commodities, ordered by preferences
  // Uses the order from the first commodity (in sorted order) that contains each size
  const allBagSizes = useMemo(() => {
    const sizeSet = new Set<string>();
    const sizeOrderMap = new Map<string, { commodityIndex: number; sizeIndex: number }>();

    // First, collect all sizes from data
    sortedCommodities.forEach((commodity) => {
      commodity.varieties.forEach((variety) => {
        variety.bagSizes.forEach((bagSize) => {
          sizeSet.add(bagSize.size);
        });
      });
    });

    // Get size order from preferences for each commodity, using the first commodity's order for each size
    sortedCommodities.forEach((commodity, commodityIndex) => {
      const prefSizes =
        coldStorage?.preferences?.commodities?.find((c) => c.name === commodity.commodity)?.sizes ??
        [];
      prefSizes.forEach((size, sizeIndex) => {
        if (sizeSet.has(size) && !sizeOrderMap.has(size)) {
          sizeOrderMap.set(size, { commodityIndex, sizeIndex });
        }
      });
    });

    // Sort sizes: preference-ordered first (by commodity order, then size order within commodity), then others alphabetically
    const orderedSizes: string[] = [];
    const unorderedSizes: string[] = [];

    Array.from(sizeSet).forEach((size) => {
      if (sizeOrderMap.has(size)) {
        orderedSizes.push(size);
      } else {
        unorderedSizes.push(size);
      }
    });

    orderedSizes.sort((a, b) => {
      const orderA = sizeOrderMap.get(a)!;
      const orderB = sizeOrderMap.get(b)!;
      // First sort by commodity index, then by size index within commodity
      if (orderA.commodityIndex !== orderB.commodityIndex) {
        return orderA.commodityIndex - orderB.commodityIndex;
      }
      return orderA.sizeIndex - orderB.sizeIndex;
    });

    unorderedSizes.sort();

    return [...orderedSizes, ...unorderedSizes];
  }, [sortedCommodities, coldStorage?.preferences?.commodities]);

  // Transform data into table rows
  const tableRows = useMemo(() => {
    const rows: Array<{
      commodity: string;
      variety: string;
      [key: string]: string | number; // Dynamic bag size columns
    }> = [];

    sortedCommodities.forEach((commodity) => {
      // Get bag size order for this specific commodity
      const commoditySizeOrder =
        coldStorage?.preferences?.commodities?.find((c) => c.name === commodity.commodity)?.sizes ??
        [];

      // Sort varieties (alphabetically for now, can be enhanced with variety preferences)
      const sortedVarieties = [...commodity.varieties].sort((a, b) =>
        a.varietyName.localeCompare(b.varietyName)
      );

      sortedVarieties.forEach((variety) => {
        const row: {
          commodity: string;
          variety: string;
          [key: string]: string | number;
        } = {
          commodity: commodity.commodity,
          variety: variety.varietyName,
        };

        // Sort bag sizes by commodity-specific order
        const sortedBagSizes = [...variety.bagSizes].sort((a, b) => {
          const indexA = commoditySizeOrder.indexOf(a.size);
          const indexB = commoditySizeOrder.indexOf(b.size);
          // If size not found in order, put it at the end
          if (indexA === -1 && indexB === -1) return a.size.localeCompare(b.size);
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });

        // Add bag size values
        allBagSizes.forEach((size) => {
          const bagSize = sortedBagSizes.find((bs) => bs.size === size);
          if (bagSize) {
            if (activeTab === 'current') {
              row[size] = bagSize.totalCurrent;
            } else if (activeTab === 'initial') {
              row[size] = bagSize.totalInitial;
            } else {
              row[size] = bagSize.totalOutgoing;
            }
          } else {
            row[size] = 0;
          }
        });

        // Calculate total
        const total = sortedBagSizes.reduce((sum, bs) => {
          if (activeTab === 'current') {
            return sum + bs.totalCurrent;
          } else if (activeTab === 'initial') {
            return sum + bs.totalInitial;
          } else {
            return sum + bs.totalOutgoing;
          }
        }, 0);
        row.total = total;

        rows.push(row);
      });
    });

    return rows;
  }, [sortedCommodities, allBagSizes, activeTab, coldStorage?.preferences?.commodities]);

  // Initialize visible columns with all bag sizes when they're first computed
  useEffect(() => {
    // Check if there are new bag sizes that need to be added
    const hasNewSizes = allBagSizes.some((size) => !initializedBagSizesRef.current.has(size));

    if (hasNewSizes) {
      // Update the ref to track initialized sizes
      allBagSizes.forEach((size) => {
        initializedBagSizesRef.current.add(size);
      });

      // Update visible columns in the next tick to avoid cascading renders
      requestAnimationFrame(() => {
        setVisibleColumns((prev) => {
          const newSet = new Set(prev);
          // Add all bag sizes to visible columns if not already present
          allBagSizes.forEach((size) => {
            newSet.add(size);
          });
          // Ensure commodity, variety, and total are always visible
          newSet.add('commodity');
          newSet.add('variety');
          newSet.add('total');
          return newSet;
        });
      });
    }
  }, [allBagSizes]);

  // Get visible bag sizes in order
  const visibleBagSizes = useMemo(() => {
    return allBagSizes.filter((size) => visibleColumns.has(size));
  }, [allBagSizes, visibleColumns]);

  // Calculate totals (only for visible columns)
  const totals = useMemo(() => {
    const totalsObj: { [key: string]: number } = { total: 0 };
    visibleBagSizes.forEach((size) => {
      totalsObj[size] = 0;
    });

    tableRows.forEach((row) => {
      visibleBagSizes.forEach((size) => {
        totalsObj[size] += (row[size] as number) || 0;
      });
      totalsObj.total += (row.total as number) || 0;
    });

    return totalsObj;
  }, [tableRows, visibleBagSizes]);

  // Calculate overall totals for tabs
  const overallTotals = useMemo(() => {
    let current = 0;
    let initial = 0;
    let outgoing = 0;

    sortedCommodities.forEach((commodity) => {
      commodity.varieties.forEach((variety) => {
        variety.bagSizes.forEach((bagSize) => {
          current += bagSize.totalCurrent;
          initial += bagSize.totalInitial;
          outgoing += bagSize.totalOutgoing;
        });
      });
    });

    return { current, initial, outgoing };
  }, [sortedCommodities]);

  // Toggle column visibility
  const toggleColumn = useCallback((column: string) => {
    setVisibleColumns((prev) => {
      const newSet = new Set(prev);
      // Don't allow hiding variety or total (but allow commodity to be hidden)
      if (column === 'total' || column === 'variety') {
        return prev;
      }
      if (newSet.has(column)) {
        newSet.delete(column);
      } else {
        newSet.add(column);
      }
      return newSet;
    });
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0">
          <div className="flex-1">
            <CardTitle className="text-lg sm:text-xl">Stock Summary</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              View stock quantities by current inventory, initial quantities, or outgoing
              quantities.
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="gap-2 self-start sm:self-auto">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Custom Analytics</span>
            <span className="sm:hidden">Analytics</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="mb-4">
          <TabsList className="w-full sm:w-auto flex-wrap">
            <TabsTrigger value="current" className="text-xs sm:text-sm">
              Current ({overallTotals.current.toLocaleString()})
            </TabsTrigger>
            <TabsTrigger value="initial" className="text-xs sm:text-sm">
              Initial ({overallTotals.initial.toLocaleString()})
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="text-xs sm:text-sm">
              Outgoing ({overallTotals.outgoing.toLocaleString()})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <h3 className="font-semibold text-sm sm:text-base capitalize">
              {activeTab === 'current'
                ? 'Current Stock'
                : activeTab === 'initial'
                  ? 'Initial Stock'
                  : 'Outgoing Stock'}
            </h3>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Columns</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.has('commodity')}
                    onCheckedChange={() => toggleColumn('commodity')}
                  >
                    Commodity
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  {allBagSizes.map((size) => (
                    <DropdownMenuCheckboxItem
                      key={size}
                      checked={visibleColumns.has(size)}
                      onCheckedChange={() => toggleColumn(size)}
                    >
                      {size}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" className="gap-2 self-start sm:self-auto">
                <span className="hidden sm:inline">Print Report</span>
                <span className="sm:hidden">Print</span>
              </Button>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Stock quantities by commodity, variety and size. Click on any cell with quantity to view
            detailed breakdown.
          </p>

          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.has('commodity') && (
                    <TableHead className="min-w-[120px]">Commodity</TableHead>
                  )}
                  <TableHead className="min-w-[120px]">Variety</TableHead>
                  {visibleBagSizes.map((size) => (
                    <TableHead key={size} className="text-center min-w-[100px]">
                      {size}
                    </TableHead>
                  ))}
                  <TableHead className="text-center min-w-[80px]">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableRows.map((row, idx) => (
                  <TableRow key={idx}>
                    {visibleColumns.has('commodity') && (
                      <TableCell className="font-medium">{row.commodity}</TableCell>
                    )}
                    <TableCell className="font-medium">{row.variety}</TableCell>
                    {visibleBagSizes.map((size) => {
                      const value = (row[size] as number) || 0;
                      return (
                        <TableCell
                          key={size}
                          className="text-center cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleCellClick(row.commodity, row.variety, size)}
                        >
                          {value > 0 ? (
                            <span className="text-primary font-medium">{value}</span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell
                      className="text-center cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleCellClick(row.commodity, row.variety)}
                    >
                      {(row.total as number) > 0 ? (
                        <span className="text-primary font-medium">{row.total}</span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50">
                  <TableCell
                    colSpan={visibleColumns.has('commodity') ? 2 : 1}
                    className="font-semibold"
                  >
                    Bag Total
                  </TableCell>
                  {visibleBagSizes.map((size) => (
                    <TableCell key={size} className="text-center font-semibold">
                      {totals[size] || 0}
                    </TableCell>
                  ))}
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
