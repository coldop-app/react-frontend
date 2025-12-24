import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';

interface FarmerData {
  name: string;
  bags: number;
  storageShare: number;
}

export function TopFarmersChart({ data }: { data: FarmerData[] }) {
  const [yAxisWidth, setYAxisWidth] = useState(120);
  const [tickFontSize, setTickFontSize] = useState(12);

  // Adjust YAxis width based on screen size
  useEffect(() => {
    const updateWidth = () => {
      const isMobile = window.innerWidth < 640;
      setYAxisWidth(isMobile ? 70 : 120);
      setTickFontSize(isMobile ? 10 : 12);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const chartConfig = {
    bags: {
      label: 'Bags',
      color: 'var(--chart-1)',
    },
  } satisfies ChartConfig;

  // Map data with colors for each farmer
  const chartColors = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
  ];

  const chartData = data.map((item, index) => ({
    ...item,
    fill: chartColors[index % chartColors.length],
  }));

  // Calculate insights
  const sortedFarmers = [...data].sort((a, b) => b.bags - a.bags);
  const topFarmer = sortedFarmers[0];
  const top2FarmersTotal = sortedFarmers.slice(0, 2).reduce((sum, f) => sum + f.storageShare, 0);
  const totalBags = data.reduce((sum, farmer) => sum + farmer.bags, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Top Farmers</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Farmers with the highest storage inventory
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="min-h-[250px] sm:min-h-[300px] w-full mb-4 sm:mb-6"
        >
          <BarChart
            data={chartData}
            layout="vertical"
            accessibilityLayer
            margin={{ top: 5, right: 10, bottom: 5, left: 5 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              width={yAxisWidth}
              tickMargin={8}
              tick={{ fontSize: tickFontSize }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="bags" fill="var(--chart-1)" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>

        <div className="space-y-4">
          <h3 className="font-semibold text-sm sm:text-base">Top Farmer Insights</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-muted-foreground">Top Contributor</span>
              <span className="font-medium text-xs sm:text-sm truncate ml-2">
                {data[0]?.name || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-muted-foreground">Storage Share</span>
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {topFarmer?.storageShare.toFixed(1) || '0'}%
                </div>
                <div className="text-xs text-muted-foreground">of total inventory</div>
              </div>
            </div>
          </div>
        </div>

        <Alert className="mt-4">
          <AlertTitle className="text-sm sm:text-base">Farmer Distribution Insights</AlertTitle>
          <AlertDescription className="space-y-1 text-xs sm:text-sm">
            {topFarmer && (
              <div>
                • {topFarmer.name} is the top contributor with {topFarmer.storageShare.toFixed(1)}%
                of total inventory ({topFarmer.bags.toLocaleString()} bags)
              </div>
            )}
            {sortedFarmers.length >= 2 && (
              <div>• Top 2 farmers account for {top2FarmersTotal.toFixed(1)}% of inventory</div>
            )}
            <div>• Total bags across top farmers: {totalBags.toLocaleString()}</div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
