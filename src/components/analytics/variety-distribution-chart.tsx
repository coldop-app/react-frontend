import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface VarietyData {
  name: string;
  value: number;
  bags: number;
  color: string;
}

export function VarietyDistributionChart({ data }: { data: VarietyData[] }) {
  const chartConfig = {
    himalini: {
      label: 'Himalini',
      color: 'hsl(var(--chart-1))',
    },
    'k. jyoti': {
      label: 'K. Jyoti',
      color: 'hsl(var(--chart-2))',
    },
    b101: {
      label: 'B101',
      color: 'hsl(var(--chart-3))',
    },
  } satisfies ChartConfig;

  // Map data to use chart config colors
  const chartData = data.map((item, index) => {
    const nameKey = item.name
      .toLowerCase()
      .replace(/\./g, '')
      .replace(/\s+/g, '') as keyof typeof chartConfig;
    const chartColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];
    return {
      ...item,
      fill: chartConfig[nameKey]?.color || chartColors[index % chartColors.length],
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Variety Distribution</CardTitle>
        <CardDescription>Percentage breakdown by potato variety</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center mb-6">
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full max-w-[300px]">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        </div>

        <div className="space-y-3 mb-6">
          <h3 className="font-semibold">Variety Distribution & Insights</h3>
          {chartData.map((variety, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: variety.fill }} />
                <span className="text-sm">{variety.name}</span>
              </div>
              <span className="text-sm font-medium">
                {variety.bags} bags ({variety.value}%)
              </span>
            </div>
          ))}
        </div>

        <Alert>
          <AlertTitle>Distribution Insights</AlertTitle>
          <AlertDescription className="space-y-1">
            <div>• Himalini is the most stored variety at 87.7% of all inventory</div>
            <div>• Top 2 varieties account for 100.0% of inventory</div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
