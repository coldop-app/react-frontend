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
      color: 'var(--chart-1)',
    },
    'k. jyoti': {
      label: 'K. Jyoti',
      color: 'var(--chart-2)',
    },
    b101: {
      label: 'B101',
      color: 'var(--chart-3)',
    },
  } satisfies ChartConfig;

  // Map data to use chart config colors
  const chartColors = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
  ];

  const chartData = data.map((item, index) => {
    // Extract color from item.color (which may have hsl() wrapper) or use chart colors
    let fillColor = item.color;
    if (fillColor && fillColor.includes('hsl(var(--chart-')) {
      // Extract the chart variable name
      const match = fillColor.match(/--chart-(\d)/);
      if (match) {
        fillColor = `var(--chart-${match[1]})`;
      }
    }
    return {
      ...item,
      fill: fillColor || chartColors[index % chartColors.length],
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Variety Distribution</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Percentage breakdown by potato variety
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center mb-4 sm:mb-6">
          <ChartContainer
            config={chartConfig}
            className="min-h-[200px] sm:min-h-[300px] w-full max-w-[250px] sm:max-w-[300px]"
          >
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={80}
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

        <div className="space-y-3 mb-4 sm:mb-6">
          <h3 className="font-semibold text-sm sm:text-base">Variety Distribution & Insights</h3>
          {chartData.map((variety, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: variety.fill }}
                />
                <span className="text-xs sm:text-sm truncate">{variety.name}</span>
              </div>
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                {variety.bags} bags ({variety.value}%)
              </span>
            </div>
          ))}
        </div>

        <Alert>
          <AlertTitle className="text-sm sm:text-base">Distribution Insights</AlertTitle>
          <AlertDescription className="space-y-1 text-xs sm:text-sm">
            <div>• Himalini is the most stored variety at 87.7% of all inventory</div>
            <div>• Top 2 varieties account for 100.0% of inventory</div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
