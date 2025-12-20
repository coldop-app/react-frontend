import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Size-wise Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Size-wise Distribution</CardTitle>
          <CardDescription>Aggregate quantities by size</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={sizeChartConfig} className="min-h-[300px] w-full">
            <BarChart data={sizeChartData} layout="vertical">
              <CartesianGrid vertical={false} />
              <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis
                type="category"
                dataKey="size"
                tickLine={false}
                axisLine={false}
                width={100}
                tickMargin={8}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="totalCurrent" radius={[0, 4, 4, 0]}>
                {sizeChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Location-wise Quantity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Location-wise Quantity</CardTitle>
          <CardDescription>Stock distribution by location</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={locationChartConfig} className="min-h-[300px] w-full">
            <BarChart data={locationChartData} layout="vertical">
              <CartesianGrid vertical={false} />
              <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis
                type="category"
                dataKey="location"
                tickLine={false}
                axisLine={false}
                width={100}
                tickMargin={8}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="totalCurrent" radius={[0, 4, 4, 0]}>
                {locationChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Farmer-wise Share */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Farmer-wise Share</CardTitle>
          <CardDescription>Percentage breakdown by farmer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center mb-6">
            <ChartContainer
              config={farmerChartConfig}
              className="min-h-[200px] w-full max-w-[250px]"
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
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: farmer.fill }}
                  />
                  <span className="text-sm truncate">{farmer.name}</span>
                </div>
                <span className="text-sm font-medium whitespace-nowrap">
                  {farmer.totalCurrent.toLocaleString()} ({farmer.value.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
