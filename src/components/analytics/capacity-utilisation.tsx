import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CapacityData {
  current: number;
  available: number;
  total: number;
  utilizationPercentage: number;
}

export function CapacityUtilization({ data }: { data: CapacityData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Capacity Utilization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm mb-1">
            <span>0%</span>
            <span className="font-medium text-center px-2">
              {data.current} / {data.total.toLocaleString()} bags ({data.utilizationPercentage}%)
            </span>
            <span>100%</span>
          </div>
          <div className="relative h-6 sm:h-8 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all"
              style={{ width: `${data.utilizationPercentage}%` }}
            />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 ml-1 sm:ml-2">
              <div className="bg-background border border-border px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold text-primary">
                {data.utilizationPercentage}%
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card>
            <CardContent className="text-center p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold mb-1">
                {data.available.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Available Space</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-primary mb-1">{data.current}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Currently Stored</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-primary mb-1">
                {data.total.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Total Capacity</div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
