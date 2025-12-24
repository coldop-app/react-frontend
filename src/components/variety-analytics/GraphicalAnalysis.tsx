import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  Cell as PieCell,
} from 'recharts';
import type { AggregatedSizeData, LocationChartData, FarmerChartData } from './types';

interface GraphicalAnalysisProps {
  sizeData: AggregatedSizeData[];
  locationData: LocationChartData[];
  farmerData: FarmerChartData[];
}

const chartColors = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

export function GraphicalAnalysis({ sizeData, locationData, farmerData }: GraphicalAnalysisProps) {
  const [yAxisWidth, setYAxisWidth] = useState(100);
  const [tickFontSize, setTickFontSize] = useState(12);

  // Adjust YAxis width based on screen size
  useEffect(() => {
    const updateWidth = () => {
      const isMobile = window.innerWidth < 640;
      setYAxisWidth(isMobile ? 70 : 100);
      setTickFontSize(isMobile ? 10 : 12);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const sizeChartConfig = {
    quantity: {
      label: 'Quantity',
      color: 'var(--chart-1)',
    },
  } satisfies ChartConfig;

  const locationChartConfig = {
    quantity: {
      label: 'Quantity',
      color: 'var(--chart-2)',
    },
  } satisfies ChartConfig;

  const farmerChartConfig = {
    share: {
      label: 'Share',
      color: 'var(--chart-3)',
    },
  } satisfies ChartConfig;

  // Prepare size chart data
  const sizeChartData = sizeData.map((item, index) => ({
    ...item,
    fill: chartColors[index % chartColors.length],
  }));

  // Prepare location chart data
  const locationChartData = locationData.map((item, index) => ({
    ...item,
    fill: chartColors[index % chartColors.length],
  }));

  // Prepare farmer chart data
  const farmerChartData = farmerData.map((item, index) => ({
    ...item,
    fill: chartColors[index % chartColors.length],
  }));

  // Calculate insights for Size-wise Distribution
  const totalSizeQuantity = sizeChartData.reduce((sum, item) => sum + item.totalCurrent, 0);
  const sortedSizes = [...sizeChartData].sort((a, b) => b.totalCurrent - a.totalCurrent);
  const topSize = sortedSizes[0];
  const topSizePercentage =
    totalSizeQuantity > 0 ? ((topSize?.totalCurrent / totalSizeQuantity) * 100).toFixed(1) : '0.0';
  const top2SizesTotal = sortedSizes.slice(0, 2).reduce((sum, item) => sum + item.totalCurrent, 0);
  const top2SizesPercentage =
    totalSizeQuantity > 0 ? ((top2SizesTotal / totalSizeQuantity) * 100).toFixed(1) : '0.0';

  // Calculate insights for Location-wise Quantity
  const totalLocationQuantity = locationChartData.reduce((sum, item) => sum + item.totalCurrent, 0);
  const sortedLocations = [...locationChartData].sort((a, b) => b.totalCurrent - a.totalCurrent);
  const topLocation = sortedLocations[0];
  const topLocationPercentage =
    totalLocationQuantity > 0
      ? ((topLocation?.totalCurrent / totalLocationQuantity) * 100).toFixed(1)
      : '0.0';

  // Calculate insights for Farmer-wise Share
  const sortedFarmers = [...farmerChartData].sort((a, b) => b.value - a.value);
  const topFarmer = sortedFarmers[0];
  const top2FarmersTotal = sortedFarmers.slice(0, 2).reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Size-wise Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Size-wise Distribution</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Aggregate quantities by size
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={sizeChartConfig}
            className="min-h-[250px] sm:min-h-[300px] w-full"
          >
            <BarChart data={sizeChartData} layout="vertical">
              <CartesianGrid vertical={false} />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: tickFontSize }}
              />
              <YAxis
                type="category"
                dataKey="size"
                tickLine={false}
                axisLine={false}
                width={yAxisWidth}
                tickMargin={8}
                tick={{ fontSize: tickFontSize }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="totalCurrent" radius={[0, 4, 4, 0]}>
                {sizeChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>

          <Alert className="mt-4">
            <AlertTitle className="text-sm sm:text-base">Size Distribution Insights</AlertTitle>
            <AlertDescription className="space-y-1 text-xs sm:text-sm">
              {topSize && (
                <div>
                  • {topSize.size} is the most stored size at {topSizePercentage}% of all inventory
                </div>
              )}
              {sortedSizes.length >= 2 && (
                <div>• Top 2 sizes account for {top2SizesPercentage}% of inventory</div>
              )}
              <div>• Total quantity across all sizes: {totalSizeQuantity.toLocaleString()}</div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Location-wise Quantity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Location-wise Quantity</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Stock distribution by location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={locationChartConfig}
            className="min-h-[250px] sm:min-h-[300px] w-full"
          >
            <BarChart data={locationChartData} layout="vertical">
              <CartesianGrid vertical={false} />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: tickFontSize }}
              />
              <YAxis
                type="category"
                dataKey="location"
                tickLine={false}
                axisLine={false}
                width={yAxisWidth}
                tickMargin={8}
                tick={{ fontSize: tickFontSize }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="totalCurrent" radius={[0, 4, 4, 0]}>
                {locationChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>

          <Alert className="mt-4">
            <AlertTitle className="text-sm sm:text-base">Location Distribution Insights</AlertTitle>
            <AlertDescription className="space-y-1 text-xs sm:text-sm">
              {topLocation && (
                <div>
                  • {topLocation.location} has the highest stock at {topLocationPercentage}% of
                  total inventory
                </div>
              )}
              <div>• Total locations: {locationChartData.length}</div>
              <div>
                • Total quantity across all locations: {totalLocationQuantity.toLocaleString()}
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Farmer-wise Share */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Farmer-wise Share</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Percentage breakdown by farmer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <ChartContainer
              config={farmerChartConfig}
              className="mx-auto w-full max-w-[85%] aspect-square pb-2 sm:max-w-[75%] md:max-w-[65%] lg:max-w-[250px]"
            >
              <PieChart>
                <Pie
                  data={farmerChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {farmerChartData.map((entry, index) => (
                    <PieCell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </div>

          <div className="space-y-3">
            {farmerChartData.map((farmer, idx) => (
              <div key={idx} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: farmer.fill }}
                  />
                  <span className="truncate text-xs sm:text-sm">{farmer.name}</span>
                </div>
                <span className="whitespace-nowrap text-xs font-medium sm:text-sm">
                  {farmer.totalCurrent.toLocaleString()} ({farmer.value.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>

          <Alert className="mt-4">
            <AlertTitle className="text-sm sm:text-base">Farmer Share Insights</AlertTitle>
            <AlertDescription className="space-y-1 text-xs sm:text-sm">
              {topFarmer && (
                <div>
                  • {topFarmer.name} is the top contributor with {topFarmer.value.toFixed(1)}% of
                  total inventory
                </div>
              )}
              {sortedFarmers.length >= 2 && (
                <div>• Top 2 farmers account for {top2FarmersTotal.toFixed(1)}% of inventory</div>
              )}
              <div>• Total farmers: {farmerChartData.length}</div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
