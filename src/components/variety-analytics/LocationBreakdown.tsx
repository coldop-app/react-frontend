import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SizeTable } from './SizeTable';
import type { VarietyAnalysisLocation } from '@/types/analytics';

interface LocationBreakdownProps {
  locations: VarietyAnalysisLocation[];
}

export function LocationBreakdown({ locations }: LocationBreakdownProps) {
  const sortedLocations = [...locations].sort((a, b) => b.totalCurrent - a.totalCurrent);

  if (sortedLocations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No locations found</p>
        </CardContent>
      </Card>
    );
  }

  const formatLocation = (location: VarietyAnalysisLocation['location']) => {
    return `${location.chamber} / ${location.floor} / ${location.row}`;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Location-wise Breakdown</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Detailed inventory breakdown by storage location
            </p>
          </div>
          <Separator />
          <Accordion type="single" collapsible className="w-full">
            {sortedLocations.map((location, index) => {
              const locationKey = `${location.location.chamber}-${location.location.floor}-${location.location.row}-${index}`;
              return (
                <AccordionItem key={locationKey} value={locationKey}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatLocation(location.location)}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {location.totalCurrent.toLocaleString()} bags
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-4 space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Initial</p>
                          <p className="font-medium">{location.totalInitial.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Current</p>
                          <p className="font-medium">{location.totalCurrent.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Outgoing</p>
                          <p className="font-medium">{location.totalOutgoing.toLocaleString()}</p>
                        </div>
                      </div>
                      <SizeTable sizes={location.sizes} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}
