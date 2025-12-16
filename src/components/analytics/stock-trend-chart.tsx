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
      color: 'var(--chart-1)',
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0">
          <div className="flex-1">
            <CardTitle className="text-lg sm:text-xl">Stock Trend Analysis</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Track how your stock levels changed over time with individual voucher transactions
            </CardDescription>
          </div>
          <div className="flex gap-1.5 sm:gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              Individual
            </Button>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              By Date
            </Button>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              Monthly
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[250px] sm:min-h-[400px] w-full">
          <LineChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={60}
              tick={{ fontSize: 9 }}
              tickMargin={6}
              interval="preserveStartEnd"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
              tickMargin={6}
              tick={{ fontSize: 9 }}
              width={50}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={2}
              dot={{ fill: 'var(--color-value)', r: 2 }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <div className="text-xs sm:text-sm text-muted-foreground">
            Zoomed: 16th Feb 25 - 17th Nov 25
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
              <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
              <Maximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
