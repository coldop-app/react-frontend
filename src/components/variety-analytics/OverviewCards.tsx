import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { VarietyAnalysisData } from '@/types/analytics';
import { calculateTotalQuantity } from './utils';

interface OverviewCardsProps {
  data: VarietyAnalysisData;
}

export function OverviewCards({ data }: OverviewCardsProps) {
  const totalQuantity = calculateTotalQuantity(data.farmers);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Commodity</p>
            <div>
              <Badge variant="secondary" className="text-base px-3 py-1">
                {data.commodity}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Variety</p>
            <div>
              <Badge variant="secondary" className="text-base px-3 py-1">
                {data.variety}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Total Quantity</p>
            <p className="text-3xl font-bold">{totalQuantity.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">bags</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
