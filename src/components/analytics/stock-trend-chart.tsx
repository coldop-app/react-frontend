import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Plus, Minus, Maximize2 } from 'lucide-react';

interface TrendDataPoint {
  date: string;
  value: number;
  color: string;
}

export function StockTrendChart({ data }: { data: TrendDataPoint[] }) {
  const chartConfig = {
    value: {
      label: 'Stock Level',
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Stock Trend Analysis</CardTitle>
            <CardDescription>
              Track how your stock levels changed over time with individual voucher transactions
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              Individual
            </Button>
            <Button variant="outline" size="sm">
              By Date
            </Button>
            <Button variant="outline" size="sm">
              Monthly
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
          <LineChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 10 }}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={2}
              dot={{ fill: 'var(--color-value)', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartContainer>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Zoomed: 16th Feb 25 - 17th Nov 25</div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Minus className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
