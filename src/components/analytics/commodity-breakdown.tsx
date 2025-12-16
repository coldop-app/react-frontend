import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Package } from 'lucide-react';
import { useState } from 'react';
import type { CommoditySummary } from '@/types/analytics';

export function CommodityBreakdown({ data }: { data: CommoditySummary[] }) {
  const [openItems, setOpenItems] = useState<string[]>([data[0]?.commodity || '']);

  const toggleItem = (commodity: string) => {
    setOpenItems((prev) =>
      prev.includes(commodity) ? prev.filter((item) => item !== commodity) : [...prev, commodity]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Commodity Breakdown</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Detailed breakdown of inventory by commodity, variety, and bag size
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((commodity) => (
          <Collapsible
            key={commodity.commodity}
            open={openItems.includes(commodity.commodity)}
            onOpenChange={() => toggleItem(commodity.commodity)}
          >
            <Card className="overflow-hidden">
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-base">{commodity.commodity}</h3>
                      <p className="text-sm text-muted-foreground">
                        {commodity.varieties.length} varieties •{' '}
                        {commodity.totalCurrent.toLocaleString()} bags
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm">
                      {commodity.totalCurrent.toLocaleString()}
                    </Badge>
                    <ChevronDown
                      className={`h-5 w-5 transition-transform ${
                        openItems.includes(commodity.commodity) ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="border-t">
                  <div className="p-4 space-y-4">
                    {commodity.varieties.map((variety) => (
                      <div key={variety.varietyName} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{variety.varietyName}</h4>
                          <Badge variant="outline">
                            {variety.totalCurrent.toLocaleString()} bags
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pl-4">
                          {variety.bagSizes.map((bagSize, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-lg bg-muted/50 border border-border/50"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-muted-foreground uppercase">
                                  {bagSize.size}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {bagSize.totalOutgoing > 0 && (
                                    <span className="text-destructive">
                                      -{bagSize.totalOutgoing}
                                    </span>
                                  )}
                                </span>
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between items-baseline">
                                  <span className="text-xs text-muted-foreground">Current</span>
                                  <span className="text-lg font-bold text-primary">
                                    {bagSize.totalCurrent.toLocaleString()}
                                  </span>
                                </div>
                                {bagSize.totalInitial !== bagSize.totalCurrent && (
                                  <div className="flex justify-between items-baseline">
                                    <span className="text-xs text-muted-foreground">Initial</span>
                                    <span className="text-xs text-muted-foreground">
                                      {bagSize.totalInitial.toLocaleString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
}
