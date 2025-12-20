import { useMemo } from 'react';
import { useVarietyAnalysis } from '@/services/base/analytics/useVarietyAnalysis';
import { OverviewCards } from '@/components/variety-analytics/OverviewCards';
import { GraphicalAnalysis } from '@/components/variety-analytics/GraphicalAnalysis';
import { FarmerBreakdown } from '@/components/variety-analytics/FarmerBreakdown';
import { LocationBreakdown } from '@/components/variety-analytics/LocationBreakdown';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  aggregateSizesByFarmers,
  prepareLocationChartData,
  prepareFarmerChartData,
  calculateTotalQuantity,
} from '@/components/variety-analytics/utils';

interface VarietyAnalyticsPageProps {
  storageId: string;
  commodity: string;
  variety: string;
}

export const VarietyAnalyticsPage = ({
  storageId,
  commodity,
  variety,
}: VarietyAnalyticsPageProps) => {
  const { data, isLoading, isError, error, refetch, isFetching } = useVarietyAnalysis({
    storageId,
    commodity,
    variety,
  });

  // Transform data for components
  const transformedData = useMemo(() => {
    if (!data?.data) return null;

    const varietyData = data.data;
    const totalQuantity = calculateTotalQuantity(varietyData.farmers);

    return {
      varietyData,
      sizeData: aggregateSizesByFarmers(varietyData.farmers),
      locationData: prepareLocationChartData(varietyData.locations),
      farmerData: prepareFarmerChartData(varietyData.farmers, totalQuantity),
    };
  }, [data]);

  // Loading state
  if (isLoading) {
    return (
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
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
