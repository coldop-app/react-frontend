import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';

interface FarmerData {
  name: string;
  bags: number;
  storageShare: number;
}

export function TopFarmersChart({ data }: { data: FarmerData[] }) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Farmers</CardTitle>
        <CardDescription>Farmers with the highest storage inventory</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full mb-6">
          <BarChart data={chartData} layout="vertical" accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              width={120}
              tickMargin={8}
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
          <h3 className="font-semibold">Top Farmer Insights</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Top Contributor</span>
              <span className="font-medium">{data[0].name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Storage Share</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{data[0].storageShare}%</div>
                <div className="text-xs text-muted-foreground">of total inventory</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
