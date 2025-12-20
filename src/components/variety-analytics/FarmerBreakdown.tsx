import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SizeTable } from './SizeTable';
import type { VarietyAnalysisFarmer } from '@/types/analytics';

interface FarmerBreakdownProps {
  farmers: VarietyAnalysisFarmer[];
}

export function FarmerBreakdown({ farmers }: FarmerBreakdownProps) {
  const sortedFarmers = [...farmers].sort((a, b) => b.totalCurrent - a.totalCurrent);

  if (sortedFarmers.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No farmers found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Farmer-wise Breakdown</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Detailed inventory breakdown by farmer
            </p>
          </div>
          <Separator />
          <Accordion type="single" collapsible className="w-full">
            {sortedFarmers.map((farmer) => (
              <AccordionItem key={farmer.farmerId} value={farmer.farmerId}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-medium">{farmer.farmerName}</span>
                    <span className="text-sm text-muted-foreground">
                      {farmer.totalCurrent.toLocaleString()} bags
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-4 space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Initial</p>
                        <p className="font-medium">{farmer.totalInitial.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Current</p>
                        <p className="font-medium">{farmer.totalCurrent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Outgoing</p>
                        <p className="font-medium">{farmer.totalOutgoing.toLocaleString()}</p>
                      </div>
                    </div>
                    <SizeTable sizes={farmer.sizes} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}
