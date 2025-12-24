import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useVarietyAnalysis } from '@/services/base/analytics/useVarietyAnalysis';
import { OverviewCards } from '@/components/variety-analytics/OverviewCards';
import { GraphicalAnalysis } from '@/components/variety-analytics/GraphicalAnalysis';
import { FarmerBreakdown } from '@/components/variety-analytics/FarmerBreakdown';
import { LocationBreakdown } from '@/components/variety-analytics/LocationBreakdown';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  aggregateSizesByFarmers,
  prepareLocationChartData,
  prepareFarmerChartData,
  calculateTotalQuantity,
  filterFarmersBySize,
  filterLocationsBySize,
} from '@/components/variety-analytics/utils';

interface VarietyAnalyticsPageProps {
  storageId: string;
  commodity: string;
  variety: string;
  bagSize?: string;
}

export const VarietyAnalyticsPage = ({
  storageId,
  commodity,
  variety,
  bagSize,
}: VarietyAnalyticsPageProps) => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch, isFetching } = useVarietyAnalysis({
    storageId,
    commodity,
    variety,
  });

  // Get all available bag sizes from the data with their total quantities
  const { availableBagSizes, bagSizeTotals } = useMemo(() => {
    if (!data?.data) return { availableBagSizes: [], bagSizeTotals: new Map<string, number>() };

    const sizeMap = new Map<string, number>();
    const sizeSet = new Set<string>();

    data.data.farmers.forEach((farmer) => {
      farmer.sizes.forEach((size) => {
        if (size.totalCurrent > 0) {
          sizeSet.add(size.size);
          const currentTotal = sizeMap.get(size.size) || 0;
          sizeMap.set(size.size, currentTotal + size.totalCurrent);
        }
      });
    });

    const sortedSizes = Array.from(sizeSet).sort((a, b) => {
      // Try to sort by numeric value if possible
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.localeCompare(b);
    });

    return {
      availableBagSizes: sortedSizes,
      bagSizeTotals: sizeMap,
    };
  }, [data]);

  // Transform data for components, filtering by bagSize if provided
  const transformedData = useMemo(() => {
    if (!data?.data) return null;

    let varietyData = data.data;

    // Filter by bagSize if provided
    if (bagSize) {
      varietyData = {
        ...varietyData,
        farmers: filterFarmersBySize(varietyData.farmers, bagSize),
        locations: filterLocationsBySize(varietyData.locations, bagSize),
      };
    }

    const totalQuantity = calculateTotalQuantity(varietyData.farmers);

    return {
      varietyData,
      sizeData: aggregateSizesByFarmers(varietyData.farmers),
      locationData: prepareLocationChartData(varietyData.locations),
      farmerData: prepareFarmerChartData(varietyData.farmers, totalQuantity),
    };
  }, [data, bagSize]);

  // Handle bag size tab change
  const handleBagSizeChange = (newBagSize: string) => {
    navigate({
      to: '/store-admin/variety-breakdown',
      search: {
        commodity,
        variety,
        bagSize: newBagSize === 'all' ? undefined : newBagSize,
      },
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 min-h-screen">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-32" />
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
              <h3 className="font-semibold text-lg mb-2">Failed to load variety analysis</h3>
              <p className="text-sm text-muted-foreground">
                {error?.message || 'An unexpected error occurred while fetching variety data.'}
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Variety Analysis</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Detailed inventory breakdown for {commodity} - {variety}
            {bagSize && ` - ${bagSize}`}
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

      {/* Bag Size Tabs */}
      {availableBagSizes.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Filter by Bag Size</h3>

              <Tabs value={bagSize || 'all'} onValueChange={handleBagSizeChange} className="w-full">
                <TabsList
                  className="
              w-full
              flex
              flex-wrap
              gap-1.5
              p-1
              h-auto
              justify-start
              bg-muted/50
            "
                >
                  {/* All Sizes */}
                  <TabsTrigger
                    value="all"
                    className="
                h-7
                px-2.5
                text-xs
                rounded-md
                font-normal
                data-[state=active]:bg-background
                data-[state=active]:shadow-sm
                data-[state=active]:font-medium
              "
                  >
                    All
                  </TabsTrigger>

                  {/* Individual Bag Sizes */}
                  {availableBagSizes.map((size) => {
                    const total = bagSizeTotals.get(size) || 0;

                    return (
                      <TabsTrigger
                        key={size}
                        value={size}
                        className="
                    h-7
                    px-2.5
                    text-xs
                    rounded-md
                    font-normal
                    data-[state=active]:bg-background
                    data-[state=active]:shadow-sm
                    data-[state=active]:font-medium
                  "
                      >
                        {size}
                        <span className="ml-1 text-muted-foreground">
                          ({total.toLocaleString()})
                        </span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Section */}
      <OverviewCards data={transformedData.varietyData} />

      {/* Graphical Analysis Section */}
      <GraphicalAnalysis
        sizeData={transformedData.sizeData}
        locationData={transformedData.locationData}
        farmerData={transformedData.farmerData}
      />

      {/* Farmer-wise Breakdown */}
      <FarmerBreakdown farmers={transformedData.varietyData.farmers} />

      {/* Location-wise Breakdown */}
      <LocationBreakdown locations={transformedData.varietyData.locations} />
    </div>
  );
};
