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

  const chartColors = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
  ];

  const chartData = data.map((item, index) => {
    let fillColor = item.color;

    if (fillColor?.includes('hsl(var(--chart-')) {
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

  // Calculate insights dynamically
  const sortedVarieties = [...chartData].sort((a, b) => b.value - a.value);
  const topVariety = sortedVarieties[0];
  const top2VarietiesTotal = sortedVarieties.slice(0, 2).reduce((sum, v) => sum + v.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Variety Distribution</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Percentage breakdown by potato variety
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="w-full">
          <ChartContainer
            config={chartConfig}
            className="mx-auto w-full max-w-[85%] aspect-square pb-2 sm:max-w-[75%] md:max-w-[65%] lg:max-w-[55%]"
          >
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius="80%"
                paddingAngle={1}
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

        <div className="mb-4 space-y-3 sm:mb-6">
          <h3 className="text-sm font-semibold sm:text-base">Variety Distribution & Insights</h3>

          {chartData.map((variety, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <div
                  className="h-3 w-3 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: variety.fill }}
                />
                <span className="truncate text-xs sm:text-sm">{variety.name}</span>
              </div>

              <span className="whitespace-nowrap text-xs font-medium sm:text-sm">
                {variety.bags.toLocaleString()} bags ({variety.value}%)
              </span>
            </div>
          ))}
        </div>

        <Alert>
          <AlertTitle className="text-sm sm:text-base">Distribution Insights</AlertTitle>
          <AlertDescription className="space-y-1 text-xs sm:text-sm">
            {topVariety && (
              <div>
                • {topVariety.name} is the most stored variety at {topVariety.value.toFixed(1)}% of
                all inventory
              </div>
            )}
            {sortedVarieties.length >= 2 && (
              <div>• Top 2 varieties account for {top2VarietiesTotal.toFixed(1)}% of inventory</div>
            )}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
