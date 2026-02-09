import { useMemo, useState } from 'react';
import { useStore } from '@/stores/store';
import { useAnalyticsOverview } from '@/services/base/analytics/useAnalytics';
import { SummaryCards } from './summary-cards';
import { StockSummaryTable } from './stock-summary-table';
import { CapacityUtilization } from './capacity-utilisation';
import { StockTrendChart } from './stock-trend-chart';
import { VarietyDistributionChart } from './variety-distribution-chart';
import { TopFarmersChart } from './top-farmers-chart';
import { LocationAnalyticsTable } from './location-analytics-table';
import { FarmerSummaryTable } from './farmer-summary-table';
import { CommodityBreakdown } from './commodity-breakdown';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CommoditySummary } from '@/types/analytics';

export default function AnalyticsPage() {
  const { coldStorage } = useStore();
  const { data, isLoading, isError, error, refetch, isFetching } = useAnalyticsOverview({
    coldStorageId: coldStorage?.id || '',
  });

  // Get available commodities
  const commodities = useMemo(() => {
    if (!data?.data?.commoditySummary) return [];
    return data.data.commoditySummary.map((c) => c.commodity);
  }, [data]);

  const [selectedCommodityState, setSelectedCommodityState] = useState<string>('all');

  // Derive the effective selected commodity - if only one commodity exists, use it; otherwise use state
  const selectedCommodity = useMemo(() => {
    if (commodities.length === 1) {
      return commodities[0];
    }
    // If selected commodity is not available, default to 'all'
    if (selectedCommodityState !== 'all' && !commodities.includes(selectedCommodityState)) {
      return 'all';
    }
    return selectedCommodityState;
  }, [commodities, selectedCommodityState]);

  const setSelectedCommodity = (value: string) => {
    // Only allow setting if there are multiple commodities
    if (commodities.length > 1) {
      setSelectedCommodityState(value);
    }
  };

  // Transform API data for components
  const transformedData = useMemo(() => {
    if (!data?.data || !coldStorage) return null;

    const { summary, commoditySummary, stockTrend, locationAnalytics, meta } = data.data;

    // Filter commodity summary based on selection
    const filteredCommoditySummary =
      selectedCommodity === 'all'
        ? commoditySummary
        : commoditySummary.filter((c) => c.commodity === selectedCommodity);

    // Find top varieties for selected commodity(ies)
    const allVarieties = filteredCommoditySummary.flatMap((commodity) =>
      commodity.varieties.map((variety) => ({
        commodity: commodity.commodity,
        varietyName: variety.varietyName,
        totalCurrent: variety.totalCurrent,
      }))
    );
    allVarieties.sort((a, b) => b.totalCurrent - a.totalCurrent);

    const topVariety = allVarieties[0];
    const secondVariety = allVarieties[1];

    // Filter location analytics by commodity if selected
    const filteredLocationAnalytics =
      selectedCommodity === 'all'
        ? locationAnalytics
        : locationAnalytics
            .map((location) => ({
              ...location,
              breakdownByFarmer: location.breakdownByFarmer
                .map((farmer) => ({
                  ...farmer,
                  details: farmer.details.filter(
                    (detail) => detail.commodity === selectedCommodity
                  ),
                }))
                .filter((farmer) => farmer.details.length > 0)
                .map((farmer) => ({
                  ...farmer,
                  totalCurrentBags: farmer.details.reduce(
                    (sum, detail) => sum + detail.currentQuantity,
                    0
                  ),
                })),
            }))
            .filter((location) => location.breakdownByFarmer.length > 0);

    // Find top farmer from filtered location analytics
    const farmerTotals = new Map<string, { name: string; total: number; accountNumber: number }>();
    filteredLocationAnalytics.forEach((location) => {
      location.breakdownByFarmer.forEach((farmer) => {
        const existing = farmerTotals.get(farmer.farmerId);
        if (existing) {
          existing.total += farmer.totalCurrentBags;
        } else {
          farmerTotals.set(farmer.farmerId, {
            name: farmer.farmerName,
            total: farmer.totalCurrentBags,
            accountNumber: farmer.accountNumber,
          });
        }
      });
    });
    const topFarmerEntry = Array.from(farmerTotals.values()).sort((a, b) => b.total - a.total)[0];

    // Get primary commodity for specialization
    const primaryCommodity = filteredCommoditySummary[0]?.commodity || 'Mixed';

    // Calculate filtered totals
    const filteredTotal = filteredCommoditySummary.reduce(
      (sum, commodity) => sum + commodity.totalCurrent,
      0
    );

    // Inventory stats for summary cards
    const inventoryStats = {
      total: filteredTotal,
      topVariety: {
        name: topVariety?.varietyName || 'N/A',
        count: topVariety?.totalCurrent || 0,
        percentage: filteredTotal
          ? parseFloat(((topVariety?.totalCurrent / filteredTotal) * 100).toFixed(1))
          : 0,
      },
      secondVariety: {
        name: secondVariety?.varietyName || 'N/A',
        count: secondVariety?.totalCurrent || 0,
        percentage: filteredTotal
          ? parseFloat(((secondVariety?.totalCurrent / filteredTotal) * 100).toFixed(1))
          : 0,
      },
      topFarmer: {
        name: topFarmerEntry?.name || 'N/A',
        count: topFarmerEntry?.total || 0,
        specialization: primaryCommodity,
      },
    };

    // Capacity utilization (keep overall capacity, but show filtered current)
    const capacity = {
      current: filteredTotal,
      total: coldStorage.capacity || summary.totalBagsInitial,
      available: (coldStorage.capacity || summary.totalBagsInitial) - filteredTotal,
      utilizationPercentage: coldStorage.capacity
        ? Math.round((filteredTotal / coldStorage.capacity) * 100)
        : Math.round((filteredTotal / Math.max(summary.totalBagsInitial, filteredTotal)) * 100),
    };

    // Stock summary table - pass commoditySummary directly
    const stockSummary = filteredCommoditySummary;

    // Stock trend chart
    const stockTrendData = stockTrend.map((point) => ({
      date: new Date(point.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      value: point.totalStock,
      incoming: point.incoming,
      outgoing: point.outgoing,
      color: point.netChange >= 0 ? 'var(--chart-2)' : 'var(--destructive)',
    }));

    // Variety distribution chart
    const varietyDistribution = allVarieties.slice(0, 5).map((variety, idx) => {
      const colors = [
        'var(--chart-1)',
        'var(--chart-2)',
        'var(--chart-3)',
        'var(--chart-4)',
        'var(--chart-5)',
      ];
      return {
        name: `${variety.commodity} - ${variety.varietyName}`,
        value: filteredTotal
          ? parseFloat(((variety.totalCurrent / filteredTotal) * 100).toFixed(1))
          : 0,
        bags: variety.totalCurrent,
        color: colors[idx % colors.length],
      };
    });

    // Top farmers chart
    const topFarmers = Array.from(farmerTotals.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((farmer) => ({
        name: farmer.name,
        bags: farmer.total,
        storageShare: filteredTotal
          ? parseFloat(((farmer.total / filteredTotal) * 100).toFixed(1))
          : 0,
        accountNumber: farmer.accountNumber,
      }));

    return {
      inventoryStats,
      capacity,
      stockSummary: stockSummary as CommoditySummary[],
      stockTrend: stockTrendData,
      varietyDistribution,
      topFarmers,
      locationAnalytics: filteredLocationAnalytics,
      commoditySummary: filteredCommoditySummary,
      meta,
    };
  }, [data, coldStorage, selectedCommodity]);

  // Loading state
  if (isLoading) {
    return (
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 min-h-screen">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 sm:p-6">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (isError || !transformedData) {
    return (
      <div className="p-3 sm:p-4 md:p-6 min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Failed to load analytics</h3>
              <p className="text-sm text-muted-foreground">
                {error?.message || 'An unexpected error occurred while fetching analytics data.'}
              </p>
            </div>
            <Button onClick={() => refetch()} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 min-h-screen">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Analytics Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Last updated: {new Date(transformedData.meta.generatedAt).toLocaleString()}
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="sm"
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Commodity Tabs */}
      {commodities.length > 0 && (
        <Tabs value={selectedCommodity} onValueChange={setSelectedCommodity}>
          <TabsList className="w-full justify-start overflow-x-auto">
            {commodities.length > 1 && <TabsTrigger value="all">All Commodities</TabsTrigger>}
            {commodities.map((commodity) => (
              <TabsTrigger key={commodity} value={commodity}>
                {commodity}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Summary Cards */}
      <SummaryCards data={transformedData.inventoryStats} />

      {/* Capacity Utilization */}
      <CapacityUtilization data={transformedData.capacity} />

      {/* Stock Summary Table */}
      <StockSummaryTable data={transformedData.stockSummary} />

      {/* Stock Trend Chart */}
      <StockTrendChart data={transformedData.stockTrend} />

      {/* Variety Distribution and Top Farmers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <VarietyDistributionChart data={transformedData.varietyDistribution} />
        <TopFarmersChart data={transformedData.topFarmers} />
      </div>

      {/* Location Analytics */}
      <LocationAnalyticsTable data={transformedData.locationAnalytics} />

      {/* Farmer Summary (orders + rent) */}
      {data?.data?.farmerSummary && data.data.farmerSummary.length > 0 && (
        <FarmerSummaryTable data={data.data.farmerSummary} />
      )}

      {/* Commodity Breakdown - Only show if more than one commodity */}
      {commodities.length > 1 && <CommodityBreakdown data={transformedData.commoditySummary} />}
    </div>
  );
}
